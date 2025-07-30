<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="handleBackdropClick">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all" @click.stop>
      <div class="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Reserve Seat</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-6">
          <!-- Seat Info -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Seat {{ seat }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">Premium seating area</p>
              </div>
              <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold">{{ seat }}</span>
              </div>
            </div>
            <div class="mt-3 flex items-center">
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              <span class="text-sm text-gray-600 dark:text-gray-300">Available for reservation</span>
            </div>
          </div>

          <!-- Selected Date Display -->
          <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div class="flex items-center">
              <i class="fas fa-calendar-alt text-blue-600 dark:text-blue-400 mr-3"></i>
              <div>
                <h4 class="font-medium text-gray-800 dark:text-white">Selected Date</h4>
                <p class="text-blue-600 dark:text-blue-400 font-semibold">{{ formatDate(selectedDate) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="seatsStore.error" class="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p class="text-red-600 dark:text-red-400 text-sm">{{ seatsStore.error }}</p>
          </div>
          
          <!-- Time Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Time Slot</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                v-for="slot in timeSlots"
                :key="slot.value"
                @click="selectedTimeSlot = slot.value"
                :class="[
                  'time-slot p-3 border rounded-lg text-center transition-colors',
                  selectedTimeSlot === slot.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900'
                ]"
              >
                <div class="font-medium text-gray-800 dark:text-white">{{ slot.start }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-300">to {{ slot.end }}</div>
              </button>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="$emit('close')"
              :disabled="seatsStore.loading"
              class="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              @click="confirmReservation"
              :disabled="!selectedTimeSlot || seatsStore.loading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors font-medium"
            >
              {{ seatsStore.loading ? 'Creating...' : 'Confirm Reservation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSeatsStore } from '../stores/seats'
import { useAuthStore } from '../stores/auth'

interface Props {
  seat: string
  selectedDate: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [reservationData: any]
}>()

const seatsStore = useSeatsStore()
const authStore = useAuthStore()
const selectedTimeSlot = ref('')

const timeSlots = [
  { value: '09:00-11:00', start: '9:00 AM', end: '11:00 AM' },
  { value: '11:00-13:00', start: '11:00 AM', end: '1:00 PM' },
  { value: '13:00-15:00', start: '1:00 PM', end: '3:00 PM' },
  { value: '15:00-17:00', start: '3:00 PM', end: '5:00 PM' },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handleBackdropClick = () => {
  emit('close')
}

const confirmReservation = async () => {
  if (!selectedTimeSlot.value) {
    alert('Please select a time slot')
    return
  }

  if (!authStore.isAuthenticated) {
    alert('Please sign in to make a reservation')
    return
  }
  
  try {
    seatsStore.clearError()
    
    const reservationData = {
      seatNumber: props.seat,
      timeSlot: selectedTimeSlot.value,
      date: props.selectedDate
    }
    
    const reservationId = await seatsStore.createReservation(reservationData)
    
    console.log('Reservation created with ID:', reservationId)
    
    // Show success message
    alert(`Reservation confirmed for Seat ${props.seat} on ${formatDate(props.selectedDate)} at ${selectedTimeSlot.value}`)
    
    // Emit success event
    emit('confirm', {
      ...reservationData,
      id: reservationId,
      timestamp: new Date().toISOString()
    })
    
    // Close modal
    emit('close')
  } catch (error) {
    console.error('Reservation failed:', error)
    // Error is shown via seatsStore.error
  }
}
</script> 