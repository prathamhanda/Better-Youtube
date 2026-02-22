/**
 * SpeedManager
 * Robust playback speed controls for YouTube (SPA-safe) with Shadow DOM UI.
 */
class SpeedManager {
  constructor(options = {}) {
    this.chromeAPIsAvailable = !!options.chromeAPIsAvailable;

    this.settings = {
      speedEnabled: options.speedEnabled !== false,
      speedStep: typeof options.speedStep === 'number' ? options.speedStep : 0.25,
      speedMin: typeof options.speedMin === 'number' ? options.speedMin : 0.25,
      speedMax: typeof options.speedMax === 'number' ? options.speedMax : 16,
      speedKeys: {
        slower: options.speedKeys?.slower || 's',
        faster: options.speedKeys?.faster || 'd',
        reset: options.speedKeys?.reset || 'r'
      },
      showDurationMs: typeof options.showDurationMs === 'number' ? options.showDurationMs : 2000
    };

    this.video = null;
    this.currentSpeed = 1;
    this._wrapperEl = null;
    this._badgeEl = null;
    this._hideTimeout = null;
    this._observer = null;
    this._rafScheduled = false;
    this._boundScheduleCheck = null;
    this._started = false;

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundRateChange = this._onRateChange.bind(this);
  }

  async start() {
    if (this._started) return;
    if (!this.settings.speedEnabled) return;

    this._started = true;

    document.addEventListener('keydown', this._boundKeyDown, true);

    // Load last speed and apply when we find a video.
    this._lastSpeed = await this._loadLastSpeed();

    this._observeForVideo();
    this._checkForVideo();
  }

  stop() {
    if (!this._started) return;
    this._started = false;
    document.removeEventListener('keydown', this._boundKeyDown, true);

    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    if (this._boundScheduleCheck) {
      window.removeEventListener('yt-navigate-finish', this._boundScheduleCheck, true);
      window.removeEventListener('yt-page-data-updated', this._boundScheduleCheck, true);
      this._boundScheduleCheck = null;
    }

    this._detachVideo();
    this._removeUI();

    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
  }

  async updateSettings(newSettings = {}) {
    const oldEnabled = this.settings.speedEnabled;

    if (typeof newSettings.speedEnabled === 'boolean') {
      this.settings.speedEnabled = newSettings.speedEnabled;
    }

    if (typeof newSettings.speedStep === 'number' && Number.isFinite(newSettings.speedStep)) {
      this.settings.speedStep = newSettings.speedStep;
    }

    if (newSettings.speedKeys && typeof newSettings.speedKeys === 'object') {
      this.settings.speedKeys = {
        slower: newSettings.speedKeys.slower || this.settings.speedKeys.slower,
        faster: newSettings.speedKeys.faster || this.settings.speedKeys.faster,
        reset: newSettings.speedKeys.reset || this.settings.speedKeys.reset
      };
    }

    // Enable/disable transition.
    if (!oldEnabled && this.settings.speedEnabled) {
      await this.start();
      return;
    }

    if (oldEnabled && !this.settings.speedEnabled) {
      this.stop();
      return;
    }

    // If still enabled, re-sync UI + (optionally) apply stored speed to new video.
    if (this.settings.speedEnabled) {
      this._checkForVideo();
      this._updateBadgeText();
    }
  }

  _observeForVideo() {
    if (this._observer) return;

    const scheduleCheck = () => {
      if (this._rafScheduled) return;
      this._rafScheduled = true;
      requestAnimationFrame(() => {
        this._rafScheduled = false;
        // If the current video was replaced, re-detect.
        if (!this.video || !this.video.isConnected) {
          this._checkForVideo();
        }
      });
    };

    this._boundScheduleCheck = scheduleCheck;

    this._observer = new MutationObserver(scheduleCheck);

    const watchRoot = document.querySelector('ytd-app') || document.body || document.documentElement;
    this._observer.observe(watchRoot, { childList: true, subtree: true });

    // YouTube SPA navigation hint events.
    window.addEventListener('yt-navigate-finish', scheduleCheck, true);
    window.addEventListener('yt-page-data-updated', scheduleCheck, true);
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

  _checkForVideo() {
    if (!this.settings.speedEnabled) return;

    const nextVideo = this._findVideoElement();
    if (!nextVideo) return;

    if (this.video === nextVideo) return;

    this._attachVideo(nextVideo);

    // Inject UI first so any subsequent setSpeed() can flash the badge.
    this._injectUI();

    // Apply last speed (if any) on new videos.
    if (typeof this._lastSpeed === 'number' && Number.isFinite(this._lastSpeed)) {
      const shouldShow = Math.abs(this._lastSpeed - 1) > 0.001;
      this.setSpeed(this._lastSpeed, { persist: false, show: shouldShow });
    } else {
      this.currentSpeed = this.video.playbackRate || 1;
      this._updateBadgeText();
    }
  }

  _attachVideo(videoEl) {
    this._detachVideo();
    this.video = videoEl;
    this.currentSpeed = this.video.playbackRate || 1;
    this.video.addEventListener('ratechange', this._boundRateChange, true);
  }

  _detachVideo() {
    if (this.video) {
      try {
        this.video.removeEventListener('ratechange', this._boundRateChange, true);
      } catch {
        // ignore
      }
    }
    this.video = null;
  }

  changeSpeed(delta) {
    if (!this.video) return;

    const base = typeof this.video.playbackRate === 'number' ? this.video.playbackRate : this.currentSpeed;
    let next = base + delta;
    next = Math.min(Math.max(next, this.settings.speedMin), this.settings.speedMax);

    // Normalize to 2 decimals to avoid drift.
    next = Math.round(next * 100) / 100;

    this.setSpeed(next);
  }

  setSpeed(speed, opts = {}) {
    if (!this.video) return;

    const { persist = true, show = true } = opts;

    const clamped = Math.min(Math.max(speed, this.settings.speedMin), this.settings.speedMax);
    this.currentSpeed = clamped;
    this.video.playbackRate = clamped;

    this._updateBadgeText();

    if (show) {
      this._showUIBriefly();
    }

    if (persist) {
      this._saveLastSpeed(clamped);
    }
  }

  _onRateChange() {
    if (!this.video) return;
    const rate = this.video.playbackRate;
    if (typeof rate === 'number' && Number.isFinite(rate)) {
      this.currentSpeed = rate;
      this._updateBadgeText();
      this._saveLastSpeed(rate);
    }
  }

  _shouldIgnoreKeyEvent(e) {
    if (!e) return true;

    if (e.defaultPrevented) return true;
    if (e.ctrlKey || e.metaKey || e.altKey) return true;

    const target = e.target;
    const tag = target && target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target && target.isContentEditable) return true;

    return false;
  }

