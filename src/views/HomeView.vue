<template>
  <div class="bg-gray-50 dark:bg-gray-900 font-sans min-h-screen">
    <!-- Navigation Bar -->
    <NavBar @toggle-login="showLoginModal = true" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Reserve Your Perfect Seat
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose from our available seating options and book your preferred spot for an optimal experience.
        </p>
      </div>

      <!-- Seat Grid Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <!-- Header with Date Selection -->
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-6 lg:space-y-0">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              <i class="fas fa-th mr-3 text-blue-600 dark:text-blue-400"></i>
              Seating Layout
            </h2>
            <div class="flex items-center space-x-6 text-sm">
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                <span class="text-gray-600 dark:text-gray-300">Available</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                <span class="text-gray-600 dark:text-gray-300">Occupied</span>
              </div>
            </div>
          </div>
          
          <!-- Date Selection -->
          <div class="flex flex-col space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              <i class="fas fa-calendar-alt mr-2 text-blue-600 dark:text-blue-400"></i>
              Select Date
            </label>
            <input 
              v-model="selectedDate"
              type="date" 
              :min="minDate"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
          </div>
        </div>

        <!-- 4x4 Seat Grid -->
        <SeatGrid @seat-selected="handleSeatSelection" :selected-date="selectedDate" />

        <!-- Help Text -->
        <div class="mt-8 text-center">
          <p class="text-gray-600 dark:text-gray-300">
            <i class="fas fa-info-circle mr-2 text-blue-600 dark:text-blue-400"></i>
            Click on an available seat to view details and make a reservation
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <FooterComponent />

    <!-- Login Modal -->
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />

    <!-- Seat Reservation Modal -->
    <SeatReservationModal 
      v-if="showSeatModal" 
      :seat="selectedSeat" 
      :selected-date="selectedDate"
      @close="showSeatModal = false"
      @confirm="handleReservationConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import SeatGrid from '../components/SeatGrid.vue'
import FooterComponent from '../components/FooterComponent.vue'
import LoginModal from '../components/LoginModal.vue'
import SeatReservationModal from '../components/SeatReservationModal.vue'

const showLoginModal = ref(false)
const showSeatModal = ref(false)
const selectedSeat = ref('')
const selectedDate = ref('')

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Set default date to today
onMounted(() => {
  selectedDate.value = minDate.value
})

const handleSeatSelection = (seatNumber: string) => {
  if (!selectedDate.value) {
    alert('Please select a date first')
    return
  }
  selectedSeat.value = seatNumber
  showSeatModal.value = true
}

const handleReservationConfirm = (reservationData: any) => {
  console.log('Reservation confirmed:', reservationData)
  // TODO: Implement Firebase reservation logic
  showSeatModal.value = false
}
</script> 