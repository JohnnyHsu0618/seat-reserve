<template>
  <nav class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <i class="fas fa-chair text-2xl text-blue-600 dark:text-blue-400"></i>
            <span class="text-xl font-bold text-gray-800 dark:text-white">SeatReserve</span>
          </router-link>
        </div>

        <!-- User Actions -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button 
            @click="toggleTheme" 
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <i class="fas fa-moon dark:hidden"></i>
            <i class="fas fa-sun hidden dark:inline"></i>
          </button>
          
          <!-- User Menu (if logged in) -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button 
              @click="toggleUserDropdown"
              class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
            >
              <img 
                :src="authStore.userPhotoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'"
                :alt="authStore.userDisplayName" 
                class="w-6 h-6 rounded-full"
              >
              <span class="text-gray-700 dark:text-gray-300 font-medium">{{ authStore.userDisplayName }}</span>
              <i class="fas fa-chevron-down text-gray-500 dark:text-gray-400"></i>
            </button>

            <!-- Dropdown Menu -->
            <div 
              v-if="showUserDropdown"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
            >
              <router-link 
                to="/profile"
                class="block px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                @click="showUserDropdown = false"
              >
                <i class="fas fa-user mr-2"></i>
                Profile
              </router-link>
              <hr class="border-gray-200 dark:border-gray-700 my-1">
              <button 
                @click="handleLogout"
                :disabled="authStore.loading"
                class="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sign-out-alt mr-2"></i>
                {{ authStore.loading ? 'Signing out...' : 'Sign Out' }}
              </button>
            </div>
          </div>

          <!-- Login Button (if not logged in) -->
          <button 
            v-else
            @click="$emit('toggle-login')"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>
            Sign In
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useAuthStore } from '../stores/auth'

interface Props {
  showUserMenu?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showUserMenu: false
})

const emit = defineEmits<{
  'toggle-login': []
}>()

const { toggleTheme } = useTheme()
const authStore = useAuthStore()
const showUserDropdown = ref(false)

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleLogout = async () => {
  try {
    await authStore.signOutUser()
    showUserDropdown.value = false
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 