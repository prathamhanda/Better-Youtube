/**
 * SponsorManager
 * SponsorBlock integration for YouTube: fetch segments and skip them automatically.
 *
 * API: https://sponsor.ajay.app/api/skipSegments?videoID={id}&categories=[...]
 */
class SponsorManager {
  constructor(options = {}) {
    this.chromeAPIsAvailable = !!options.chromeAPIsAvailable;

    this.settings = {
      sponsorBlockEnabled: options.sponsorBlockEnabled !== false,
      // Keep UX minimal: fixed categories from the spec.
      categories: Array.isArray(options.categories)
        ? options.categories
        : ['sponsor', 'intro', 'outro', 'interaction'],
      cacheTtlMs: typeof options.cacheTtlMs === 'number' ? options.cacheTtlMs : 24 * 60 * 60 * 1000,
      toastDurationMs: typeof options.toastDurationMs === 'number' ? options.toastDurationMs : 3000
    };

    this.video = null;
    this.videoId = null;
    this.segments = [];

    this._started = false;
    this._isSkipping = false;
    this._timeUpdateBound = this._handleTimeUpdate.bind(this);

    this._observer = null;
    this._rafScheduled = false;
    this._boundScheduleCheck = null;

    this._segmentCache = new Map(); // videoId -> { fetchedAt, segments }
    this._inFlight = new Map(); // videoId -> Promise

    this._toastHostId = 'better-youtube-sponsorblock-toast-host';
    this._activeToken = 0;
  }

  async start() {
    if (this._started) return;
    if (!this.settings.sponsorBlockEnabled) return;

    this._started = true;

    this._observeSpa();

    // Initial setup (watch page direct load).
    await this._setupForCurrentVideo();
  }

  stop() {
    if (!this._started) return;
    this._started = false;

    this._cleanupVideoListener();
    this._removeToastHost();

    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    if (this._boundScheduleCheck) {
      window.removeEventListener('yt-navigate-finish', this._boundScheduleCheck, true);
      window.removeEventListener('yt-page-data-updated', this._boundScheduleCheck, true);
      this._boundScheduleCheck = null;
    }

    this.video = null;
    this.videoId = null;
    this.segments = [];
  }

  async updateSettings(newSettings = {}) {
    const oldEnabled = this.settings.sponsorBlockEnabled;

    if (typeof newSettings.sponsorBlockEnabled === 'boolean') {
      this.settings.sponsorBlockEnabled = newSettings.sponsorBlockEnabled;
    }

    if (Array.isArray(newSettings.categories) && newSettings.categories.length > 0) {
      this.settings.categories = newSettings.categories;
    }

    if (!oldEnabled && this.settings.sponsorBlockEnabled) {
      await this.start();
      return;
    }

    if (oldEnabled && !this.settings.sponsorBlockEnabled) {
      this.stop();
      return;
    }

    // If still enabled, re-setup (e.g., category changes).
    if (this.settings.sponsorBlockEnabled) {
      await this._setupForCurrentVideo({ forceRefetch: true });
    }
  }

  _observeSpa() {
    if (this._observer) return;

    const scheduleCheck = () => {
      if (!this.settings.sponsorBlockEnabled) return;
      if (this._rafScheduled) return;
      this._rafScheduled = true;
      requestAnimationFrame(async () => {
        this._rafScheduled = false;
        await this._setupForCurrentVideo();
      });
    };

    this._boundScheduleCheck = scheduleCheck;

    // YouTube SPA navigation hint events.
    window.addEventListener('yt-navigate-finish', scheduleCheck, true);
    window.addEventListener('yt-page-data-updated', scheduleCheck, true);

    // DOM mutation fallback.
    this._observer = new MutationObserver(scheduleCheck);
    const root = document.querySelector('ytd-app') || document.body || document.documentElement;
    this._observer.observe(root, { childList: true, subtree: true });
  }

  _getCurrentVideoId() {
    if (window.location.pathname !== '/watch') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('v');
  }

  _findVideoElement() {
    return (
      document.querySelector('video.html5-main-video') ||
      document.querySelector('#movie_player video') ||
      document.querySelector('video')
    );
  }

  _findPlayerContainer() {
    return document.querySelector('.html5-video-player') || document.querySelector('#movie_player');
  }

  async _setupForCurrentVideo(opts = {}) {
    if (!this.settings.sponsorBlockEnabled) return;

    const token = ++this._activeToken;

    const nextVideoId = this._getCurrentVideoId();
    if (!nextVideoId) {
      this._cleanupVideoListener();
      this.video = null;
      this.videoId = null;
      this.segments = [];
      return;
    }

    const shouldReuse = !opts.forceRefetch && nextVideoId === this.videoId && this.video && this.video.isConnected;
    if (shouldReuse) return;

    // Reset for new video.
    this._cleanupVideoListener();
    this.videoId = nextVideoId;
    this.segments = [];
    this.video = null;

    // Wait until the new video element exists (YouTube can be late).
    const videoEl = this._findVideoElement();
    if (!videoEl) return;

    this.video = videoEl;

    // Fetch segments (cached), but ignore if we navigated again.
    const segments = await this._getSegmentsForVideo(nextVideoId, { forceRefetch: !!opts.forceRefetch });
    if (token !== this._activeToken) return;

    this.segments = Array.isArray(segments) ? segments : [];

    if (this.segments.length > 0) {
      this.video.addEventListener('timeupdate', this._timeUpdateBound, true);
    }
  }

  _cleanupVideoListener() {
    if (!this.video) return;
    try {
      this.video.removeEventListener('timeupdate', this._timeUpdateBound, true);
    } catch {
      // ignore
    }
  }

  _cacheKey(videoId) {
    return `sbCache_${videoId}`;
  }

  async _readCacheFromStorage(videoId) {
    if (!this.chromeAPIsAvailable || !chrome?.storage?.local) return null;

    try {
      const key = this._cacheKey(videoId);
      const result = await chrome.storage.local.get([key]);
      const entry = result[key];
      if (!entry || typeof entry !== 'object') return null;

      const fetchedAt = entry.fetchedAt;
      const segments = entry.segments;
      if (typeof fetchedAt !== 'number' || !Array.isArray(segments)) return null;

      const age = Date.now() - fetchedAt;
      if (age > this.settings.cacheTtlMs) return null;

      return { fetchedAt, segments };
    } catch {
      return null;
    }
  }

  _writeCacheToStorage(videoId, payload) {
    if (!this.chromeAPIsAvailable || !chrome?.storage?.local) return;

    try {
      const key = this._cacheKey(videoId);
      chrome.storage.local.set({
        [key]: {
          fetchedAt: payload.fetchedAt,
          segments: payload.segments
        }
      });
    } catch {
      // ignore
    }
  }

  async _getSegmentsForVideo(videoId, { forceRefetch } = {}) {
    const now = Date.now();

    if (!forceRefetch) {
      const mem = this._segmentCache.get(videoId);
      if (mem && now - mem.fetchedAt <= this.settings.cacheTtlMs) {
        return mem.segments;
      }

      const stored = await this._readCacheFromStorage(videoId);
      if (stored) {
        this._segmentCache.set(videoId, stored);
        return stored.segments;
      }
    }

    // De-dupe concurrent fetches.
    if (this._inFlight.has(videoId)) {
      return this._inFlight.get(videoId);
    }

    const promise = this._fetchSegments(videoId)
      .then((segments) => {
        const payload = { fetchedAt: Date.now(), segments };
        this._segmentCache.set(videoId, payload);
        this._writeCacheToStorage(videoId, payload);
        return segments;
      })
      .finally(() => {
        this._inFlight.delete(videoId);
      });

    this._inFlight.set(videoId, promise);
    return promise;
  }

  async _fetchSegments(videoId) {
    try {
      const categories = JSON.stringify(this.settings.categories);
      const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=${encodeURIComponent(categories)}`;
      const response = await fetch(url, { method: 'GET' });

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      const mapped = data
        .map((item) => {
          const seg = item && item.segment;
          const category = item && item.category;
          if (!Array.isArray(seg) || seg.length < 2) return null;
          const start = Number(seg[0]);
          const end = Number(seg[1]);
          if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
          if (end <= start) return null;
          return { start, end, category: typeof category === 'string' ? category : 'segment' };
        })
        .filter(Boolean)
        .sort((a, b) => a.start - b.start);

      return mapped;
    } catch {
      return [];
    }
  }

  _handleTimeUpdate() {
    if (!this.video || !this.segments || this.segments.length === 0) return;
    if (this._isSkipping) return;

    const t = this.video.currentTime;
    if (typeof t !== 'number' || !Number.isFinite(t)) return;

    // Find first segment containing current time.
    for (const seg of this.segments) {
      // Small pre-roll buffer helps catch segments reliably.
      const start = Math.max(0, seg.start - 0.05);
      if (t >= start && t < seg.end) {
        this._isSkipping = true;

        // Skip to slightly after end to avoid landing inside boundary.
        this.video.currentTime = seg.end + 0.01;
        this._showSkipToast(seg.category);

        setTimeout(() => {
          this._isSkipping = false;
        }, 600);

        break;
      }

      // Since sorted, we can early-out.
      if (t < seg.start) break;
    }
  }

  _ensureToastHost() {
    const player = this._findPlayerContainer();
    if (!player) return null;

    let host = document.getElementById(this._toastHostId);
    if (host && host.isConnected) return host;

    host = document.createElement('div');
    host.id = this._toastHostId;
    host.style.cssText = [
      'position:absolute',
      'right:20px',
      'bottom:60px',
      'z-index:999999',
      'pointer-events:none'
    ].join(';');

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      .toast {
        pointer-events: none;
        background: rgba(15, 15, 15, 0.9);
        backdrop-filter: blur(10px);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        border-left: 4px solid #ff0033;
        font-family: system-ui, sans-serif;
        font-weight: 500;
        font-size: 14px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .toast.show {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    shadow.appendChild(style);

    const container = document.createElement('div');
    container.id = 'container';
    shadow.appendChild(container);

    player.appendChild(host);
    return host;
  }

  _removeToastHost() {
    const host = document.getElementById(this._toastHostId);
    if (host) host.remove();
  }

  _showSkipToast(category) {
    const host = this._ensureToastHost();
    if (!host || !host.shadowRoot) return;

    const container = host.shadowRoot.getElementById('container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `Skipped ${category || 'segment'}`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 260);
    }, this.settings.toastDurationMs);
  }
}

// Ensure availability across content-script files.
try {
  globalThis.SponsorManager = SponsorManager;
} catch {
  // ignore
}
