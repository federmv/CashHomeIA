
// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Persistence failed: Browser not supported');
    }
});
