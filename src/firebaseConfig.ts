// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVjRBe_VhHHmJ2W2OlhxsmzL245sUxP3c",
  authDomain: "dashboard-10k.firebaseapp.com",
  projectId: "dashboard-10k",
  storageBucket: "dashboard-10k.appspot.com", // ← 오타 수정: .app → .appspot.com
  messagingSenderId: "201985886613",
  appId: "1:201985886613:web:d49e01253b80b8ff748e9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };