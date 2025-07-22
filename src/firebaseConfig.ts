// src/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDVjRBe_VhHHmJ2W2OlhxsmzL245sUxP3c",
  authDomain: "dashboard-10k.firebaseapp.com",
  projectId: "dashboard-10k",
  storageBucket: "dashboard-10k.firebasestorage.app",
  messagingSenderId: "201985886613",
  appId: "1:201985886613:web:d49e01253b80b8ff748e9c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };