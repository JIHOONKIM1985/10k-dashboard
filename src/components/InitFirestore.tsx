"use client";

import { useEffect } from "react";
import { loadAdjustment, loadUploadData } from "@/utils/firestoreService";

export default function InitFirestore() {
  useEffect(() => {
    // Firestore에서 보정치 불러오기
    loadAdjustment().then((data) => {
      if (data) {
        localStorage.setItem("adjustment", JSON.stringify(data));
      }
    });
    // Firestore에서 업로드 데이터 불러오기
    loadUploadData().then((data) => {
      if (data) {
        localStorage.setItem("uploadData", JSON.stringify(data));
      }
    });
  }, []);

  return null; // UI는 없음(숨김)
}
