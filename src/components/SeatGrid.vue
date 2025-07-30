<template>
  <div class="grid grid-cols-4 gap-6 max-w-lg mx-auto">
    <SeatButton
      v-for="seat in seatsStore.seats"
      :key="seat.id"
      :seat="seat"
      @seat-click="handleSeatClick"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import SeatButton from './SeatButton.vue'
import { useSeatsStore } from '../stores/seats'
import { useAuthStore } from '../stores/auth'

interface Props {
  selectedDate?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'seat-selected': [seatId: string]
}>()

const seatsStore = useSeatsStore()
const authStore = useAuthStore()

const handleSeatClick = (seatId: string) => {
  const seat = seatsStore.seats.find(s => s.id === seatId || s.seatNumber === seatId)
  if (seat && seat.status === 'available') {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      alert('Please sign in to make a reservation')
      return
    }
    
    // Directly emit seat selection without changing colors
    emit('seat-selected', seat.seatNumber)
  }
}

// Load seats when component mounts
onMounted(async () => {
  try {
    await seatsStore.fetchSeats()
  } catch (error) {
    console.error('Failed to load seats:', error)
  }
})
</script> 