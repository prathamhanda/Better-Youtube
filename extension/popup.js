class PopupManager {
  constructor() {
    this.settings = {
      pipEnabled: true,
      scrollEnabled: true,
      speedEnabled: true,
      speedStep: 0.25,
      speedKeys: {
        slower: 's',
        faster: 'd',
        reset: 'r'
      },
      sponsorBlockEnabled: true,
      focusEnabled: false,
      focusMode: {
        hideShorts: true,
        hideComments: false,
        hideRecommendations: false
      }
    };
    this.isYouTube = false;
    this.init();
  }

  async init() {
    await this.checkCurrentTab();
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  async checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.isYouTube = tab && tab.url && /^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(tab.url);

      this.updateTabStatus();
    } catch (error) {
      console.log('Could not check current tab');
      this.isYouTube = false;
    }
  }

  updateTabStatus() {
    const body = document.body;
    if (this.isYouTube) {
      body.classList.remove('not-youtube');
    } else {
      body.classList.add('not-youtube');
    }
    const notYoutubeHint = document.getElementById('not-youtube-hint');
    notYoutubeHint && (notYoutubeHint.style.display = this.isYouTube ? 'none' : 'block');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'pipEnabled',
        'scrollEnabled',
        'speedEnabled',
        'speedStep',
        'speedKeys',
        'sponsorBlockEnabled'
        ,
        'focusEnabled',
        'focusMode'
      ]);
      this.settings.pipEnabled = result.pipEnabled !== false;
      this.settings.scrollEnabled = result.scrollEnabled !== false;

      this.settings.speedEnabled = result.speedEnabled !== false;
      if (typeof result.speedStep === 'number' && Number.isFinite(result.speedStep)) {
        this.settings.speedStep = result.speedStep;
      }
      if (result.speedKeys && typeof result.speedKeys === 'object') {
        this.settings.speedKeys = {
          slower: result.speedKeys.slower || this.settings.speedKeys.slower,
          faster: result.speedKeys.faster || this.settings.speedKeys.faster,
          reset: result.speedKeys.reset || this.settings.speedKeys.reset
        };
      }

      this.settings.sponsorBlockEnabled = result.sponsorBlockEnabled !== false;

      this.settings.focusEnabled = result.focusEnabled === true;
      if (result.focusMode && typeof result.focusMode === 'object') {
        this.settings.focusMode = {
          hideShorts: result.focusMode.hideShorts !== false,
          hideComments: result.focusMode.hideComments === true,
          hideRecommendations: result.focusMode.hideRecommendations === true
        };
      }
    } catch (error) {
      console.log('Settings not available, using defaults');
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings);
      await this.notifyContentScript();
    } catch (error) {
      console.log('Could not save settings');
    }
  }

  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id && this.isYouTube) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: this.settings
          });
        } catch (error) {
          await this.injectContentScript(tab.id);
        }
      }
    } catch (error) {
      console.log('Could not notify content script');
    }
  }

  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      try {
        await chrome.tabs.sendMessage(tabId, {
          action: 'updateSettings',
          settings: this.settings
        });
      } catch (error) {
        console.log('Could not send message after injection');
      }
    } catch (error) {
      console.log('Could not inject content script');
    }
  }

  setupEventListeners() {
    const pipBtn = document.getElementById('pip-btn');
    if (pipBtn) {
      pipBtn.addEventListener('click', () => this.triggerPiP());
    }

    const pipToggle = document.getElementById('pip-toggle');
    const scrollToggle = document.getElementById('scroll-toggle');
    const speedToggle = document.getElementById('speed-toggle');
    const sponsorToggle = document.getElementById('sponsor-toggle');

    const focusToggle = document.getElementById('focus-toggle');
    const focusShortsToggle = document.getElementById('focus-shorts-toggle');
    const focusCommentsToggle = document.getElementById('focus-comments-toggle');
    const focusRecsToggle = document.getElementById('focus-recs-toggle');

    const speedStepInput = document.getElementById('speed-step');
    const speedKeySlower = document.getElementById('speed-key-slower');
    const speedKeyFaster = document.getElementById('speed-key-faster');
    const speedKeyReset = document.getElementById('speed-key-reset');

    if (pipToggle) {
      pipToggle.addEventListener('click', () => {
        if (this.isYouTube) {
          this.toggleFeature('pip');
        }
      });
    }

    if (scrollToggle) {
      scrollToggle.addEventListener('click', () => {
        if (this.isYouTube) {
          this.toggleFeature('scroll');
        }
      });
    }

    if (speedToggle) {
      speedToggle.addEventListener('click', () => {
        if (this.isYouTube) {
          this.toggleFeature('speed');
        }
      });
    }

    if (sponsorToggle) {
      sponsorToggle.addEventListener('click', () => {
        if (this.isYouTube) {
          this.toggleFeature('sponsor');
        }
      });
    }

    const toggleFocusSubSetting = async (key) => {
      if (!this.isYouTube) return;
      if (!this.settings.focusEnabled) return;
      this.settings.focusMode = {
        ...(this.settings.focusMode || {}),
        [key]: !this.settings.focusMode?.[key]
      };
      await this.saveSettings();
      this.updateUI();
    };

    if (focusToggle) {
      focusToggle.addEventListener('click', () => {
        if (this.isYouTube) {
          this.toggleFeature('focus');
        }
      });
    }

    if (focusShortsToggle) {
      focusShortsToggle.addEventListener('click', () => toggleFocusSubSetting('hideShorts'));
    }
    if (focusCommentsToggle) {
      focusCommentsToggle.addEventListener('click', () => toggleFocusSubSetting('hideComments'));
    }
    if (focusRecsToggle) {
      focusRecsToggle.addEventListener('click', () => toggleFocusSubSetting('hideRecommendations'));
    }

    const isDisabled = () => !this.isYouTube || !this.settings.speedEnabled;

    const sanitizeKey = (value) => {
      if (typeof value !== 'string') return '';
      return value.trim().slice(0, 12);
    };

    const wireKeyInput = (el, keyName) => {
      if (!el) return;

      el.addEventListener('keydown', async (e) => {
        // Let user clear with Backspace/Delete.
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          el.value = '';
          this.settings.speedKeys[keyName] = '';
          await this.saveSettings();
          return;
        }

        // Ignore modifier-only keys.
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

        // Capture a key press as binding.
        if (e.key && e.key.length > 0) {
          e.preventDefault();
          el.value = sanitizeKey(e.key);
          this.settings.speedKeys[keyName] = el.value;
          await this.saveSettings();
        }
      });

      el.addEventListener('change', async () => {
        el.value = sanitizeKey(el.value);
        this.settings.speedKeys[keyName] = el.value;
        await this.saveSettings();
      });
    };

    if (speedStepInput) {
      speedStepInput.addEventListener('change', async () => {
        if (isDisabled()) return;
        const value = Number(speedStepInput.value);
        if (!Number.isFinite(value)) return;
        this.settings.speedStep = value;
        await this.saveSettings();
        this.updateUI();
      });
    }

    wireKeyInput(speedKeySlower, 'slower');
    wireKeyInput(speedKeyFaster, 'faster');
    wireKeyInput(speedKeyReset, 'reset');
  }

  updateUI() {
    const pipToggle = document.getElementById('pip-toggle');
    const scrollToggle = document.getElementById('scroll-toggle');
    const speedToggle = document.getElementById('speed-toggle');
    const sponsorToggle = document.getElementById('sponsor-toggle');
    const pipBtn = document.getElementById('pip-btn');

    const focusToggle = document.getElementById('focus-toggle');
    const focusShortsToggle = document.getElementById('focus-shorts-toggle');
    const focusCommentsToggle = document.getElementById('focus-comments-toggle');
    const focusRecsToggle = document.getElementById('focus-recs-toggle');

    const speedStepInput = document.getElementById('speed-step');
    const speedKeySlower = document.getElementById('speed-key-slower');
    const speedKeyFaster = document.getElementById('speed-key-faster');
    const speedKeyReset = document.getElementById('speed-key-reset');

    const pipLabel = pipToggle?.parentElement.querySelector('.toggle-label');
    const scrollLabel = scrollToggle?.parentElement.querySelector('.toggle-label');
    const speedLabel = speedToggle?.parentElement.querySelector('.toggle-label');
    const sponsorLabel = sponsorToggle?.parentElement.querySelector('.toggle-label');
    const focusLabel = focusToggle?.parentElement.querySelector('.toggle-label');

    const isDisabled = !this.isYouTube;

    if (pipToggle) {
      pipToggle.classList.toggle('active', this.settings.pipEnabled && !isDisabled);
      pipToggle.classList.toggle('disabled', isDisabled);
      pipToggle.style.opacity = isDisabled ? '0.3' : '1';
      pipToggle.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
      pipToggle.setAttribute('aria-checked', this.settings.pipEnabled && !isDisabled ? 'true' : 'false');
    }

    if (scrollToggle) {
      scrollToggle.classList.toggle('active', this.settings.scrollEnabled && !isDisabled);
      scrollToggle.classList.toggle('disabled', isDisabled);
      scrollToggle.style.opacity = isDisabled ? '0.3' : '1';
      scrollToggle.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
      scrollToggle.setAttribute('aria-checked', this.settings.scrollEnabled && !isDisabled ? 'true' : 'false');
    }

    if (speedToggle) {
      speedToggle.classList.toggle('active', this.settings.speedEnabled && !isDisabled);
      speedToggle.classList.toggle('disabled', isDisabled);
      speedToggle.style.opacity = isDisabled ? '0.3' : '1';
      speedToggle.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
      speedToggle.setAttribute('aria-checked', this.settings.speedEnabled && !isDisabled ? 'true' : 'false');
    }

    if (sponsorToggle) {
      sponsorToggle.classList.toggle('active', this.settings.sponsorBlockEnabled && !isDisabled);
      sponsorToggle.classList.toggle('disabled', isDisabled);
      sponsorToggle.style.opacity = isDisabled ? '0.3' : '1';
      sponsorToggle.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
      sponsorToggle.setAttribute('aria-checked', this.settings.sponsorBlockEnabled && !isDisabled ? 'true' : 'false');
    }

    if (focusToggle) {
      focusToggle.classList.toggle('active', this.settings.focusEnabled && !isDisabled);
      focusToggle.classList.toggle('disabled', isDisabled);
      focusToggle.style.opacity = isDisabled ? '0.3' : '1';
      focusToggle.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
      focusToggle.setAttribute('aria-checked', this.settings.focusEnabled && !isDisabled ? 'true' : 'false');
    }

    if (pipBtn) {
      const btnDisabled = !this.settings.pipEnabled || isDisabled;
      pipBtn.disabled = btnDisabled;
      pipBtn.style.opacity = btnDisabled ? '0.3' : '1';
      pipBtn.style.cursor = btnDisabled ? 'not-allowed' : 'pointer';
    }

    if (pipLabel) {
      pipLabel.style.color = isDisabled ? '#666' : '#ccc';
    }
    if (scrollLabel) {
      scrollLabel.style.color = isDisabled ? '#666' : '#ccc';
    }

    if (speedLabel) {
      speedLabel.style.color = isDisabled ? '#666' : '#ccc';
    }

    if (sponsorLabel) {
      sponsorLabel.style.color = isDisabled ? '#666' : '#ccc';
    }

    if (focusLabel) {
      focusLabel.style.color = isDisabled ? '#666' : '#ccc';
    }

    const focusSubDisabled = isDisabled || !this.settings.focusEnabled;
    const applySubToggle = (el, checked) => {
      if (!el) return;
      el.classList.toggle('active', checked && !focusSubDisabled);
      el.classList.toggle('disabled', focusSubDisabled);
      el.style.opacity = focusSubDisabled ? '0.3' : '1';
      el.style.cursor = focusSubDisabled ? 'not-allowed' : 'pointer';
      el.setAttribute('aria-checked', checked && !focusSubDisabled ? 'true' : 'false');
    };

    applySubToggle(focusShortsToggle, !!this.settings.focusMode?.hideShorts);
    applySubToggle(focusCommentsToggle, !!this.settings.focusMode?.hideComments);
    applySubToggle(focusRecsToggle, !!this.settings.focusMode?.hideRecommendations);

    const speedInputsDisabled = isDisabled || !this.settings.speedEnabled;
    if (speedStepInput) {
      speedStepInput.disabled = speedInputsDisabled;
      speedStepInput.value = String(this.settings.speedStep ?? 0.25);
    }
    if (speedKeySlower) {
      speedKeySlower.disabled = speedInputsDisabled;
      speedKeySlower.value = this.settings.speedKeys?.slower ?? '';
    }
    if (speedKeyFaster) {
      speedKeyFaster.disabled = speedInputsDisabled;
      speedKeyFaster.value = this.settings.speedKeys?.faster ?? '';
    }
    if (speedKeyReset) {
      speedKeyReset.disabled = speedInputsDisabled;
      speedKeyReset.value = this.settings.speedKeys?.reset ?? '';
    }
  }

  async toggleFeature(feature) {
    if (!this.isYouTube) return;

    if (feature === 'pip') {
      this.settings.pipEnabled = !this.settings.pipEnabled;
    } else if (feature === 'scroll') {
      this.settings.scrollEnabled = !this.settings.scrollEnabled;
    } else if (feature === 'speed') {
      this.settings.speedEnabled = !this.settings.speedEnabled;
    } else if (feature === 'sponsor') {
      this.settings.sponsorBlockEnabled = !this.settings.sponsorBlockEnabled;
    } else if (feature === 'focus') {
      this.settings.focusEnabled = !this.settings.focusEnabled;
    }

    await this.saveSettings();
    this.updateUI();
  }

  async triggerPiP() {
    if (!this.settings.pipEnabled || !this.isYouTube) return;

    if (chrome && chrome.tabs && chrome.scripting) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const video = document.querySelector('video');
            if (video) {
              video.requestPictureInPicture()
                .catch(err => console.log('BetterYoutube: PiP failed:', err));
            } else {
              alert('No video found on this page.');
            }
          }
        });
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
