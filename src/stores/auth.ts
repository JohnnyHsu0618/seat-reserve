import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || 'User')
  const userEmail = computed(() => user.value?.email || 'user@test.com')
  const userPhotoURL = computed(() => user.value?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face')

  // Actions
  const signInWithGoogle = async () => {
    try {
      error.value = null
      loading.value = true
      
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      
      console.log('Successfully signed in:', result.user.displayName)
      return result.user
    } catch (err: any) {
      error.value = err.message
      console.error('Sign in error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOutUser = async () => {
    try {
      error.value = null
      await signOut(auth)
      user.value = null
      console.log('Successfully signed out')
    } catch (err: any) {
      error.value = err.message
      console.error('Sign out error:', err)
      throw err
    }
  }

  const initializeAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
      
      if (firebaseUser) {
        console.log('User is signed in:', firebaseUser.displayName)
      } else {
        console.log('User is signed out')
      }
    })
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    
    // Actions
    signInWithGoogle,
    signOutUser,
    initializeAuth,
    clearError
  }
}) 