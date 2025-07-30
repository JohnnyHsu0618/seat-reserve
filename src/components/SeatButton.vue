<template>
  <div 
    @click="handleClick"
    :class="seatClasses"
    class="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold shadow-md transition-all duration-200"
  >
    {{ seat.seatNumber }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Seat {
  id: string
  seatNumber: string
  status: 'available' | 'occupied'
}

interface Props {
  seat: Seat
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'seat-click': [seatId: string]
}>()

const seatClasses = computed(() => {
  const baseClasses = []
  
  switch (props.seat.status) {
    case 'available':
      baseClasses.push('bg-green-500', 'hover:bg-green-600', 'cursor-pointer', 'hover:shadow-lg')
      break
    case 'occupied':
      baseClasses.push('bg-red-500', 'cursor-not-allowed', 'opacity-75')
      break
  }
  
  return baseClasses
})

const handleClick = () => {
  if (props.seat.status !== 'occupied') {
    emit('seat-click', props.seat.id)
  }
}
</script> 