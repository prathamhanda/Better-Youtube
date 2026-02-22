/**
 * FocusManager
 * Distraction blocking via CSS injection (prevents FOUC vs DOM removals).
 */
class FocusManager {
  constructor(options = {}) {
    this.settings = {
      focusEnabled: options.focusEnabled !== false,
      hideShorts: options.hideShorts === true,
      hideComments: options.hideComments === true,
      hideRecommendations: options.hideRecommendations === true
    };

    this._styleId = 'betteryoutube-focus-styles';
    this._styleEl = null;
  }

  start() {
    if (!this.settings.focusEnabled) return;
    this._ensureStyleElement();
    this._render();
  }

  stop() {
    this._removeStyleElement();
  }

  updateSettings(newSettings = {}) {
    const prevEnabled = this.settings.focusEnabled;

    if (typeof newSettings.focusEnabled === 'boolean') this.settings.focusEnabled = newSettings.focusEnabled;
    if (typeof newSettings.hideShorts === 'boolean') this.settings.hideShorts = newSettings.hideShorts;
    if (typeof newSettings.hideComments === 'boolean') this.settings.hideComments = newSettings.hideComments;
    if (typeof newSettings.hideRecommendations === 'boolean') this.settings.hideRecommendations = newSettings.hideRecommendations;

    if (!prevEnabled && this.settings.focusEnabled) {
      this.start();
      return;
    }

    if (prevEnabled && !this.settings.focusEnabled) {
      this.stop();
      return;
    }

    if (this.settings.focusEnabled) {
      this._ensureStyleElement();
      this._render();
    }
  }

  _ensureStyleElement() {
    if (this._styleEl && this._styleEl.isConnected) return;

    const existing = document.getElementById(this._styleId);
    if (existing) {
      this._styleEl = existing;
      return;
    }

    const style = document.createElement('style');
    style.id = this._styleId;

    const head = document.head || document.querySelector('head') || document.documentElement;
    head.appendChild(style);
    this._styleEl = style;
  }

  _removeStyleElement() {
    const existing = document.getElementById(this._styleId);
    if (existing) existing.remove();
    this._styleEl = null;
  }

  _render() {
    if (!this._styleEl) return;

    let css = '';

    if (this.settings.hideShorts) {
      css += `
        /* Hide Shorts entry points */
        ytd-guide-entry-renderer a[title="Shorts"],
        ytd-mini-guide-entry-renderer[aria-label="Shorts"],
        a#endpoint[title="Shorts"],
        ytd-reel-shelf-renderer,
        ytd-rich-shelf-renderer[is-shorts],
        ytd-rich-shelf-renderer[is-shorts-shelf],
        ytd-shorts,
        ytd-reel-video-renderer,
        yt-tab-shape[tab-title="Shorts"] {
          display: none !important;
        }
      `;
    }

    if (this.settings.hideComments) {
      css += `
        /* Hide comments on watch pages */
        #comments,
        ytd-comments {
          display: none !important;
        }
      `;
    }

    if (this.settings.hideRecommendations) {
      css += `
        /* Hide watch sidebar recommendations + end screen */
        #related,
        ytd-watch-next-secondary-results-renderer,
        .ytp-endscreen-content {
          display: none !important;
        }
      `;
    }

    this._styleEl.textContent = css;
  }
}

// Ensure availability across content-script files.
try {
  globalThis.FocusManager = FocusManager;
} catch {
  // ignore
}
