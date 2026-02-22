/**
 * BetterYoutube - Enhanced YouTube experience with better scrolling and Picture-in-Picture
 */
class BetterYoutube {
    constructor() {
        this.selectors = {
            // Prefer scrolling the single recommendations items container to avoid nested scrollbars.
            recommendationsElement: [
                'ytd-watch-next-secondary-results-renderer #items',
                'ytd-watch-next-secondary-results-renderer',
                '#related'
            ],
            commentsElement: [
                'ytd-comments#comments',
                'ytd-comments.style-scope.ytd-watch-flexy',
                '#comments'
            ],
            controls: '.ytp-right-controls',
            miniplayerBtn: '.ytp-miniplayer-button'
        };

        this.styles = {
            common: {
                backgroundColor: '#272727',
                overflowY: 'auto',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '24px'
            },
            maxHeights: {
                defaultRatio: 0.8,
                recommendations: 1200,
                comments: 600
            }
        };

        this.pipBtnId = 'yt-pip-pro-btn';
        this.observer = null;
        this.pipObserver = null;
        this.speedManager = null;
        this.sponsorManager = null;
        this.focusManager = null;
        this._styleOverrides = new Map();
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
        this.validateChromeAPIs();
        this.init();
    }

    /**
     * Track and override inline style values so we can reliably revert them.
     */
    _overrideInlineStyle(element, property, value) {
        if (!element) return;

        // Prune disconnected elements to avoid unbounded growth.
        for (const [el] of this._styleOverrides) {
            if (!el || !el.isConnected) {
                this._styleOverrides.delete(el);
            }
        }

        let record = this._styleOverrides.get(element);
        if (!record) {
            record = {};
            this._styleOverrides.set(element, record);
        }

        if (!(property in record)) {
            record[property] = element.style[property];
        }

        element.style[property] = value;
    }

    _revertStyleOverrides() {
        if (!this._styleOverrides) return;
        for (const [element, record] of this._styleOverrides) {
            if (!element || !element.isConnected) continue;
            Object.keys(record).forEach(property => {
                element.style[property] = record[property];
            });
        }
        this._styleOverrides.clear();
    }

    _isElementScrollable(element) {
        if (!element) return false;
        const cs = window.getComputedStyle(element);
        const overflowY = cs.overflowY;
        if (overflowY !== 'auto' && overflowY !== 'scroll') return false;
        return element.scrollHeight - element.clientHeight > 1;
    }

    /**
     * YouTube sometimes introduces additional scroll containers in the right sidebar (notably during ads).
     * Enforce a single scroller: the recommendations container we style.
     */
    enforceSingleRecommendationsScroller(recommendationsSection) {
        if (!recommendationsSection) return;
        if (!recommendationsSection.dataset || recommendationsSection.dataset.betterYoutubeScroll !== '1') return;

        const sidebar = document.querySelector('#secondary');
        if (!sidebar || !sidebar.contains(recommendationsSection)) return;

        // Walk up from recommendations to sidebar and disable scrollbars on ancestors.
        let current = recommendationsSection.parentElement;
        while (current && current !== sidebar && current !== document.body && current !== document.documentElement) {
            if (this._isElementScrollable(current)) {
                this._overrideInlineStyle(current, 'overflowY', 'visible');
                this._overrideInlineStyle(current, 'maxHeight', '');
                this._overrideInlineStyle(current, 'height', '');
            }
            current = current.parentElement;
        }

        // Sidebar itself can become a scroll container during ads.
        if (this._isElementScrollable(sidebar)) {
            this._overrideInlineStyle(sidebar, 'overflowY', 'visible');
            this._overrideInlineStyle(sidebar, 'maxHeight', '');
            this._overrideInlineStyle(sidebar, 'height', '');
        }
    }

    /**
     * Older versions styled inner item-sections, which can create nested scrollbars.
     * Clean those up proactively.
     */
    cleanupLegacyRecommendationSections() {
        const legacySections = document.querySelectorAll(
            'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer'
        );

        legacySections.forEach(section => {
            const looksLikeOurs =
                section?.dataset?.betterYoutubeScroll === '1' ||
                section.style.overflowY === this.styles.common.overflowY ||
                !!section.style.maxHeight ||
                section.style.backgroundColor === this.styles.common.backgroundColor;

            if (looksLikeOurs) {
                this.removeSectionHeight(section);
            }
        });
    }

