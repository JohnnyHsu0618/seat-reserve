<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="handleBackdropClick">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all" @click.stop>
      <div class="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Sign In</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Error Message -->
        <div v-if="authStore.error" class="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p class="text-red-600 dark:text-red-400 text-sm">{{ authStore.error }}</p>
        </div>
        
        <div class="space-y-4">
          <button 
            @click="handleGoogleLogin"
            :disabled="authStore.loading"
            class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="!authStore.loading" class="fab fa-google" style="color: #4285F4;"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span class="text-gray-700 dark:text-gray-300 font-medium">
              {{ authStore.loading ? 'Signing in...' : 'Continue with Google' }}
            </span>
          </button>
        </div>
        
        <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          By signing in, you agree to our 
          <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a> 
          and 
          <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

const handleBackdropClick = () => {
  emit('close')
}

const handleGoogleLogin = async () => {
  try {
    authStore.clearError()
    await authStore.signInWithGoogle()
    emit('close') // Close modal on successful login
  } catch (error) {
    // Error is handled in the store
    console.error('Login failed:', error)
  }
}
</script> 