// src/utils/firestoreService.ts
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

// guestRates Firestore에 저장 (관리자 업로드 시)
export async function saveGuestRates(guestRates: any) {
  await setDoc(doc(db, "global", "guestRates"), { ...guestRates, updatedAt: Date.now() });
}

// guestRates Firestore에서 불러오기 (비로그인 사용자)
export async function loadGuestRates() {
  const docRef = doc(db, "global", "guestRates");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const { updatedAt, ...rates } = data;
    return rates;
  }
  return null;
}

// 보정치(correctionRange) Firestore에 저장
export async function saveCorrectionRange(range: any) {
  await setDoc(doc(db, "global", "adjustment"), { ...range, updatedAt: Date.now() });
}

// 보정치(correctionRange) Firestore에서 불러오기
export async function loadCorrectionRange() {
  const docRef = doc(db, "global", "adjustment");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const { updatedAt, ...range } = data;
    return range;
  }
  return null;
}

// 업로드 데이터(팩트 등락률) Firestore에 저장
export async function saveUploadData(uploadData: any) {
  await setDoc(doc(db, "global", "uploadData"), { ...uploadData, updatedAt: Date.now() });
}

// 업로드 데이터(팩트 등락률) Firestore에서 불러오기
export async function loadUploadData() {
  const docRef = doc(db, "global", "uploadData");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const { updatedAt, ...uploadData } = data;
    return {
      ...uploadData,
      rawData: uploadData.rawData ? JSON.parse(uploadData.rawData) : [],
      tempData: uploadData.tempData ? JSON.parse(uploadData.tempData) : [],
      shoppingList: uploadData.shoppingList ? JSON.parse(uploadData.shoppingList) : [],
      placeList: uploadData.placeList ? JSON.parse(uploadData.placeList) : [],
    };
  }
  return null;
}
