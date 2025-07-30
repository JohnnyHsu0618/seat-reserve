<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">
      <i class="fas fa-bolt mr-2 text-yellow-600 dark:text-yellow-400"></i>
      Quick Actions
    </h3>
    <div class="mb-4">
      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
        <i class="fas fa-lightbulb mr-2 text-yellow-400"></i>
        <span>
          Tip: Export your history or make a new booking here!
        </span>
      </div>
    </div>
    <div class="space-y-3">
      <router-link 
        to="/"
        class="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center"
      >
        <i class="fas fa-plus mr-2"></i>
        Make New Reservation
      </router-link>
      <button 
        @click="exportReservations"
        class="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
      >
        <i class="fas fa-download mr-2"></i>
        Export History
        <span class="ml-2 inline-block align-middle text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200 px-2 py-0.5 rounded font-semibold">
          Beta
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const exportReservations = () => {
  console.log('Exporting reservations...')
  alert('Exporting reservation history...')
  // TODO: Implement actual export functionality
}
</script> 