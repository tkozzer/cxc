<template>
  <div :class="[
    'w-80 p-5 transition-colors',
    currentTheme === 'dark' 
      ? 'bg-neutral-900 text-white' 
      : 'bg-neutral-50 text-black'
  ]">
    <!-- Header -->
    <div class="mb-5">
      <div class="flex justify-between items-center">
        <!-- Title Section -->
        <div class="flex-1 text-center">
          <h1 class="text-blue-500 font-bold text-base">
            X Color Coded Posts Settings
          </h1>
        </div>
        
        <!-- Theme Toggle Section -->
        <div 
          :class="[
            'cursor-pointer p-1 rounded transition-colors',
            currentTheme === 'dark' 
              ? 'hover:bg-neutral-700' 
              : 'hover:bg-neutral-200'
          ]"
          @click="toggleTheme"
          :title="currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        >
          <span class="text-lg block leading-none">
            {{ currentTheme === 'light' ? '🌙' : '☀️' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Settings Card with Scrolling -->
    <div :class="[
      'rounded-lg shadow-sm border overflow-hidden',
      currentTheme === 'dark' 
        ? 'bg-neutral-800 border-neutral-700' 
        : 'bg-white border-neutral-200'
    ]">
      <!-- Scrollable Content with Max Height -->
      <div :class="[
        'max-h-96 overflow-y-auto',
        currentTheme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
      ]">
        <!-- Enable Color Coding Setting -->
        <div class="p-4">
          <div :class="[
            'setting-label',
            currentTheme === 'dark' ? 'text-white' : 'text-black'
          ]">
            <span>Enable Color Coding</span>
            <ToggleSwitch 
              v-model="settings.enableColorCoding" 
              :theme="currentTheme"
              @change="saveSettings"
            />
          </div>
          <div :class="[
            'setting-description',
            currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          ]">
            Turn on/off the color coding of posts based on their age
          </div>
          <div class="flex gap-2 mt-3">
            <div 
              class="w-5 h-5 rounded border-2 border-green-500" 
              style="background: rgba(0, 255, 0, 0.3);"
              title="Very Recent (< 5 min)"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-yellow-500" 
              style="background: rgba(255, 255, 0, 0.3);"
              title="Recent (5 min - 1 hour)"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-orange-500" 
              style="background: rgba(255, 165, 0, 0.3);"
              title="Moderate (1 - 6 hours)"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-red-500" 
              style="background: rgba(255, 0, 0, 0.3);"
              title="Old (6 - 24 hours)"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-purple-500" 
              style="background: rgba(128, 0, 128, 0.3);"
              title="Very Old (> 1 day)"
            ></div>
          </div>
        </div>

        <!-- Divider -->
        <div :class="[
          'border-t',
          currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
        ]"></div>

        <!-- Border Only Setting -->
        <div class="p-4">
          <div :class="[
            'setting-label',
            currentTheme === 'dark' ? 'text-white' : 'text-black'
          ]">
            <span>Border Only Mode</span>
            <ToggleSwitch 
              v-model="settings.borderOnly" 
              :theme="currentTheme"
              @change="saveSettings"
            />
          </div>
          <div :class="[
            'setting-description',
            currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          ]">
            Show only colored borders without transparent background overlay
          </div>
          <div class="flex gap-2 mt-3">
            <div 
              class="w-5 h-5 rounded border-2 border-green-500" 
              title="Very Recent (< 5 min) - Border Only"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-yellow-500" 
              title="Recent (5 min - 1 hour) - Border Only"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-orange-500" 
              title="Moderate (1 - 6 hours) - Border Only"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-red-500" 
              title="Old (6 - 24 hours) - Border Only"
            ></div>
            <div 
              class="w-5 h-5 rounded border-2 border-purple-500" 
              title="Very Old (> 1 day) - Border Only"
            ></div>
          </div>
        </div>

        <!-- Divider -->
        <div :class="[
          'border-t',
          currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
        ]"></div>

        <!-- Show Legend Setting -->
        <div class="p-4">
          <div :class="[
            'setting-label',
            currentTheme === 'dark' ? 'text-white' : 'text-black'
          ]">
            <span>Show Legend</span>
            <ToggleSwitch 
              v-model="settings.showLegend" 
              :theme="currentTheme"
              @change="saveSettings"
            />
          </div>
          <div :class="[
            'setting-description',
            currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          ]">
            Show/hide the circular legend button in the top-left corner
          </div>
        </div>

        <!-- Divider -->
        <div :class="[
          'border-t',
          currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
        ]"></div>

        <!-- Remove CSS Setting -->
        <div class="p-4">
          <div :class="[
            'setting-label',
            currentTheme === 'dark' ? 'text-white' : 'text-black'
          ]">
            <span>Remove All CSS Styling</span>
            <ToggleSwitch 
              v-model="settings.removeCss" 
              :theme="currentTheme"
              @change="saveSettings"
            />
          </div>
          <div :class="[
            'setting-description',
            currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          ]">
            Completely disable all visual styling (emergency override)
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Button -->
    <button 
      :class="[
        'w-full px-4 py-2 rounded transition-colors text-sm mt-3',
        currentTheme === 'dark' 
          ? 'bg-red-700 hover:bg-red-800 text-white' 
          : 'bg-red-600 hover:bg-red-700 text-white'
      ]"
      @click="resetSettings"
    >
      Reset to Defaults
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ToggleSwitch from './ToggleSwitch.vue'