    /**
     * Validate Chrome APIs availability
     */
    validateChromeAPIs() {
        this.chromeAPIsAvailable = !!(
            typeof chrome !== 'undefined' &&
            chrome.runtime &&
            chrome.storage &&
            chrome.storage.sync
        );

        if (!this.chromeAPIsAvailable) {
            console.warn('BetterYoutube: Chrome extension APIs not available. Some features may not work properly.');
        }
    }

    /**
     * Initialize the extension
     */
    async init() {
        await this.loadSettings();
        this.setupMessageListener();

        if (this.settings.scrollEnabled) {
            this.setupScrollEnhancements();
        }

        if (this.settings.pipEnabled) {
            this.setupPictureInPicture();
        }

        if (this.settings.speedEnabled) {
            this.setupSpeedControls();
        }

        if (this.settings.sponsorBlockEnabled) {
            this.setupSponsorBlock();
        }

        if (this.settings.focusEnabled) {
            this.setupFocusMode();
        }

        this.setupEventListeners();
    }

    /**
     * Utility function to debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Find element using multiple selectors
     */
    findElement(selectors) {
        if (typeof selectors === 'string') return document.querySelector(selectors);
        return selectors.reduce((element, selector) => element || document.querySelector(selector), null);
    }

    /**
     * Apply scroll container styles to a section
     */
    updateSectionHeight(section, maxHeight) {
        if (!section) return false;
        const height = Math.min(window.innerHeight * this.styles.maxHeights.defaultRatio, maxHeight);
        Object.assign(section.style, this.styles.common, { maxHeight: `${height}px` });
        section.dataset.betterYoutubeScroll = '1';
        return true;
    }

    /**
     * Remove scroll container styles from a section
     */
    removeSectionHeight(section) {
        if (!section) return false;
        Object.keys(this.styles.common).forEach(key => {
            section.style[key] = '';
        });
        section.style.maxHeight = '';
        if (section.dataset) {
            delete section.dataset.betterYoutubeScroll;
        }
        return true;
    }

    /**
     * Update all scroll sections
     */
    updateAllSections() {
        // Prevent nested scroll containers from older selector choices.
        this.cleanupLegacyRecommendationSections();

        const sections = {
            recommendations: this.findElement(this.selectors.recommendationsElement),
            comments: this.findElement(this.selectors.commentsElement)
        };

        const recommendationsUpdated = this.updateSectionHeight(
            sections.recommendations,
            this.styles.maxHeights.recommendations
        );
        const commentsUpdated = this.updateSectionHeight(
            sections.comments,
            this.styles.maxHeights.comments
        );

        // Ensure the right sidebar has only one scroll container.
        this.enforceSingleRecommendationsScroller(sections.recommendations);

        return recommendationsUpdated && commentsUpdated;
    }

    /**
     * Remove all scroll enhancements
     */
    removeAllSections() {
        const sections = {
            recommendations: this.findElement(this.selectors.recommendationsElement),
            comments: this.findElement(this.selectors.commentsElement)
        };

        this.removeSectionHeight(sections.recommendations);
        this.removeSectionHeight(sections.comments);
    }

