// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDO9zXOdSpxLiryacmSok34gHtuxiXFUx4",
  authDomain: "student-management-syste-1b7ff.firebaseapp.com",
  projectId: "student-management-syste-1b7ff",
  storageBucket: "student-management-syste-1b7ff.firebasestorage.app",
  messagingSenderId: "750207478658",
  appId: "1:750207478658:web:ff5e9c47d0414ad8b23d9b",
  measurementId: "G-GCCENRCJ6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // For Firebase Authentication
export const db = getFirestore(app);
const analytics = getAnalytics(app);