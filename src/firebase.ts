import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQhJGV7WK5MSZJSHudETqDeoZUBwGHV0A",
  authDomain: "atomic-light-zvdqx.firebaseapp.com",
  projectId: "atomic-light-zvdqx",
  storageBucket: "atomic-light-zvdqx.firebasestorage.app",
  messagingSenderId: "940562567070",
  appId: "1:940562567070:web:2534bb3bae58c0c298508f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-kuchipudidanceac-75c24e6d-36e4-4e2d-a000-e067d59b535f");

export { app, db };