  _normalizedKey(value) {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
  }

  _onKeyDown(e) {
    if (!this.settings.speedEnabled) return;
    if (this._shouldIgnoreKeyEvent(e)) return;

    const key = this._normalizedKey(e.key);
    if (!key) return;

    const slowerKey = this._normalizedKey(this.settings.speedKeys.slower);
    const fasterKey = this._normalizedKey(this.settings.speedKeys.faster);
    const resetKey = this._normalizedKey(this.settings.speedKeys.reset);

    if (key === slowerKey) {
      e.preventDefault();
      this.changeSpeed(-this.settings.speedStep);
      return;
    }

    if (key === fasterKey) {
      e.preventDefault();
      this.changeSpeed(this.settings.speedStep);
      return;
    }

    if (key === resetKey) {
      e.preventDefault();
      this.setSpeed(1);
    }
  }

  _wrapperId() {
    return 'better-youtube-speed-wrapper';
  }

  _removeUI() {
    const existing = document.getElementById(this._wrapperId());
    if (existing) existing.remove();

    this._wrapperEl = null;
    this._badgeEl = null;
  }

  _injectUI() {
    this._removeUI();

    const container = this._findPlayerContainer();
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.id = this._wrapperId();
    wrapper.style.cssText = [
      'position:absolute',
      'top:10px',
      'left:10px',
      'z-index:999999',
      'pointer-events:none'
    ].join(';');

    const shadow = wrapper.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .badge {
        pointer-events: auto;
        background: rgba(15, 15, 15, 0.8);
        backdrop-filter: blur(8px);
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-weight: 600;
        font-size: 14px;
        border: 1px solid rgba(255, 0, 51, 0.3);
        opacity: 0;
        transition: opacity 0.2s ease;
        user-select: none;
        cursor: pointer;
      }
      .badge.show { opacity: 1; }
      .badge:hover {
        border-color: #ff0033;
        box-shadow: 0 0 10px rgba(255, 0, 51, 0.2);
        opacity: 1 !important;
      }
    `;

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = `${(this.currentSpeed || 1).toFixed(2)}x`;

    badge.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.setSpeed(1);
    });

    shadow.appendChild(style);
    shadow.appendChild(badge);

    container.appendChild(wrapper);

    this._wrapperEl = wrapper;
    this._badgeEl = badge;
  }

  _updateBadgeText() {
    if (!this._badgeEl) return;
    const speed = typeof this.currentSpeed === 'number' ? this.currentSpeed : 1;
    this._badgeEl.textContent = `${speed.toFixed(2)}x`;
  }

  _showUIBriefly() {
    if (!this._badgeEl) return;

    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }

    this._badgeEl.classList.add('show');

    this._hideTimeout = setTimeout(() => {
      this._hideTimeout = null;
      if (this._badgeEl) this._badgeEl.classList.remove('show');
    }, this.settings.showDurationMs);
  }

  async _loadLastSpeed() {
    if (!this.chromeAPIsAvailable) return undefined;

    try {
      const result = await chrome.storage.sync.get(['speedLast']);
      const speedLast = result.speedLast;
      if (typeof speedLast === 'number' && Number.isFinite(speedLast)) {
        return speedLast;
      }
    } catch {
      // ignore
    }

    return undefined;
  }

  _saveLastSpeed(speed) {
    if (!this.chromeAPIsAvailable) return;
    try {
      chrome.storage.sync.set({ speedLast: speed });
    } catch {
      // ignore
    }
  }
}

// Ensure availability across content-script files.
try {
  globalThis.SpeedManager = SpeedManager;
} catch {
  // ignore
}
