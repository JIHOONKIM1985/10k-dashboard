// src/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVjRBe_VhHHmJ2W2OlhxsmzL245sUxP3c",
  authDomain: "dashboard-10k.firebaseapp.com",
  projectId: "dashboard-10k",
  storageBucket: "dashboard-10k.firebasestorage.app",
  messagingSenderId: "201985886613",
  appId: "1:201985886613:web:d49e01253b80b8ff748e9c"
};

// Firebase 앱 초기화
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore 초기화
const db = getFirestore(app);

// 개발 환경에서 에뮬레이터 연결 (필요시)
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export { app, db };