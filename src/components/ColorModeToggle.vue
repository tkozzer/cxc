<template>
  <div class="flex flex-col space-y-3">
    <!-- Mode Selection -->
    <div :class="[
      'grid grid-cols-4 rounded-lg p-1 relative transition-colors gap-0',
      theme === 'dark' 
        ? 'bg-neutral-700 border border-neutral-600' 
        : 'bg-neutral-200 border border-neutral-300'
    ]">
      <!-- Background slider -->
      <div 
        :class="[
          'absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-in-out',
          theme === 'dark' ? 'bg-neutral-600' : 'bg-white'
        ]"
        :style="sliderStyle"
      ></div>
      
      <!-- Option buttons -->
      <button
        v-for="(option, index) in options"
        :key="option.value"
        @click="selectOption(option.value)"
        :class="[
          'relative z-10 px-2 py-2 text-xs font-medium rounded-md transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'flex items-center justify-center text-center',
          selectedValue === option.value
            ? theme === 'dark' 
              ? 'text-white' 
              : 'text-neutral-900'
            : theme === 'dark' 
              ? 'text-neutral-300 hover:text-white' 
              : 'text-neutral-600 hover:text-neutral-900'
        ]"
        :title="option.description"
      >
        {{ option.label }}
      </button>
    </div>
    
    <!-- Visual Preview -->
    <div class="flex gap-2 justify-center">
      <div 
        v-for="(color, index) in previewColors"
        :key="index"
        :class="[
          'w-4 h-4 rounded transition-all duration-200',
          getPreviewStyle(color)
        ]"
        :title="color.title"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'both' // 'both', 'border', 'overlay', 'off'
  },
  theme: {
    type: String,
    default: 'light'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const options = [
  { 
    value: 'both', 
    label: 'Both', 
    description: 'Show both colored borders and background overlay' 
  },
  { 
    value: 'border', 
    label: 'Border', 
    description: 'Show only colored borders' 
  },
  { 
    value: 'overlay', 
    label: 'Overlay', 
    description: 'Show only background overlay' 
  },
  { 
    value: 'off', 
    label: 'Off', 
    description: 'Disable all color coding' 
  }
]

const previewColors = [
  { name: 'green', title: 'Very Recent (< 5 min)' },
  { name: 'yellow', title: 'Recent (5 min - 1 hour)' },
  { name: 'orange', title: 'Moderate (1 - 6 hours)' },
  { name: 'red', title: 'Old (6 - 24 hours)' },
  { name: 'purple', title: 'Very Old (> 1 day)' }
]

const selectedValue = computed(() => props.modelValue)

const sliderStyle = computed(() => {
  const index = options.findIndex(option => option.value === selectedValue.value)
  const width = `${100 / options.length}%`
  const left = `${(index * 100) / options.length}%`
  
  return {
    width,
    left
  }
})

const selectOption = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const getPreviewStyle = (color) => {
  const borderColors = {
    green: 'border-green-500',
    yellow: 'border-yellow-500', 
    orange: 'border-orange-500',
    red: 'border-red-500',
    purple: 'border-purple-500'
  }
  
  const backgroundColors = {
    green: 'bg-green-500/30',
    yellow: 'bg-yellow-500/30',
    orange: 'bg-orange-500/30', 
    red: 'bg-red-500/30',
    purple: 'bg-purple-500/30'
  }
  
  if (selectedValue.value === 'off') {
    return 'border-2 border-neutral-300 bg-transparent'
  } else if (selectedValue.value === 'border') {
    return `border-2 ${borderColors[color.name]} bg-transparent`
  } else if (selectedValue.value === 'overlay') {
    return `border-2 border-transparent ${backgroundColors[color.name]}`
  } else if (selectedValue.value === 'both') {
    return `border-2 ${borderColors[color.name]} ${backgroundColors[color.name]}`
  }
  
  return 'border-2 border-neutral-300 bg-transparent'
}
</script>

<style scoped>
@reference "../style.css";
</style> 