// src/utils/firestoreService.ts
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

// 1. 보정치 저장/불러오기
export async function saveAdjustment(adjustment: any) {
  console.log("saveAdjustment 호출됨", adjustment); // 추가
  await setDoc(doc(db, "global", "adjustment"), adjustment);
}
export async function loadAdjustment() {
  const docRef = doc(db, "global", "adjustment");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// 2. 업로드 데이터 저장/불러오기
export async function saveUploadData(uploadData: any) {
  console.log("saveUploadData 호출됨", uploadData); // 추가
  await setDoc(doc(db, "global", "uploadData"), uploadData);
}
export async function loadUploadData() {
  const docRef = doc(db, "global", "uploadData");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// 3. 업로드 이력 누적 저장/불러오기
export async function saveUploadHistory(date: string, uploadData: any) {
  // date: 'YYYY-MM-DD' 형식
  await setDoc(doc(db, "global", "uploadHistory", date), uploadData);
}
export async function loadUploadHistory() {
  // global/uploadHistory 컬렉션의 모든 문서 불러오기
  const colRef = collection(db, "global", "uploadHistory");
  const q = query(colRef, orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}

// 4. 보정치 이력 누적 저장/불러오기
export async function saveAdjustmentHistory(adjustment: any, savedAt: number) {
  // savedAt: timestamp (ms)
  await setDoc(doc(db, "global", "adjustmentHistory", String(savedAt)), {
    ...adjustment,
    savedAt,
  });
}
export async function loadAdjustmentHistory() {
  const colRef = collection(db, "global", "adjustmentHistory");
  const q = query(colRef, orderBy("savedAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}
