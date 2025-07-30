import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from './auth'

export interface UserProfileData {
  displayName: string
  email: string
  phone: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  createdAt?: Date
  updatedAt?: Date
}

export const useUserProfileStore = defineStore('userProfile', () => {
  // State
  const profileData = ref<UserProfileData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchUserProfile = async (userId: string) => {
    try {
      loading.value = true
      error.value = null

      const userDocRef = doc(db, 'userProfiles', userId)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const data = userDocSnap.data()
        profileData.value = {
          displayName: data.displayName || '',
          email: data.email || '',
          phone: data.phone || '',
          emailNotifications: data.emailNotifications ?? true,
          smsNotifications: data.smsNotifications ?? false,
          pushNotifications: data.pushNotifications ?? true,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        }
      } else {
        // Profile doesn't exist, initialize with auth data
        const authStore = useAuthStore()
        if (authStore.user) {
          profileData.value = {
            displayName: authStore.user.displayName || '',
            email: authStore.user.email || '',
            phone: authStore.user.phoneNumber || '',
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true
          }
        }
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching user profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUserProfile = async (userId: string, data: Partial<UserProfileData>) => {
    try {
      loading.value = true
      error.value = null

      const userDocRef = doc(db, 'userProfiles', userId)
      const profileData: any = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      await setDoc(userDocRef, profileData)
      
      // Update local state
      await fetchUserProfile(userId)
      
      console.log('User profile created successfully')
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating user profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (userId: string, data: Partial<UserProfileData>) => {
    try {
      loading.value = true
      error.value = null

      const userDocRef = doc(db, 'userProfiles', userId)
      
      // Check if profile exists
      const userDocSnap = await getDoc(userDocRef)
      
      if (!userDocSnap.exists()) {
        // Create new profile if it doesn't exist
        await createUserProfile(userId, data)
      } else {
        // Update existing profile
        const updateData: any = {
          ...data,
          updatedAt: Timestamp.now()
        }

        await updateDoc(userDocRef, updateData)
        
        // Update local state
        await fetchUserProfile(userId)
      }
      
      console.log('User profile updated successfully')
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating user profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const initializeUserProfile = async (userId: string) => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) return

      // Check if profile exists
      const userDocRef = doc(db, 'userProfiles', userId)
      const userDocSnap = await getDoc(userDocRef)

      if (!userDocSnap.exists()) {
        // Create initial profile from auth data
        const initialData: Partial<UserProfileData> = {
          displayName: authStore.user.displayName || '',
          email: authStore.user.email || '',
          phone: authStore.user.phoneNumber || '',
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true
        }

        await createUserProfile(userId, initialData)
      } else {
        // Fetch existing profile
        await fetchUserProfile(userId)
      }
    } catch (err: any) {
      console.error('Error initializing user profile:', err)
      // Don't throw error for initialization failures
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearProfile = () => {
    profileData.value = null
  }

  return {
    // State
    profileData,
    loading,
    error,
    
    // Actions
    fetchUserProfile,
    createUserProfile,
    updateUserProfile,
    initializeUserProfile,
    clearError,
    clearProfile
  }
}) 