import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from './auth'

export interface Seat {
  id: string
  seatNumber: string
  status: 'available' | 'occupied'
  reservedBy?: string
  reservedUntil?: Date
}

export interface Reservation {
  id: string
  seatNumber: string
  userId: string
  userEmail: string
  userName: string
  startTime: Date
  endTime: Date
  date: Date
  status: 'upcoming' | 'completed' | 'cancelled'
  createdAt: Date
}

export const useSeatsStore = defineStore('seats', () => {
  // State
  const seats = ref<Seat[]>([])
  const reservations = ref<Reservation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Initialize default seats (4x4 grid)
  const initializeSeats = () => {
    const defaultSeats: Seat[] = []
    const rows = ['A', 'B', 'C', 'D']
    const cols = [1, 2, 3, 4]
    
    rows.forEach(row => {
      cols.forEach(col => {
        defaultSeats.push({
          id: `${row}${col}`,
          seatNumber: `${row}${col}`,
          status: 'available'
        })
      })
    })
    
    seats.value = defaultSeats
  }

  // Getters
  const availableSeats = computed(() => 
    seats.value.filter(seat => seat.status === 'available')
  )
  
  const occupiedSeats = computed(() => 
    seats.value.filter(seat => seat.status === 'occupied')
  )

  const userReservations = computed(() => {
    const authStore = useAuthStore()
    if (!authStore.user) return []
    
    return reservations.value.filter(reservation => 
      reservation.userId === authStore.user!.uid
    )
  })

  const upcomingReservations = computed(() => 
    userReservations.value.filter(reservation => 
      reservation.status === 'upcoming' && reservation.startTime > new Date()
    )
  )

  // Actions
  const fetchSeats = async () => {
    try {
      loading.value = true
      error.value = null

      const seatsCollection = collection(db, 'seats')
      const querySnapshot = await getDocs(seatsCollection)
      
      if (querySnapshot.empty) {
        // Initialize default seats if collection is empty
        await initializeDefaultSeats()
      } else {
        const fetchedSeats: Seat[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          fetchedSeats.push({
            id: doc.id,
            seatNumber: data.seatNumber,
            status: data.status,
            reservedBy: data.reservedBy,
            reservedUntil: data.reservedUntil?.toDate()
          })
        })
        seats.value = fetchedSeats
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching seats:', err)
      // Fallback to local seats if Firebase fails
      initializeSeats()
    } finally {
      loading.value = false
    }
  }

  const initializeDefaultSeats = async () => {
    try {
      const rows = ['A', 'B', 'C', 'D']
      const cols = [1, 2, 3, 4]
      const seatsCollection = collection(db, 'seats')
      
      for (const row of rows) {
        for (const col of cols) {
          const seatNumber = `${row}${col}`
          await addDoc(seatsCollection, {
            seatNumber,
            status: 'available',
            createdAt: Timestamp.now()
          })
        }
      }
      
      // Fetch the newly created seats
      await fetchSeats()
    } catch (err: any) {
      console.error('Error initializing default seats:', err)
      // Fallback to local initialization
      initializeSeats()
    }
  }

  const fetchReservations = async () => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) return

      const reservationsCollection = collection(db, 'reservations')
      const q = query(
        reservationsCollection,
        where('userId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const fetchedReservations: Reservation[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedReservations.push({
          id: doc.id,
          seatNumber: data.seatNumber,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          date: data.date.toDate(),
          status: data.status,
          createdAt: data.createdAt.toDate()
        })
      })
      
      reservations.value = fetchedReservations
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching reservations:', err)
    }
  }

  const createReservation = async (reservationData: {
    seatNumber: string
    timeSlot: string
    date: string
  }) => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User must be authenticated to make a reservation')
      }

      loading.value = true
      error.value = null

      // Parse time slot (e.g., "09:00-11:00")
      const [startTime, endTime] = reservationData.timeSlot.split('-')
      const reservationDate = new Date(reservationData.date)
      
      const startDateTime = new Date(reservationDate)
      const [startHour, startMinute] = startTime.split(':')
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0)
      
      const endDateTime = new Date(reservationDate)
      const [endHour, endMinute] = endTime.split(':')
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0)

      // Create reservation document
      const reservationsCollection = collection(db, 'reservations')
      const newReservation = {
        seatNumber: reservationData.seatNumber,
        userId: authStore.user.uid,
        userEmail: authStore.user.email,
        userName: authStore.user.displayName,
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        date: Timestamp.fromDate(reservationDate),
        status: 'upcoming',
        createdAt: Timestamp.now()
      }

      const docRef = await addDoc(reservationsCollection, newReservation)
      
      // Update seat status
      await updateSeatStatus(reservationData.seatNumber, 'occupied', authStore.user.uid, endDateTime)
      
      console.log('Reservation created with ID:', docRef.id)
      
      // Refresh data
      await Promise.all([fetchSeats(), fetchReservations()])
      
      return docRef.id
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating reservation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSeatStatus = async (
    seatNumber: string, 
    status: 'available' | 'occupied', 
    reservedBy?: string,
    reservedUntil?: Date
  ) => {
    try {
      // Find seat document
      const seatsCollection = collection(db, 'seats')
      const q = query(seatsCollection, where('seatNumber', '==', seatNumber))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const seatDoc = querySnapshot.docs[0]
        const updateData: any = {
          status,
          updatedAt: Timestamp.now()
        }
        
        if (status === 'occupied' && reservedBy && reservedUntil) {
          updateData.reservedBy = reservedBy
          updateData.reservedUntil = Timestamp.fromDate(reservedUntil)
        } else {
          updateData.reservedBy = null
          updateData.reservedUntil = null
        }
        
        await updateDoc(doc(db, 'seats', seatDoc.id), updateData)
      }
    } catch (err: any) {
      console.error('Error updating seat status:', err)
      throw err
    }
  }

  const cancelReservation = async (reservationId: string) => {
    try {
      loading.value = true
      error.value = null

      // Update reservation status
      const reservationRef = doc(db, 'reservations', reservationId)
      await updateDoc(reservationRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      })

      // Find the reservation to get seat number
      const reservation = reservations.value.find(r => r.id === reservationId)
      if (reservation) {
        // Update seat status to available
        await updateSeatStatus(reservation.seatNumber, 'available')
      }

      // Refresh data
      await Promise.all([fetchSeats(), fetchReservations()])
      
      console.log('Reservation cancelled successfully')
    } catch (err: any) {
      error.value = err.message
      console.error('Error cancelling reservation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    seats,
    reservations,
    loading,
    error,
    
    // Getters
    availableSeats,
    occupiedSeats,
    userReservations,
    upcomingReservations,
    
    // Actions
    initializeSeats,
    fetchSeats,
    fetchReservations,
    createReservation,
    updateSeatStatus,
    cancelReservation,
    clearError
  }
}) 