import React, { useState } from 'react';
import {
  checkFirebaseConnection,
  loadGuestRates,
  loadCorrectionRange,
  loadUploadData,
  loadAdInflowHistory
} from '@/utils/firestoreService';

export default function FirebaseTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // 1. Firebase 연결 테스트
      console.log("=== Firebase 연결 테스트 ===");
      results.connection = await checkFirebaseConnection();

      // 2. guestRates 로딩 테스트
      console.log("=== guestRates 로딩 테스트 ===");
      try {
        const guestRates = await loadGuestRates();
        results.guestRates = { success: true, data: guestRates };
      } catch (error: any) {
        results.guestRates = { success: false, error: error.message };
      }

      // 3. 보정치 로딩 테스트
      console.log("=== 보정치 로딩 테스트 ===");
      try {
        const correctionRange = await loadCorrectionRange();
        results.correctionRange = { success: true, data: correctionRange };
      } catch (error: any) {
        results.correctionRange = { success: false, error: error.message };
      }

      // 4. 업로드 데이터 로딩 테스트
      console.log("=== 업로드 데이터 로딩 테스트 ===");
      try {
        const uploadData = await loadUploadData();
        results.uploadData = { success: true, hasData: !!uploadData };
      } catch (error: any) {
        results.uploadData = { success: false, error: error.message };
      }

      // 5. 광고 유입 이력 로딩 테스트
      console.log("=== 광고 유입 이력 로딩 테스트 ===");
      try {
        const adInflowHistory = await loadAdInflowHistory();
        results.adInflowHistory = { success: true, hasData: !!adInflowHistory };
      } catch (error: any) {
        results.adInflowHistory = { success: false, error: error.message };
      }

    } catch (error: any) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="bg-[#18181b] rounded-2xl p-6 shadow-lg border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">Firebase 연결 테스트</h2>
      
      <button
        onClick={runTests}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg mb-4"
      >
        {isLoading ? "테스트 중..." : "Firebase 테스트 실행"}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">테스트 결과:</h3>
          
          {testResults.connection !== undefined && (
            <div className={`p-3 rounded-lg ${testResults.connection ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="font-semibold text-white">Firebase 연결: {testResults.connection ? '✅ 성공' : '❌ 실패'}</div>
            </div>
          )}

          {testResults.guestRates && (
            <div className={`p-3 rounded-lg ${testResults.guestRates.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="font-semibold text-white">Guest Rates: {testResults.guestRates.success ? '✅ 성공' : '❌ 실패'}</div>
              {!testResults.guestRates.success && (
                <div className="text-red-400 text-sm mt-1">에러: {testResults.guestRates.error}</div>
              )}
            </div>
          )}

          {testResults.correctionRange && (
            <div className={`p-3 rounded-lg ${testResults.correctionRange.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="font-semibold text-white">보정치: {testResults.correctionRange.success ? '✅ 성공' : '❌ 실패'}</div>
              {!testResults.correctionRange.success && (
                <div className="text-red-400 text-sm mt-1">에러: {testResults.correctionRange.error}</div>
              )}
            </div>
          )}

          {testResults.uploadData && (
            <div className={`p-3 rounded-lg ${testResults.uploadData.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="font-semibold text-white">업로드 데이터: {testResults.uploadData.success ? '✅ 성공' : '❌ 실패'}</div>
              {testResults.uploadData.success && (
                <div className="text-green-400 text-sm mt-1">데이터 존재: {testResults.uploadData.hasData ? '예' : '아니오'}</div>
              )}
              {!testResults.uploadData.success && (
                <div className="text-red-400 text-sm mt-1">에러: {testResults.uploadData.error}</div>
              )}
            </div>
          )}

          {testResults.adInflowHistory && (
            <div className={`p-3 rounded-lg ${testResults.adInflowHistory.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="font-semibold text-white">광고 유입 이력: {testResults.adInflowHistory.success ? '✅ 성공' : '❌ 실패'}</div>
              {testResults.adInflowHistory.success && (
                <div className="text-green-400 text-sm mt-1">데이터 존재: {testResults.adInflowHistory.hasData ? '예' : '아니오'}</div>
              )}
              {!testResults.adInflowHistory.success && (
                <div className="text-red-400 text-sm mt-1">에러: {testResults.adInflowHistory.error}</div>
              )}
            </div>
          )}

          {testResults.generalError && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
              <div className="font-semibold text-white">일반 에러:</div>
              <div className="text-red-400 text-sm mt-1">{testResults.generalError}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
