<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
    <div class="text-center">
      <img 
        :src="authStore.userPhotoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face'"
        :alt="displayName"
        class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-600 dark:border-blue-400"
      >
      <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-1">{{ displayName }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ authStore.userEmail }}</p>
      
      <div class="grid grid-cols-2 gap-4 text-center">
        <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ seatsStore.userReservations.length }}</div>
          <div class="text-xs text-gray-600 dark:text-gray-300">Total Reservations</div>
        </div>
        <div class="bg-green-50 dark:bg-green-900 rounded-lg p-3">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ upcomingCount }}</div>
          <div class="text-xs text-gray-600 dark:text-gray-300">Upcoming</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSeatsStore } from '../stores/seats'
import { useUserProfileStore } from '../stores/userProfile'

const authStore = useAuthStore()
const seatsStore = useSeatsStore()
const userProfileStore = useUserProfileStore()

const upcomingCount = computed(() => {
  return seatsStore.upcomingReservations.length
})

// Use profile display name or fallback to auth display name
const displayName = computed(() => {
  return userProfileStore.profileData?.displayName || authStore.userDisplayName || 'User'
})

// Load data when component mounts
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user) {
    try {
      // Initialize user profile
      await userProfileStore.initializeUserProfile(authStore.user.uid)
      
      // Load reservations
      await seatsStore.fetchReservations()
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }
})
</script> 