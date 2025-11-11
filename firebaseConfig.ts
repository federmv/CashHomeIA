// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGDkF2rb9botsFe8uL76vC8Nkjw7Ey6zM",
  authDomain: "financesmart-bd362.firebaseapp.com",
  projectId: "financesmart-bd362",
  storageBucket: "financesmart-bd362.firebasestorage.app",
  messagingSenderId: "979545133559",
  appId: "1:979545133559:web:249589d1b182aaec7edef2",
  measurementId: "G-PK2QMZQW3P"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);