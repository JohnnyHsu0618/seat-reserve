// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgggh_KJ0Er4neTaMn6YE2FdDcZxGxP4A",
  authDomain: "j-seat-app.firebaseapp.com",
  projectId: "j-seat-app",
  storageBucket: "j-seat-app.firebasestorage.app",
  messagingSenderId: "757544578530",
  appId: "1:757544578530:web:be51ece6165062efc6ddbb",
  measurementId: "G-C0BZE5LJPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;