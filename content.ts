// Chrono X Chroma - Content Script
(function (): void {
    'use strict';

    // Color scheme for different post ages
    const COLOR_SCHEME: Record<string, { bg: string; border: string }> = {
        VERY_RECENT: { bg: 'rgba(0, 255, 0, 0.1)', border: '2px solid #00ff00' }, // Green - under 5 minutes
        RECENT: { bg: 'rgba(255, 255, 0, 0.1)', border: '2px solid #ffff00' },     // Yellow - 5 minutes to 1 hour
        MODERATE: { bg: 'rgba(255, 165, 0, 0.1)', border: '2px solid #ffa500' },   // Orange - 1 hour to 6 hours
        OLD: { bg: 'rgba(255, 0, 0, 0.1)', border: '2px solid #ff0000' },          // Red - 6 hours to 1 day
        VERY_OLD: { bg: 'rgba(128, 0, 128, 0.1)', border: '2px solid #800080' }    // Purple - over 1 day
    };

    // Extension settings
    let settings: {
        colorMode: 'both' | 'border' | 'overlay' | 'off';
        showLegend: boolean;
        removeCss: boolean;
    } = {
        colorMode: 'both', // 'both', 'border', 'overlay', 'off'
        showLegend: true,
        removeCss: false
    };

    // Migrate old settings format to new format
    function migrateOldSettings(items: any): typeof settings {
        let colorMode: 'both' | 'border' | 'overlay' | 'off' = 'both'; // default

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
        chrome.storage.sync.get(null, function (items: any): void {
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
    function getPostAgeCategory(datetime: string): string {
        const now = new Date();
        const postTime = new Date(datetime);
        const diffInMinutes = (now.getTime() - postTime.getTime()) / (1000 * 60);

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
    function colorCodePost(postElement: Element): void {
        // Skip if already processed
        if (postElement.classList.contains('chrono-x-chroma')) {
            return;
        }

        // Check if color coding is enabled
        if (settings.colorMode === 'off' || settings.removeCss) {
            return;
        }

        // Find the time element with datetime attribute
        const timeElement = postElement.querySelector('time[datetime]') as HTMLTimeElement;
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
        (postElement as HTMLElement).style.backgroundColor = '';
        (postElement as HTMLElement).style.border = '';

        // Apply styling based on colorMode
        if (settings.colorMode === 'both') {
            // Both border and background
            (postElement as HTMLElement).style.backgroundColor = colors.bg;
            (postElement as HTMLElement).style.border = colors.border;
        } else if (settings.colorMode === 'border') {
            // Border only
            (postElement as HTMLElement).style.border = colors.border;
        } else if (settings.colorMode === 'overlay') {
            // Background only
            (postElement as HTMLElement).style.backgroundColor = colors.bg;
        }

        // Always apply these styles regardless of mode (unless off)
        (postElement as HTMLElement).style.borderRadius = '8px';
        (postElement as HTMLElement).style.transition = 'all 0.3s ease';

        // Mark as processed
        postElement.classList.add('chrono-x-chroma');
        postElement.setAttribute('data-post-age', ageCategory.toLowerCase());
    }

    // Function to process all posts on the page
    function processAllPosts(): void {
        const posts = document.querySelectorAll('[data-testid="tweet"]');
        posts.forEach(post => {
            colorCodePost(post);
        });
    }

    // Function to create and show the legend
    function createLegend(): void {
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
        legend.addEventListener('click', function (): void {
            if (isExpanded) {
                legendPopup.style.display = 'none';
                legend.innerHTML = '+';
                isExpanded = false;
            } else {
                updateLegendContent(); // Ensure content is always set when opening
                legendPopup.style.display = 'block';
                legend.innerHTML = '−';
                isExpanded = true;
            }
        });
    }

    // Function to update legend content based on current settings
    function updateLegendContent(): void {
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

    // Function to remove all styling from posts
    function removeAllStyling(): void {
        const posts = document.querySelectorAll('[data-testid="tweet"]');
        posts.forEach(post => {
            (post as HTMLElement).style.backgroundColor = '';
            (post as HTMLElement).style.border = '';
            (post as HTMLElement).style.borderRadius = '';
            (post as HTMLElement).style.transition = '';
            post.classList.remove('chrono-x-chroma');
            post.removeAttribute('data-post-age');
        });
    }

    // Function to reapply all styling
    // function reapplyAllStyling(): void {
    //     // Remove all existing styling first
    //     removeAllStyling();
    //
    //     // Reapply styling to all posts
    //     processAllPosts();
    //
    //     // Update legend
    //     updateLegendContent();
    // }

    // Function to toggle legend visibility
    function toggleLegend(show: boolean): void {
        const legend = document.getElementById('chrono-x-chroma-legend');
        const legendPopup = document.getElementById('chrono-x-chroma-legend-popup');

        if (legend) {
            legend.style.display = show ? 'block' : 'none';
        }
        if (legendPopup) {
            legendPopup.style.display = 'none';
        }
    }

    // Function to apply current settings
    function applySettings(): void {
        if (settings.removeCss) {
            // Remove all styling and legend
            removeAllStyling();
            const legend = document.getElementById('chrono-x-chroma-legend');
            const legendPopup = document.getElementById('chrono-x-chroma-legend-popup');
            if (legend) legend.remove();
            if (legendPopup) legendPopup.remove();
            return;
        }

        // Remove existing styling to allow reprocessing
        removeAllStyling();

        // Apply color coding to all posts
        processAllPosts();

        // Handle legend
        if (settings.showLegend) {
            createLegend();
            toggleLegend(true);
        } else {
            toggleLegend(false);
        }
    }

    // Function to initialize the extension
    function init(): void {
        console.log('Chrono X Chroma content script initialized');

        // Apply initial styling
        applySettings();

        // Set up mutation observer to handle dynamic content
        const observer = new MutationObserver((mutations) => {
            let shouldReprocess = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            if (element.querySelector && element.querySelector('[data-testid="tweet"]')) {
                                shouldReprocess = true;
                            }
                        }
                    });
                }
            });

            if (shouldReprocess) {
                setTimeout(() => {
                    processAllPosts();
                    if (settings.showLegend && !document.getElementById('chrono-x-chroma-legend')) {
                        createLegend();
                    }
                }, 100);
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Listen for messages from popup
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
                if (message.action === 'updateSettings') {
                    settings = { ...settings, ...message.settings };
                    applySettings();
                    sendResponse({ success: true });
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 