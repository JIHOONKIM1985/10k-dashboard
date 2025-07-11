// src/utils/firestoreService.ts
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
