// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcAXaRilwev2EMXWPeWgaUSHD4vhfgMVU",
  authDomain: "fir-app-2db41.firebaseapp.com",
  projectId: "fir-app-2db41",
  storageBucket: "fir-app-2db41.appspot.com",
  messagingSenderId: "834204283363",
  appId: "1:834204283363:web:a1dc306c79b52096e8b0d6",
  measurementId: "G-1865VR8Q3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);

export { app, db };