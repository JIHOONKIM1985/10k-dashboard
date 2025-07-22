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
      rate: uploadData.rate ?? null,
      singleRate: uploadData.singleRate ?? null,
      compareRate: uploadData.compareRate ?? null,
      placeRate: uploadData.placeRate ?? null,
      quizRate: uploadData.quizRate ?? null,
      saveRate: uploadData.saveRate ?? null,
      save2Rate: uploadData.save2Rate ?? null,
      keepRate: uploadData.keepRate ?? null,
    };
  }
  return null;
}

// 어제 집행 물량 집계 Firestore에 저장
export async function saveAdInflowSummary(summary: any) {
  await setDoc(doc(db, "global", "adInflowSummary"), { ...summary, updatedAt: Date.now() });
}

// 어제 집행 물량 집계 Firestore에서 불러오기
export async function loadAdInflowSummary() {
  const docRef = doc(db, "global", "adInflowSummary");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const { updatedAt, ...summary } = data;
    return summary;
  }
  return null;
}

// 날짜별 광고유형별 유입수 집계 Firestore에 누적 저장
export async function saveAdInflowHistory(date: string, summary: Record<string, number>) {
  const docRef = doc(db, "global", "adInflowHistory");
  const docSnap = await getDoc(docRef);
  let history: Record<string, any> = {};
  if (docSnap.exists()) {
    history = docSnap.data();
  }
  history[date] = { ...summary, updatedAt: Date.now() };
  await setDoc(docRef, history);
}

// 날짜별 광고유형별 유입수 집계 Firestore에서 불러오기
export async function loadAdInflowHistory() {
  const docRef = doc(db, "global", "adInflowHistory");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data;
  }
  return {};
}