// Reactive state
const settings = ref({
  enableColorCoding: true,
  borderOnly: false,
  showLegend: true,
  removeCss: false
})

const currentTheme = ref('light')

// Default settings
const defaultSettings = {
  enableColorCoding: true,
  borderOnly: false,
  showLegend: true,
  removeCss: false
}

// Theme detection
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Load settings from Chrome storage
const loadSettings = () => {
  chrome.storage.sync.get(null, (items) => {
    console.log('Loaded settings:', items)
    
    // Set defaults for missing values
    settings.value.enableColorCoding = items.enableColorCoding !== undefined ? items.enableColorCoding : defaultSettings.enableColorCoding
    settings.value.borderOnly = items.borderOnly !== undefined ? items.borderOnly : defaultSettings.borderOnly
    settings.value.showLegend = items.showLegend !== undefined ? items.showLegend : defaultSettings.showLegend
    settings.value.removeCss = items.removeCss !== undefined ? items.removeCss : defaultSettings.removeCss
    
    // Handle theme
    if (items.theme) {
      currentTheme.value = items.theme
    } else {
      currentTheme.value = getSystemTheme()
    }
  })
}

// Save settings to Chrome storage
const saveSettings = () => {
  const settingsToSave = {
    ...settings.value,
    theme: currentTheme.value
  }
  
  chrome.storage.sync.set(settingsToSave, () => {
    console.log('Settings saved:', settingsToSave)
    
    // Send message to content script with error handling
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: settingsToSave
        }, (response) => {
          // Handle response or error
          if (chrome.runtime.lastError) {
            console.log('Content script not available:', chrome.runtime.lastError.message)
          } else {
            console.log('Settings sent to content script successfully')
          }
        })
      }
    })
  })
}

// Toggle theme
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  console.log('Theme toggled to:', currentTheme.value)
  saveSettings()
}

// Reset settings
const resetSettings = () => {
  settings.value = { ...defaultSettings }
  currentTheme.value = getSystemTheme()
  
  chrome.storage.sync.clear(() => {
    chrome.storage.sync.set(defaultSettings, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            settings: {
              ...defaultSettings,
              theme: currentTheme.value
            }
          }, (response) => {
            // Handle response or error
            if (chrome.runtime.lastError) {
              console.log('Content script not available:', chrome.runtime.lastError.message)
            } else {
              console.log('Reset settings sent to content script successfully')
            }
          })
        }
      })
    })
  })
}

// Initialize on mount
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
@reference "../style.css";

.setting-label {
  @apply flex justify-between items-center mb-2 font-medium;
}

.setting-description {
  @apply text-xs mb-3;
}

/* Theme-aware scrollbar styling */
.scrollbar-light, .scrollbar-dark {
  scrollbar-width: thin;
}

/* Light theme scrollbar */
.scrollbar-light::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-light::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.scrollbar-light::-webkit-scrollbar-thumb {
  background: #d4d4d8;
  border-radius: 4px;
}

.scrollbar-light::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}

/* Dark theme scrollbar */
.scrollbar-dark::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-dark::-webkit-scrollbar-track {
  background: #404040;
  border-radius: 4px;
}

.scrollbar-dark::-webkit-scrollbar-thumb {
  background: #525252;
  border-radius: 4px;
}

.scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: #737373;
}

/* Firefox scrollbar */
.scrollbar-light {
  scrollbar-color: #d4d4d8 #f5f5f5;
}

.scrollbar-dark {
  scrollbar-color: #525252 #404040;
}
</style> 