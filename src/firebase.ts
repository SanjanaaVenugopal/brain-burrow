// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrYjdTAFcAlrTZ-e9jRyAur_xWgPVGq9I",
  authDomain: "brain-burrow.firebaseapp.com",
  projectId: "brain-burrow",
  storageBucket: "brain-burrow.firebasestorage.app",
  messagingSenderId: "3803416279",
  appId: "1:3803416279:web:104bd7a4ba0417154cd292",
  measurementId: "G-H94VRCSZ2T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
