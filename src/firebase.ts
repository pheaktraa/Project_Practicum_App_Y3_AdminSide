// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIMG0hsMnKUsBvm1FFMu_--kK0IgyYmgE",
  authDomain: "project-practicum-app-year-3.firebaseapp.com",
  projectId: "project-practicum-app-year-3",
  storageBucket: "project-practicum-app-year-3.firebasestorage.app",
  messagingSenderId: "55743577466",
  appId: "1:55743577466:web:b2270255d7909579642ac3",
  measurementId: "G-PD3K7PHV86",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);