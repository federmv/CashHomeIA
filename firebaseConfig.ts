// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_yhjWSgmwUqq6jAxL_FDZd_WFRKB0nI8",
  authDomain: "financesmart-64769.firebaseapp.com",
  projectId: "financesmart-64769",
  storageBucket: "financesmart-64769.firebasestorage.app",
  messagingSenderId: "658493860241",
  appId: "1:658493860241:web:2001d25a106b6f7f039230",
  measurementId: "G-EWP8EWR6WV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);