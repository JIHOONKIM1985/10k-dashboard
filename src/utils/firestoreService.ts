// src/utils/firestoreService.ts
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Firebase 연결 상태 확인 함수
export async function checkFirebaseConnection() {
  try {
    console.log("=== Firebase 연결 상태 확인 ===");
    console.log("Firestore db:", db);
    
    // 간단한 테스트 문서 읽기 시도
    const testDocRef = doc(db, "global", "test");
    console.log("테스트 문서 참조:", testDocRef);
    const testDocSnap = await getDoc(testDocRef);
    console.log("Firebase 연결 성공 - 테스트 문서 읽기 가능");
    return true;
  } catch (error: any) {
    console.error("Firebase 연결 실패:", error);
    console.error("에러 코드:", error.code);
    console.error("에러 메시지:", error.message);
    console.error("에러 스택:", error.stack);
    return false;
  }
}

// 더 자세한 Firebase 상태 확인
export async function debugFirebaseStatus() {
  try {
    console.log("=== Firebase 상세 디버깅 ===");
    console.log("현재 시간:", new Date().toISOString());
    console.log("환경:", process.env.NODE_ENV);
    console.log("Firestore db 객체:", db);
    
    // 실제 데이터가 있는 문서로 테스트
    const guestRatesRef = doc(db, "global", "guestRates");
    console.log("guestRates 문서 참조:", guestRatesRef);
    
    const guestRatesSnap = await getDoc(guestRatesRef);
    console.log("guestRates 문서 존재:", guestRatesSnap.exists());
    if (guestRatesSnap.exists()) {
      console.log("guestRates 데이터:", guestRatesSnap.data());
    }
    
    return true;
  } catch (error: any) {
    console.error("Firebase 디버깅 실패:", error);
    return false;
  }
}

// guestRates Firestore에 저장 (관리자 업로드 시)
export async function saveGuestRates(guestRates: any) {
  try {
    await setDoc(doc(db, "global", "guestRates"), { ...guestRates, updatedAt: Date.now() });
    console.log("guestRates 저장 성공");
  } catch (error) {
    console.error("guestRates 저장 실패:", error);
    throw error;
  }
}

// guestRates Firestore에서 불러오기 (비로그인 사용자)
export async function loadGuestRates() {
  try {
    console.log("guestRates 로딩 시작...");
    const docRef = doc(db, "global", "guestRates");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { updatedAt, ...rates } = data;
      console.log("guestRates 로딩 성공:", rates);
      return rates;
    } else {
      console.log("guestRates 문서가 존재하지 않습니다.");
      return null;
    }
  } catch (error: any) {
    console.error("guestRates 로딩 실패:", error);
    if (error.code === 'permission-denied') {
      console.error("Firebase 권한 오류: Firestore 보안 규칙을 확인해주세요.");
    }
    return null;
  }
}

// 보정치(correctionRange) Firestore에 저장
export async function saveCorrectionRange(range: any) {
  try {
    await setDoc(doc(db, "global", "adjustment"), { ...range, updatedAt: Date.now() });
    console.log("보정치 저장 성공");
  } catch (error) {
    console.error("보정치 저장 실패:", error);
    throw error;
  }
}

// 보정치(correctionRange) Firestore에서 불러오기
export async function loadCorrectionRange() {
  try {
    console.log("보정치 로딩 시작...");
    const docRef = doc(db, "global", "adjustment");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { updatedAt, ...range } = data;
      console.log("보정치 로딩 성공:", range);
      return range;
    } else {
      console.log("보정치 문서가 존재하지 않습니다.");
      return null;
    }
  } catch (error: any) {
    console.error("보정치 로딩 실패:", error);
    if (error.code === 'permission-denied') {
      console.error("Firebase 권한 오류: Firestore 보안 규칙을 확인해주세요.");
    }
    return null;
  }
}

// 업로드 데이터(팩트 등락률) Firestore에 저장
export async function saveUploadData(uploadData: any) {
  try {
    await setDoc(doc(db, "global", "uploadData"), { ...uploadData, updatedAt: Date.now() });
    console.log("업로드 데이터 저장 성공");
  } catch (error) {
    console.error("업로드 데이터 저장 실패:", error);
    throw error;
  }
}

// 업로드 데이터(팩트 등락률) Firestore에서 불러오기
export async function loadUploadData() {
  try {
    console.log("업로드 데이터 로딩 시작...");
    const docRef = doc(db, "global", "uploadData");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { updatedAt, ...uploadData } = data;
      console.log("업로드 데이터 로딩 성공");
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
    } else {
      console.log("업로드 데이터 문서가 존재하지 않습니다.");
      return null;
    }
  } catch (error: any) {
    console.error("업로드 데이터 로딩 실패:", error);
    if (error.code === 'permission-denied') {
      console.error("Firebase 권한 오류: Firestore 보안 규칙을 확인해주세요.");
    }
    return null;
  }
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
