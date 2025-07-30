<template>
  <div class="bg-gray-50 dark:bg-gray-900 font-sans min-h-screen">
    <!-- Navigation Bar -->
    <NavBar :show-user-menu="true" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          <i class="fas fa-user mr-3 text-blue-600 dark:text-blue-400"></i>
          Profile Settings
        </h1>
        <p class="text-gray-600 dark:text-gray-300">Manage your personal information and view your reservation history</p>
      </div>

      <!-- Authentication Required Message -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-12">
        <i class="fas fa-sign-in-alt text-6xl text-gray-400 dark:text-gray-600 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">Sign In Required</h2>
        <p class="text-gray-500 dark:text-gray-500 mb-6">You need to sign in to view and manage your profile.</p>
        <router-link to="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium">
          <i class="fas fa-home mr-2"></i>
          Go to Home
        </router-link>
      </div>

      <!-- Profile Content -->
      <div v-else class="grid lg:grid-cols-3 gap-8">
        <!-- Personal Information -->
        <div class="lg:col-span-2">
          <UserProfileForm />
        </div>

        <!-- Profile Summary & Quick Actions -->
        <div class="space-y-6">
          <!-- Profile Summary -->
          <ProfileSummary />

          <!-- Quick Actions -->
          <QuickActions />
        </div>
      </div>

      <!-- Reservation History -->
      <div v-if="authStore.isAuthenticated">
        <ReservationHistory />
      </div>
    </main>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import UserProfileForm from '../components/UserProfileForm.vue'
import ProfileSummary from '../components/ProfileSummary.vue'
import QuickActions from '../components/QuickActions.vue'
import ReservationHistory from '../components/ReservationHistory.vue'
import FooterComponent from '../components/FooterComponent.vue'
import { useAuthStore } from '../stores/auth'
import { useUserProfileStore } from '../stores/userProfile'
import { useSeatsStore } from '../stores/seats'

const authStore = useAuthStore()
const userProfileStore = useUserProfileStore()
const seatsStore = useSeatsStore()

// Initialize user data when component mounts
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user) {
    try {
      // Initialize user profile and reservations in parallel
      await Promise.all([
        userProfileStore.initializeUserProfile(authStore.user.uid),
        seatsStore.fetchReservations()
      ])
    } catch (error) {
      console.error('Failed to initialize profile data:', error)
    }
  }
})
</script> 