<template>
  <div class="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
        <i class="fas fa-history mr-3 text-purple-600 dark:text-purple-400"></i>
        Reservation History
      </h2>
      <div class="flex items-center space-x-2">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search reservations by seat number"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          style="width: 300px;"
        >
        <button class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <div class="flex items-center space-x-3">
        <select 
          v-model="filterStatus"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <i class="fas fa-filter"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="seatsStore.loading" class="flex justify-center items-center py-8">
      <i class="fas fa-spinner fa-spin text-2xl text-blue-600 dark:text-blue-400"></i>
      <span class="ml-2 text-gray-600 dark:text-gray-300">Loading reservations...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="seatsStore.error" class="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
      <p class="text-red-600 dark:text-red-400">{{ seatsStore.error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredReservations.length === 0" class="text-center py-8">
      <i class="fas fa-calendar-times text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No reservations found</h3>
      <p class="text-gray-500 dark:text-gray-500">
        {{ searchQuery ? 'Try adjusting your search criteria.' : 'Make your first reservation to get started!' }}
      </p>
    </div>

    <!-- Reservation List -->
    <div v-else class="space-y-4">
      <div 
        v-for="reservation in filteredReservations" 
        :key="reservation.id"
        :class="[
          'border rounded-lg p-4',
          reservation.status === 'upcoming' ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700' :
          reservation.status === 'completed' ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' :
          'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
        ]"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-4">
            <div 
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center',
                reservation.status === 'upcoming' ? 'bg-blue-600' :
                reservation.status === 'completed' ? 'bg-gray-600' :
                'bg-red-600'
              ]"
            >
              <span class="text-white font-bold">{{ reservation.seatNumber }}</span>
            </div>
            <div>
              <h4 class="font-semibold text-gray-800 dark:text-white">Seat {{ reservation.seatNumber }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ formatDateTime(reservation.date, reservation.startTime, reservation.endTime) }}
              </p>
              <p 
                :class="[
                  'text-xs font-medium',
                  reservation.status === 'upcoming' ? 'text-blue-600 dark:text-blue-400' :
                  reservation.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                  'text-red-600 dark:text-red-400'
                ]"
              >
                {{ reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1) }}
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button 
              v-if="reservation.status === 'upcoming'"
              @click="modifyReservation(reservation)"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              title="Modify reservation"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              v-if="reservation.status === 'upcoming'"
              @click="cancelReservation(reservation)"
              :disabled="cancellingReservations.has(reservation.id)"
              class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50"
              title="Cancel reservation"
            >
              <i :class="cancellingReservations.has(reservation.id) ? 'fas fa-spinner fa-spin' : 'fas fa-times'"></i>
            </button>
            <button 
              v-if="reservation.status !== 'upcoming'"
              @click="repeatReservation(reservation)"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              title="Make similar reservation"
            >
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredReservations.length > 0" class="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        Showing {{ filteredReservations.length }} of {{ seatsStore.userReservations.length }} reservations
      </p>
      <div class="flex space-x-2">
        <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Previous
        </button>
        <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
        <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeatsStore } from '../stores/seats'
import { useAuthStore } from '../stores/auth'
import type { Reservation } from '../stores/seats'

const seatsStore = useSeatsStore()
const authStore = useAuthStore()
const searchQuery = ref('')
const filterStatus = ref('')
const cancellingReservations = ref(new Set<string>())

const filteredReservations = computed(() => {
  let results = seatsStore.userReservations

  // Filter by search query
  if (searchQuery.value) {
    results = results.filter(reservation => 
      reservation.seatNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by status
  if (filterStatus.value) {
    results = results.filter(reservation => 
      reservation.status === filterStatus.value
    )
  }

  // Sort by date (newest first)
  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

const formatDateTime = (date: Date, startTime: Date, endTime: Date) => {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  const startTimeStr = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  const endTimeStr = endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  return `${dateStr}, ${startTimeStr} - ${endTimeStr}`
}

const modifyReservation = (reservation: Reservation) => {
  console.log('Modify reservation:', reservation)
  alert(`Modify reservation for seat ${reservation.seatNumber}`)
  // TODO: Implement reservation modification modal
}

const cancelReservation = async (reservation: Reservation) => {
  if (!confirm(`Are you sure you want to cancel the reservation for seat ${reservation.seatNumber}?`)) {
    return
  }

  try {
    cancellingReservations.value.add(reservation.id)
    await seatsStore.cancelReservation(reservation.id)
    console.log('Reservation cancelled successfully')
  } catch (error) {
    console.error('Failed to cancel reservation:', error)
    alert('Failed to cancel reservation. Please try again.')
  } finally {
    cancellingReservations.value.delete(reservation.id)
  }
}

const repeatReservation = (reservation: Reservation) => {
  console.log('Repeat reservation:', reservation)
  alert(`Redirecting to make a new reservation for seat ${reservation.seatNumber}`)
  // TODO: Redirect to home page with pre-selected seat
}

// Load reservations when component mounts
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await seatsStore.fetchReservations()
    } catch (error) {
      console.error('Failed to load reservations:', error)
    }
  }
})
</script> 