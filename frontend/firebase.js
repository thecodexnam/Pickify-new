// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "pickify-new.firebaseapp.com",
  projectId: "pickify-new",
  storageBucket: "pickify-new.firebasestorage.app",
  messagingSenderId: "276612824962",
  appId: "1:276612824962:web:d5690fd6c03123eb55599b",
  measurementId: "G-6ZFKCR5NFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {app,auth}