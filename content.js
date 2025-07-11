// Chrono X Chroma - Content Script
(function () {
    'use strict';

    // Color scheme for different post ages
    const COLOR_SCHEME = {
        VERY_RECENT: { bg: 'rgba(0, 255, 0, 0.1)', border: '2px solid #00ff00' }, // Green - under 5 minutes
        RECENT: { bg: 'rgba(255, 255, 0, 0.1)', border: '2px solid #ffff00' },     // Yellow - 5 minutes to 1 hour
        MODERATE: { bg: 'rgba(255, 165, 0, 0.1)', border: '2px solid #ffa500' },   // Orange - 1 hour to 6 hours
        OLD: { bg: 'rgba(255, 0, 0, 0.1)', border: '2px solid #ff0000' },          // Red - 6 hours to 1 day
        VERY_OLD: { bg: 'rgba(128, 0, 128, 0.1)', border: '2px solid #800080' }    // Purple - over 1 day
    };

    // Extension settings
    let settings = {
        colorMode: 'both', // 'both', 'border', 'overlay', 'off'
        showLegend: true,
        removeCss: false
    };

    // Migrate old settings format to new format
    function migrateOldSettings(items) {
        let colorMode = 'both'; // default

        // Convert old enableColorCoding + borderOnly to new colorMode
        if (items.enableColorCoding === false) {
            colorMode = 'off';
        } else if (items.borderOnly === true) {
            colorMode = 'border';
        } else if (items.enableColorCoding === true && items.borderOnly === false) {
            colorMode = 'both';
        }

        return {
            colorMode,
            showLegend: items.showLegend !== undefined ? items.showLegend : true,
            removeCss: items.removeCss !== undefined ? items.removeCss : false
        };
    }

    // Load settings from storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(null, function (items) {
            console.log('Content script loaded settings:', items);

            // Check if we have the new colorMode setting or need to migrate
            if (items.colorMode !== undefined) {
                // New format
                settings.colorMode = items.colorMode;
                settings.showLegend = items.showLegend !== undefined ? items.showLegend : true;
                settings.removeCss = items.removeCss !== undefined ? items.removeCss : false;
            } else {
                // Migrate from old format
                settings = migrateOldSettings(items);

                // Save migrated settings
                chrome.storage.sync.set(settings);
            }

            console.log('Content script using settings:', settings);
            applySettings();
        });
    }

    // Function to calculate post age category
    function getPostAgeCategory(datetime) {
        const now = new Date();
        const postTime = new Date(datetime);
        const diffInMinutes = (now - postTime) / (1000 * 60);

        if (diffInMinutes < 5) {
            return 'VERY_RECENT';
        } else if (diffInMinutes < 60) {
            return 'RECENT';
        } else if (diffInMinutes < 360) { // 6 hours
            return 'MODERATE';
        } else if (diffInMinutes < 1440) { // 24 hours
            return 'OLD';
        } else {
            return 'VERY_OLD';
        }
    }

    // Function to apply color coding to a post
    function colorCodePost(postElement) {
        // Skip if already processed
        if (postElement.classList.contains('chrono-x-chroma')) {
            return;
        }

        // Check if color coding is enabled
        if (settings.colorMode === 'off' || settings.removeCss) {
            return;
        }

        // Find the time element with datetime attribute
        const timeElement = postElement.querySelector('time[datetime]');
        if (!timeElement) {
            return;
        }

        const datetime = timeElement.getAttribute('datetime');
        if (!datetime) {
            return;
        }

        // Get the age category and corresponding colors
        const ageCategory = getPostAgeCategory(datetime);
        const colors = COLOR_SCHEME[ageCategory];

        // Clear any existing styles first
        postElement.style.backgroundColor = '';
        postElement.style.border = '';

        // Apply styling based on colorMode
        if (settings.colorMode === 'both') {
            // Both border and background
            postElement.style.backgroundColor = colors.bg;
            postElement.style.border = colors.border;
        } else if (settings.colorMode === 'border') {
            // Border only
            postElement.style.border = colors.border;
        } else if (settings.colorMode === 'overlay') {
            // Background only
            postElement.style.backgroundColor = colors.bg;
        }

        // Always apply these styles regardless of mode (unless off)
        postElement.style.borderRadius = '8px';
        postElement.style.transition = 'all 0.3s ease';

        // Mark as processed
        postElement.classList.add('chrono-x-chroma');
        postElement.setAttribute('data-post-age', ageCategory.toLowerCase());
    }

    // Function to process all posts on the page
    function processAllPosts() {
        const posts = document.querySelectorAll('[data-testid="tweet"]');
        posts.forEach(post => {
            colorCodePost(post);
        });
    }

    // Function to create and show the legend
    function createLegend() {
        // Check if legend already exists
        if (document.getElementById('chrono-x-chroma-legend')) {
            return;
        }

        // Check if legend should be shown
        if (!settings.showLegend || settings.removeCss) {
            return;
        }

        const legend = document.createElement('div');
        legend.id = 'chrono-x-chroma-legend';
        legend.innerHTML = '+';

        // Create the legend popup
        const legendPopup = document.createElement('div');
        legendPopup.id = 'chrono-x-chroma-legend-popup';
        legendPopup.style.display = 'none';

        // Update legend content based on colorMode
        updateLegendContent();

        document.body.appendChild(legend);
        document.body.appendChild(legendPopup);

        // Add toggle functionality
        let isExpanded = false;
        legend.addEventListener('click', function () {
            if (isExpanded) {
                legendPopup.style.display = 'none';
                legend.innerHTML = '+';
                isExpanded = false;
            } else {
                legendPopup.style.display = 'block';
                legend.innerHTML = '−';
                isExpanded = true;
            }
        });
    }

    // Function to update legend content based on current settings
    function updateLegendContent() {
        const legendPopup = document.getElementById('chrono-x-chroma-legend-popup');
        if (!legendPopup) return;

        let legendContent = '';

        if (settings.colorMode === 'border') {
            legendContent = `
                <div class="legend-item">
                    <div class="legend-color" style="border: 2px solid #00ff00;"></div>
                    <span>Very Recent (&lt; 5 min)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="border: 2px solid #ffff00;"></div>
                    <span>Recent (5 min - 1 hour)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="border: 2px solid #ffa500;"></div>
                    <span>Moderate (1 - 6 hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="border: 2px solid #ff0000;"></div>
                    <span>Old (6 - 24 hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="border: 2px solid #800080;"></div>
                    <span>Very Old (&gt; 1 day)</span>
                </div>
            `;
        } else if (settings.colorMode === 'overlay') {
            legendContent = `
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(0, 255, 0, 0.3);"></div>
                    <span>Very Recent (&lt; 5 min)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(255, 255, 0, 0.3);"></div>
                    <span>Recent (5 min - 1 hour)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(255, 165, 0, 0.3);"></div>
                    <span>Moderate (1 - 6 hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(255, 0, 0, 0.3);"></div>
                    <span>Old (6 - 24 hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(128, 0, 128, 0.3);"></div>
                    <span>Very Old (&gt; 1 day)</span>
                </div>
            `;
        } else {
            // Both mode or default
            legendContent = `
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(0, 255, 0, 0.3); border: 2px solid #00ff00;"></div>
                    <span>Very Recent (&lt; 5 min)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(255, 255, 0, 0.3); border: 2px solid #ffff00;"></div>
                    <span>Recent (5 min - 1 hour)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(255, 165, 0, 0.3); border: 2px solid #ffa500;"></div>
                    <span>Moderate (1 - 6 hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(255, 0, 0, 0.3); border: 2px solid #ff0000;"></div>
                    <span>Old (6 - 24 hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(128, 0, 128, 0.3); border: 2px solid #800080;"></div>
                    <span>Very Old (&gt; 1 day)</span>
                </div>
            `;
        }

        legendPopup.innerHTML = legendContent;
    }

    // Observer to watch for new posts being added (for infinite scroll)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the added node is a post or contains posts
                        if (node.matches && node.matches('[data-testid="tweet"]')) {
                            colorCodePost(node);
                        } else if (node.querySelectorAll) {
                            const posts = node.querySelectorAll('[data-testid="tweet"]');
                            posts.forEach(post => {
                                colorCodePost(post);
                            });
                        }
                    }
                });
            }
        });
    });

    // Function to remove all styling from posts
    function removeAllStyling() {
        const posts = document.querySelectorAll('[data-testid="tweet"].chrono-x-chroma');
        posts.forEach(post => {
            post.style.backgroundColor = '';
            post.style.border = '';
            post.style.borderRadius = '';
            post.style.transition = '';
            post.classList.remove('chrono-x-chroma');
            post.removeAttribute('data-post-age');
        });
    }

    // Function to reapply styling to all posts (used when colorMode setting changes)
    function reapplyAllStyling() {
        // First, remove all existing styling and markers
        const posts = document.querySelectorAll('[data-testid="tweet"].chrono-x-chroma');
        posts.forEach(post => {
            // Remove the processed class so it gets reprocessed
            post.classList.remove('chrono-x-chroma');
            post.removeAttribute('data-post-age');
            // Clear existing styles
            post.style.backgroundColor = '';
            post.style.border = '';
            post.style.borderRadius = '';
            post.style.transition = '';
        });

        // Small delay to ensure DOM is updated, then reprocess
        setTimeout(() => {
            processAllPosts();
        }, 10);
    }

    // Function to hide/show legend
    function toggleLegend(show) {
        const legend = document.getElementById('chrono-x-chroma-legend');
        const legendPopup = document.getElementById('chrono-x-chroma-legend-popup');

        if (legend) {
            legend.style.display = show ? 'flex' : 'none';
        }
        if (legendPopup) {
            legendPopup.style.display = 'none'; // Always hide popup when toggling
        }
    }

    // Function to apply current settings
    function applySettings() {
        if (settings.removeCss) {
            // Remove all styling
            removeAllStyling();
            toggleLegend(false);
        } else {
            // Apply color coding if enabled
            if (settings.colorMode !== 'off') {
                // Reapply all styling with new mode
                reapplyAllStyling();
            } else {
                removeAllStyling();
            }

            // Show/hide legend
            toggleLegend(settings.showLegend);

            // Create legend if it doesn't exist and should be shown
            if (settings.showLegend && !document.getElementById('chrono-x-chroma-legend')) {
                createLegend();
            } else if (settings.showLegend) {
                // Update existing legend content
                updateLegendContent();
            }
        }
    }

    // Listen for messages from popup
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.action === 'updateSettings') {
                console.log('Content script received new settings:', request.settings);
                settings = request.settings;
                applySettings();
                sendResponse({ success: true });
            }
        });
    }

    // Function to initialize the extension
    function init() {
        // Process existing posts
        processAllPosts();

        // Create legend
        createLegend();

        // Start observing for new posts
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Chrono X Chroma extension loaded');
    }

    // Wait for the page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also run after a short delay to catch any posts that load after initial page load
    setTimeout(function () {
        processAllPosts();
    }, 2000);

})(); 