    /**
     * Setup scroll enhancements with observer
     */
    setupScrollEnhancements() {
        const debouncedUpdateAllSections = this.debounce(() => {
            this.updateAllSections();
        }, 300);

        this.observer = new MutationObserver(() => {
            debouncedUpdateAllSections();
        });

        this.updateAllSections();

        const watchContainer = document.querySelector('ytd-watch-flexy');
        if (watchContainer) {
            this.observer.observe(watchContainer, {
                childList: true,
                subtree: true
            });
        } else {
            this.observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Disable scroll enhancements
     */
    disableScrollEnhancements() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this._revertStyleOverrides();
        this.removeAllSections();
    }

    /**
     * Create and add Picture-in-Picture button
     */
    addPiPButton() {
        if (!this.settings.pipEnabled) return;
        if (document.getElementById(this.pipBtnId)) return;

        const controls = document.querySelector(this.selectors.controls);
        const miniplayerBtn = document.querySelector(this.selectors.miniplayerBtn);

        if (!controls || !miniplayerBtn) return;

        const btn = document.createElement('button');
        btn.id = this.pipBtnId;
        btn.className = 'ytp-button';
        btn.title = 'Pop out video';
        btn.innerHTML = this.getPiPButtonSVG();
        btn.onclick = () => this.triggerPictureInPicture();

        miniplayerBtn.parentNode.insertBefore(btn, miniplayerBtn.nextSibling);
    }

    /**
     * Remove Picture-in-Picture button
     */
    removePiPButton() {
        const btn = document.getElementById(this.pipBtnId);
        if (btn) {
            btn.remove();
        }
    }

    /**
     * Get the SVG icon for PiP button
     */
    getPiPButtonSVG() {
        return `<svg width="32" height="25" viewBox="0 0 464 364" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto;">
            <g>
                <path d="M240.375 327H232H97C61.1015 327 32 297.899 32 262V92C32 56.1015 61.1015 27 97 27H367C402.898 27 432 56.1015 432 92V102V139.5V158.25V167.625" stroke="white" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="282" y="215" width="150" height="112" rx="25" stroke="#FF0033" stroke-width="22" stroke-linejoin="round"/>
                <path d="M116.8 100.6C113.265 97.949 108.251 98.6654 105.6 102.2C102.949 105.735 103.665 110.749 107.2 113.4L116.8 100.6ZM213.131 189.92C217.505 189.295 220.544 185.243 219.919 180.869L209.737 109.592C209.112 105.219 205.06 102.179 200.686 102.804C196.312 103.429 193.273 107.481 193.898 111.855L202.949 175.212L139.592 184.263C135.218 184.888 132.179 188.94 132.804 193.314C133.429 197.688 137.481 200.727 141.855 200.102L213.131 189.92ZM112 107L107.2 113.4L157.2 150.9L162 144.5L166.8 138.1L116.8 100.6L112 107ZM199.5 172.625L194.7 179.025L207.2 188.4L212 182L216.8 175.6L204.3 166.225L199.5 172.625ZM162 144.5L157.2 150.9L169.7 160.275L174.5 153.875L179.3 147.475L166.8 138.1L162 144.5ZM174.5 153.875L169.7 160.275L175.95 164.963L180.75 158.563L185.55 152.163L179.3 147.475L174.5 153.875ZM180.75 158.563L175.95 164.963L182.2 169.65L187 163.25L191.8 156.85L185.55 152.163L180.75 158.563ZM187 163.25L182.2 169.65L188.45 174.338L193.25 167.938L198.05 161.538L191.8 156.85L187 163.25ZM193.25 167.938L188.45 174.338L194.7 179.025L199.5 172.625L204.3 166.225L198.05 161.538L193.25 167.938Z" fill="white"/>
            </g>
        </svg>`;
    }

    /**
     * Trigger Picture-in-Picture mode
     */
    triggerPictureInPicture() {
        if (!this.settings.pipEnabled) return;

        if (!document.pictureInPictureEnabled) {
            console.warn('BetterYoutube: Picture-in-Picture is not supported in this browser');
            return;
        }

        const video = document.querySelector('video');
        if (video) {
            video.requestPictureInPicture()
                .then(() => console.log('BetterYoutube: PiP activated'))
                .catch(err => console.warn('BetterYoutube: PiP failed:', err));
        }
    }

    /**
     * Setup Picture-in-Picture functionality
     */
    setupPictureInPicture() {
        if (this.pipObserver) {
            this.pipObserver.disconnect();
        }

        this.pipObserver = new MutationObserver(() => {
            this.addPiPButton();
        });

        const playerContainer = document.querySelector('#movie_player');
        if (playerContainer) {
            this.pipObserver.observe(playerContainer, {
                childList: true,
                subtree: true
            });
        } else {
            this.pipObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        this.addPiPButton();
    }

    /**
     * Disable Picture-in-Picture functionality
     */
    disablePictureInPicture() {
        if (this.pipObserver) {
            this.pipObserver.disconnect();
            this.pipObserver = null;
        }
        this.removePiPButton();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.debouncedUpdate = this.debounce(() => this.updateAllSections(), 250);
        window.addEventListener('resize', this.debouncedUpdate);
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        if (!this.chromeAPIsAvailable) {
            console.log('BetterYoutube: Chrome APIs not available, using default settings');
            return;
        }

        try {
            const result = await chrome.storage.sync.get([
                'pipEnabled',
                'scrollEnabled',
                'speedEnabled',
                'speedStep',
                'speedKeys',
                'sponsorBlockEnabled',
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
            console.log('BetterYoutube: Settings not available, using defaults');
        }
    }

    setupFocusMode() {
        try {
            if (!this.focusManager) {
                if (typeof FocusManager !== 'function') {
                    console.warn('BetterYoutube: FocusManager not available');
                    return;
                }

                this.focusManager = new FocusManager({
                    focusEnabled: this.settings.focusEnabled,
                    hideShorts: !!this.settings.focusMode?.hideShorts,
                    hideComments: !!this.settings.focusMode?.hideComments,
                    hideRecommendations: !!this.settings.focusMode?.hideRecommendations
                });

                this.focusManager.start();
            }

            this.focusManager.updateSettings({
                focusEnabled: this.settings.focusEnabled,
                hideShorts: !!this.settings.focusMode?.hideShorts,
                hideComments: !!this.settings.focusMode?.hideComments,
                hideRecommendations: !!this.settings.focusMode?.hideRecommendations
            });
        } catch (err) {
            console.warn('BetterYoutube: Could not set up Focus Mode:', err);
        }
    }

    disableFocusMode() {
        if (!this.focusManager) return;
        try {
            this.focusManager.updateSettings({ focusEnabled: false });
        } catch {
            // ignore
        }
        this.focusManager = null;
    }

    setupSpeedControls() {
        try {
            if (!this.speedManager) {
                if (typeof SpeedManager !== 'function') {
                    console.warn('BetterYoutube: SpeedManager not available');
                    return;
                }

                this.speedManager = new SpeedManager({
                    chromeAPIsAvailable: this.chromeAPIsAvailable,
                    speedEnabled: this.settings.speedEnabled,
                    speedStep: this.settings.speedStep,
                    speedKeys: this.settings.speedKeys
                });

                // Start immediately on first setup.
                this.speedManager.start().catch(err =>
                    console.warn('BetterYoutube: SpeedManager start failed:', err)
                );
            }

            Promise.resolve(this.speedManager.updateSettings({
                speedEnabled: this.settings.speedEnabled,
                speedStep: this.settings.speedStep,
                speedKeys: this.settings.speedKeys
            })).catch(err => console.warn('BetterYoutube: SpeedManager update failed:', err));
        } catch (err) {
            console.warn('BetterYoutube: Could not set up speed controls:', err);
        }
    }

    disableSpeedControls() {
        if (!this.speedManager) return;
        try {
            // Route through the manager so it can track enabled-state.
            this.speedManager.updateSettings({ speedEnabled: false });
        } catch {
            // ignore
        }
    }

    setupSponsorBlock() {
        try {
            if (!this.sponsorManager) {
                if (typeof SponsorManager !== 'function') {
                    console.warn('BetterYoutube: SponsorManager not available');
                    return;
                }

                this.sponsorManager = new SponsorManager({
                    chromeAPIsAvailable: this.chromeAPIsAvailable,
                    sponsorBlockEnabled: this.settings.sponsorBlockEnabled
                });

                this.sponsorManager.start().catch(err =>
                    console.warn('BetterYoutube: SponsorManager start failed:', err)
                );
            }

            Promise.resolve(this.sponsorManager.updateSettings({
                sponsorBlockEnabled: this.settings.sponsorBlockEnabled
            })).catch(err => console.warn('BetterYoutube: SponsorManager update failed:', err));
        } catch (err) {
            console.warn('BetterYoutube: Could not set up SponsorBlock:', err);
        }
    }

    disableSponsorBlock() {
        if (!this.sponsorManager) return;
        try {
            this.sponsorManager.updateSettings({ sponsorBlockEnabled: false });
        } catch {
            // ignore
        }

        // Release references to ensure clean restart.
        this.sponsorManager = null;
    }

    /**
     * Setup message listener for settings updates
     */
    setupMessageListener() {
        if (!this.chromeAPIsAvailable) {
            console.log('BetterYoutube: Chrome APIs not available, message listener not set up');
            return;
        }

        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.action === 'updateSettings') {
                await this.updateSettings(message.settings);
                sendResponse({ success: true });
            }
            return true;
        });
    }

    /**
     * Update settings and restart features
     */
    updateSettings(newSettings) {
        const oldSettings = { ...this.settings };
        this.settings = {
            ...this.settings,
            ...newSettings,
            speedKeys: {
                ...(this.settings.speedKeys || {}),
                ...((newSettings && newSettings.speedKeys) || {})
            },
            focusMode: {
                ...(this.settings.focusMode || {}),
                ...((newSettings && newSettings.focusMode) || {})
            }
        };

        let hasChanges = false;

        if (oldSettings.scrollEnabled !== this.settings.scrollEnabled) {
            hasChanges = true;
            if (this.settings.scrollEnabled) {
                this.setupScrollEnhancements();
            } else {
                this.disableScrollEnhancements();
            }
        }

        if (oldSettings.pipEnabled !== this.settings.pipEnabled) {
            hasChanges = true;
            if (this.settings.pipEnabled) {
                this.setupPictureInPicture();
            } else {
                this.disablePictureInPicture();
            }
        }

        if (
            oldSettings.speedEnabled !== this.settings.speedEnabled ||
            oldSettings.speedStep !== this.settings.speedStep ||
            JSON.stringify(oldSettings.speedKeys || {}) !== JSON.stringify(this.settings.speedKeys || {})
        ) {
            hasChanges = true;
            if (this.settings.speedEnabled) {
                this.setupSpeedControls();
            } else {
                this.disableSpeedControls();
            }
        }

        if (oldSettings.sponsorBlockEnabled !== this.settings.sponsorBlockEnabled) {
            hasChanges = true;
            if (this.settings.sponsorBlockEnabled) {
                this.setupSponsorBlock();
            } else {
                this.disableSponsorBlock();
            }
        }

        if (
            oldSettings.focusEnabled !== this.settings.focusEnabled ||
            JSON.stringify(oldSettings.focusMode || {}) !== JSON.stringify(this.settings.focusMode || {})
        ) {
            hasChanges = true;
            if (this.settings.focusEnabled) {
                this.setupFocusMode();
            } else {
                this.disableFocusMode();
            }
        }

        if (hasChanges) {
            this.saveSettings();
        }
    }

    /**
     * Save settings to storage
     */
    async saveSettings() {
        if (!this.chromeAPIsAvailable) {
            return;
        }

        try {
            await chrome.storage.sync.set(this.settings);
        } catch (error) {
            console.log('BetterYoutube: Could not save settings');
        }
    }

    /**
     * Cleanup observers (useful for testing or cleanup)
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.pipObserver) {
            this.pipObserver.disconnect();
            this.pipObserver = null;
        }
        if (this.debouncedUpdate) {
            window.removeEventListener('resize', this.debouncedUpdate);
            this.debouncedUpdate = null;
        }

        if (this.speedManager) {
            try {
                this.speedManager.stop();
            } catch {
                // ignore
            }
            this.speedManager = null;
        }

        if (this.sponsorManager) {
            try {
                this.sponsorManager.stop();
            } catch {
                // ignore
            }
            this.sponsorManager = null;
        }

        if (this.focusManager) {
            try {
                this.focusManager.stop();
            } catch {
                // ignore
            }
            this.focusManager = null;
        }

        this._revertStyleOverrides();
        this.removeAllSections();
        this.removePiPButton();
    }
}

const betterYoutube = new BetterYoutube();
