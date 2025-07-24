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
      reportRows: uploadData.reportRows ? JSON.parse(uploadData.reportRows) : [],
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
  console.log('=== saveAdInflowHistory 함수 ===');
  console.log('받은 날짜:', date);
  console.log('받은 summary:', summary);
  
  const docRef = doc(db, "global", "adInflowHistory");
  
  // 기존 데이터 가져오기
  const docSnap = await getDoc(docRef);
  let history: Record<string, any> = {};
  if (docSnap.exists()) {
    history = docSnap.data();
    console.log('기존 history:', history);
  }
  
  console.log('=== 저장 전 확인 ===');
  console.log('기존 날짜들:', Object.keys(history));
  console.log('저장하려는 날짜:', date);
  console.log('기존 데이터에서 해당 날짜:', history[date]);
  
  // 새로운 데이터로 해당 날짜 업데이트
  history[date] = { ...summary, updatedAt: Date.now() };
  console.log('저장할 history:', history);
  console.log('저장할 날짜 키:', date);
  console.log('저장할 데이터:', history[date]);
  console.log('최종 저장할 전체 데이터의 날짜들:', Object.keys(history));
  
  console.log('=== 최종 저장 전 최종 확인 ===');
  console.log('저장할 문서 경로:', docRef.path);
  console.log('저장할 전체 데이터:', history);
  
  // 문서를 완전히 삭제하고 새로 생성
  await setDoc(docRef, history);
  console.log('Firestore 저장 완료');
  
  // 저장 후 즉시 확인
  const verifyDoc = await getDoc(docRef);
  if (verifyDoc.exists()) {
    const verifiedData = verifyDoc.data();
    console.log('=== 저장 후 검증 ===');
    console.log('실제 저장된 데이터:', verifiedData);
    console.log('실제 저장된 날짜들:', Object.keys(verifiedData));
    console.log('해당 날짜 데이터:', verifiedData[date]);
  }
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

// reportMultiInputs Firestore에 저장
export async function saveReportInputs(inputs: any) {
  await setDoc(doc(db, "global", "reportInputs"), { ...inputs, updatedAt: Date.now() });
}

// reportMultiInputs Firestore에서 불러오기
export async function loadReportInputs() {
  const docRef = doc(db, "global", "reportInputs");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const { updatedAt, ...inputs } = data;
    return inputs;
  }
  return {};
}

// reportDropdownOptions Firestore에 저장
export async function saveReportDropdownOptions(options: string[]) {
  await setDoc(doc(db, "global", "reportDropdownOptions"), { options, updatedAt: Date.now() });
}

// reportDropdownOptions Firestore에서 불러오기
export async function loadReportDropdownOptions() {
  const docRef = doc(db, "global", "reportDropdownOptions");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return Array.isArray(data.options) ? data.options : [];
  }
  return [];
}
