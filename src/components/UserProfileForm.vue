<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 border border-gray-200 dark:border-gray-700">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
        <i class="fas fa-id-card mr-3 text-green-600 dark:text-green-400"></i>
        Personal Information
      </h2>
      <button 
        @click="toggleEditMode"
        :disabled="userProfileStore.loading"
        :class="[
          'px-4 py-2 rounded-lg transition-colors font-medium',
          isEditing 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white',
          userProfileStore.loading ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <i :class="['mr-2', isEditing ? 'fas fa-times' : 'fas fa-edit']"></i>
        {{ isEditing ? 'Cancel' : 'Edit' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="userProfileStore.error" class="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ userProfileStore.error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="userProfileStore.loading && !userProfileStore.profileData" class="flex justify-center items-center py-8">
      <i class="fas fa-spinner fa-spin text-2xl text-blue-600 dark:text-blue-400"></i>
      <span class="ml-2 text-gray-600 dark:text-gray-300">Loading profile...</span>
    </div>

    <form v-else @submit.prevent="saveProfile" class="space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <i class="fas fa-user mr-2 text-blue-600 dark:text-blue-400"></i>
            Display Name
          </label>
          <input 
            v-model="formData.displayName"
            type="text" 
            :disabled="!isEditing"
            placeholder="Enter your display name"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-colors"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <i class="fas fa-envelope mr-2 text-blue-600 dark:text-blue-400"></i>
            Email Address
          </label>
          <input 
            v-model="formData.email"
            type="email" 
            disabled
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-colors"
          >
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <i class="fas fa-phone mr-2 text-blue-600 dark:text-blue-400"></i>
          Phone Number
        </label>
        <input 
          v-model="formData.phone"
          type="tel" 
          :disabled="!isEditing"
          placeholder="Enter your phone number"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-colors"
        >
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <i class="fas fa-bell mr-2 text-blue-600 dark:text-blue-400"></i>
          Notification Preferences
        </label>
        <div class="space-y-3">
          <label class="flex items-center">
            <input 
              v-model="formData.emailNotifications"
              type="checkbox" 
              :disabled="!isEditing"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <span class="ml-3 text-gray-700 dark:text-gray-300">Email notifications for reservation confirmations</span>
          </label>
          <label class="flex items-center">
            <input 
              v-model="formData.smsNotifications"
              type="checkbox" 
              :disabled="!isEditing"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <span class="ml-3 text-gray-700 dark:text-gray-300">Email reminders 15 minutes before reservation</span>
          </label>
          <label class="flex items-center">
            <input 
              v-model="formData.pushNotifications"
              type="checkbox" 
              :disabled="!isEditing"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <span class="ml-3 text-gray-700 dark:text-gray-300">Push notifications for important updates</span>
          </label>
        </div>
      </div>

      <!-- Save/Cancel Buttons -->
      <div v-if="isEditing" class="flex space-x-3">
        <button 
          type="button" 
          @click="cancelEdit"
          :disabled="userProfileStore.loading"
          class="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          type="submit"
          :disabled="userProfileStore.loading || !hasChanges"
          class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 rounded-lg transition-colors font-medium"
        >
          <i v-if="userProfileStore.loading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ userProfileStore.loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserProfileStore, type UserProfileData } from '../stores/userProfile'

const authStore = useAuthStore()
const userProfileStore = useUserProfileStore()
const isEditing = ref(false)
const originalData = ref<UserProfileData | null>(null)

const formData = ref<UserProfileData>({
  displayName: '',
  email: '',
  phone: '',
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true
})

// Computed to check if there are changes
const hasChanges = computed(() => {
  if (!originalData.value) return false
  
  return (
    formData.value.displayName !== originalData.value.displayName ||
    formData.value.phone !== originalData.value.phone ||
    formData.value.emailNotifications !== originalData.value.emailNotifications ||
    formData.value.smsNotifications !== originalData.value.smsNotifications ||
    formData.value.pushNotifications !== originalData.value.pushNotifications
  )
})

// Initialize form data from store
const updateFormData = () => {
  if (userProfileStore.profileData) {
    formData.value = { ...userProfileStore.profileData }
  } else if (authStore.user) {
    // Fallback to auth data if no profile exists
    formData.value = {
      displayName: authStore.userDisplayName || '',
      email: authStore.userEmail || '',
      phone: authStore.user.phoneNumber || '',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    }
  }
}

// Watch for profile data changes
watch(() => userProfileStore.profileData, () => {
  updateFormData()
}, { immediate: true, deep: true })

// Watch for authentication state changes
watch(() => authStore.user, async (user) => {
  if (user) {
    // Initialize or fetch user profile when user signs in
    await userProfileStore.initializeUserProfile(user.uid)
  } else {
    // Clear profile when user signs out
    userProfileStore.clearProfile()
    isEditing.value = false
  }
}, { immediate: true })

const toggleEditMode = () => {
  if (!isEditing.value) {
    startEdit()
  } else {
    cancelEdit()
  }
}

const startEdit = () => {
  isEditing.value = true
  originalData.value = { ...formData.value }
  userProfileStore.clearError()
}

const cancelEdit = () => {
  isEditing.value = false
  if (originalData.value) {
    formData.value = { ...originalData.value }
  }
  userProfileStore.clearError()
}

const saveProfile = async () => {
  if (!authStore.user) {
    console.error('No authenticated user')
    return
  }

  try {
    userProfileStore.clearError()
    
    const updateData: Partial<UserProfileData> = {
      displayName: formData.value.displayName,
      phone: formData.value.phone,
      emailNotifications: formData.value.emailNotifications,
      smsNotifications: formData.value.smsNotifications,
      pushNotifications: formData.value.pushNotifications
    }

    await userProfileStore.updateUserProfile(authStore.user.uid, updateData)
    
    isEditing.value = false
    console.log('Profile saved successfully')
  } catch (error) {
    console.error('Error saving profile:', error)
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(async () => {
  // Initialize profile if user is already authenticated
  if (authStore.user) {
    await userProfileStore.initializeUserProfile(authStore.user.uid)
  }
})
</script> 