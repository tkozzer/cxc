// X Color Coded Posts - Content Script
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
        enableColorCoding: true,
        borderOnly: false,
        showLegend: true,
        removeCss: false
    };

    // Load settings from storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(settings, function (items) {
            settings = items;
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
        if (postElement.classList.contains('x-color-coded')) {
            return;
        }

        // Check if color coding is enabled
        if (!settings.enableColorCoding || settings.removeCss) {
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

        // Apply the styling - background only if not in border-only mode
        if (!settings.borderOnly) {
            postElement.style.backgroundColor = colors.bg;
        }
        postElement.style.border = colors.border;
        postElement.style.borderRadius = '8px';
        postElement.style.transition = 'all 0.3s ease';

        // Mark as processed
        postElement.classList.add('x-color-coded');
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
        if (document.getElementById('x-color-coded-legend')) {
            return;
        }

        // Check if legend should be shown
        if (!settings.showLegend || settings.removeCss) {
            return;
        }

        const legend = document.createElement('div');
        legend.id = 'x-color-coded-legend';
        legend.innerHTML = '+';

        // Create the legend popup
        const legendPopup = document.createElement('div');
        legendPopup.id = 'x-color-coded-legend-popup';
        legendPopup.style.display = 'none';

        // Update legend content based on border-only mode
        const legendContent = settings.borderOnly ? `
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
        ` : `
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

        legendPopup.innerHTML = legendContent;

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
        const legendPopup = document.getElementById('x-color-coded-legend-popup');
        if (!legendPopup) return;

        const legendContent = settings.borderOnly ? `
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
        ` : `
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
        const posts = document.querySelectorAll('[data-testid="tweet"].x-color-coded');
        posts.forEach(post => {
            post.style.backgroundColor = '';
            post.style.border = '';
            post.style.borderRadius = '';
            post.style.transition = '';
            post.classList.remove('x-color-coded');
            post.removeAttribute('data-post-age');
        });
    }

    // Function to reapply styling to all posts (used when borderOnly setting changes)
    function reapplyAllStyling() {
        const posts = document.querySelectorAll('[data-testid="tweet"].x-color-coded');
        posts.forEach(post => {
            // Remove the processed class so it gets reprocessed
            post.classList.remove('x-color-coded');
            post.removeAttribute('data-post-age');
            // Clear existing styles
            post.style.backgroundColor = '';
            post.style.border = '';
            post.style.borderRadius = '';
            post.style.transition = '';
        });
        // Reprocess all posts
        processAllPosts();
    }

    // Function to hide/show legend
    function toggleLegend(show) {
        const legend = document.getElementById('x-color-coded-legend');
        const legendPopup = document.getElementById('x-color-coded-legend-popup');

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
            if (settings.enableColorCoding) {
                // If borderOnly setting changed, reapply all styling
                reapplyAllStyling();
            } else {
                removeAllStyling();
            }

            // Show/hide legend
            toggleLegend(settings.showLegend);

            // Create legend if it doesn't exist and should be shown
            if (settings.showLegend && !document.getElementById('x-color-coded-legend')) {
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

        console.log('X Color Coded Posts extension loaded');
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