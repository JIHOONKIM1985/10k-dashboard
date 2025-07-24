"use client";
import React, { useState, useEffect } from "react";
import ExcelUploader from "@/components/ExcelUploader";
import { makeTempData } from "@/utils/dataProcessor";
import {
  calcShoppingRate,
  calcShoppingSingleRate,
  calcShoppingCompareRate,
  calcPlaceRate,
  calcPlaceTypeRate,
  getShoppingDashboardListV2,
  getPlaceDashboardListV2,
  getCorrectedRates
} from "@/utils/dashboardProcessor";
import {
  saveGuestRates, loadGuestRates,
  saveCorrectionRange, loadCorrectionRange,
  saveUploadData, loadUploadData,
  saveAdInflowHistory, loadAdInflowHistory,
  saveReportInputs, loadReportInputs,
  saveReportDropdownOptions, loadReportDropdownOptions
} from "@/utils/firestoreService";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import DashboardLineChart from "@/components/DashboardLineChart";
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';
import CorrectionSettings from '@/components/CorrectionSettings';
import RateDisplaySection from '@/components/RateDisplaySection';
import ShoppingTable from '@/components/ShoppingTable';
import PlaceTable from '@/components/PlaceTable';
import ReportGenerator from '@/components/ReportGenerator';
// MobileSidebar 컴포넌트 복사 (layout.tsx에서 삭제했으므로)
function MobileSidebar({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  return (
    <div className={`fixed inset-0 z-50 transition ${open ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <aside className="absolute left-2 top-14 h-fit max-h-[calc(100vh-56px)] w-80 overflow-y-auto animate-slideIn">
        {children}
      </aside>
    </div>
  );
}

export default function Home() {
  // 모든 useState, useEffect 등 Hook 선언을 컴포넌트 최상단에 위치
  const [isClient, setIsClient] = useState(false);
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[][]>([]);
  const [tempData, setTempData] = useState<any[][]>([]);
  const [rate, setRate] = useState<any>(null);
  const [singleRate, setSingleRate] = useState<any>(null);
  const [compareRate, setCompareRate] = useState<any>(null);
  const [placeRate, setPlaceRate] = useState<any>(null);
  const [quizRate, setQuizRate] = useState<any>(null);
  const [saveRate, setSaveRate] = useState<any>(null);
  const [save2Rate, setSave2Rate] = useState<any>(null);
  const [keepRate, setKeepRate] = useState<any>(null);
  const [shoppingList, setShoppingList] = useState<any[][]>([]);
  const [placeList, setPlaceList] = useState<any[][]>([]);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'shopping' | 'place' | 'report'>('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCorrectionSetting, setShowCorrectionSetting] = useState(false);
  const [correctionRange, setCorrectionRange] = useState<any>({
    // 쇼핑 전체 등락률
    shoppingRiseMin: 30, shoppingRiseMax: 40,
    shoppingKeepMin: 30, shoppingKeepMax: 40,
    shoppingFallMin: 20, shoppingFallMax: 30,
    // 쇼핑 단일 등락률
    shoppingSingleRiseMin: 30, shoppingSingleRiseMax: 40,
    shoppingSingleKeepMin: 30, shoppingSingleKeepMax: 40,
    shoppingSingleFallMin: 20, shoppingSingleFallMax: 30,
    // 쇼핑 가격비교 등락률
    shoppingCompareRiseMin: 30, shoppingCompareRiseMax: 40,
    shoppingCompareKeepMin: 30, shoppingCompareKeepMax: 40,
    shoppingCompareFallMin: 20, shoppingCompareFallMax: 30,
    // 플레이스 전체 등락률
    placeRiseMin: 30, placeRiseMax: 40,
    placeKeepMin: 30, placeKeepMax: 40,
    placeFallMin: 20, placeFallMax: 30,
    // 플레이스 퀴즈 등락률
    quizRiseMin: 30, quizRiseMax: 40,
    quizKeepMin: 30, quizKeepMax: 40,
    quizFallMin: 20, quizFallMax: 30,
    // 플레이스 저장 등락률
    placeSaveRiseMin: 30, placeSaveRiseMax: 40,
    placeSaveKeepMin: 30, placeSaveKeepMax: 40,
    placeSaveFallMin: 20, placeSaveFallMax: 30,
    // 플레이스 저장x2 등락률
    placeSave2RiseMin: 30, placeSave2RiseMax: 40,
    placeSave2KeepMin: 30, placeSave2KeepMax: 40,
    placeSave2FallMin: 20, placeSave2FallMax: 30,
    // 플레이스 KEEP 등락률
    placeKeepRiseMin: 30, placeKeepRiseMax: 40,
    placeKeepKeepMin: 30, placeKeepKeepMax: 40,
    placeKeepFallMin: 20, placeKeepFallMax: 30,
  });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [guestRates, setGuestRates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 리포트 발행용 관련 state (중복 선언 없이 한 번만)
  const [reportMultiInputs, setReportMultiInputs] = useState<Record<string, { keywordCount: string; channels: string[] }>>({});
  const [showRawPreview, setShowRawPreview] = useState(false);
  const [reportHeader, setReportHeader] = useState<string[]>([]);
  const [showRisePreview, setShowRisePreview] = useState(false);
  const [reportDropdownOptions, setReportDropdownOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [editOptionIdx, setEditOptionIdx] = useState<number|null>(null);
  const [editOptionValue, setEditOptionValue] = useState("");

  // 차트 상태 및 예시 데이터 (쇼핑/플레이스)
  const [periodType, setPeriodType] = useState<'day' | 'week' | 'month'>('day');
  const [shoppingLineOptions, setShoppingLineOptions] = useState([
    { key: '전체', label: '전체', color: '#22c55e', visible: true },
    { key: '단일', label: '단일', color: '#3b82f6', visible: false },
    { key: '가격비교', label: '가격비교', color: '#ef4444', visible: false },
  ]);
  const [placeLineOptions, setPlaceLineOptions] = useState([
    { key: '전체', label: '전체', color: '#22c55e', visible: true },
    { key: '퀴즈', label: '퀴즈', color: '#3b82f6', visible: false },
    { key: '저장', label: '저장', color: '#ef4444', visible: false },
    { key: '저장x2', label: '저장x2', color: '#f59e42', visible: false },
    { key: 'KEEP', label: 'KEEP', color: '#a855f7', visible: false },
  ]);
  const [history, setHistory] = useState<any[]>([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState<any[]>([]);
  const [todayStr, setTodayStr] = React.useState('');
  const [yesterdayStr, setYesterdayStr] = React.useState('');
  const [todayFullStr, setTodayFullStr] = React.useState('');

  // 실제 차트 데이터 상태 추가
  const [realChartData, setRealChartData] = useState<any[]>([]);

  useEffect(() => { setIsClient(true); }, []);

  // 차트 상태 및 예시 데이터 (쇼핑/플레이스)
  const lineOptions = activeMenu === 'shopping' ? shoppingLineOptions : placeLineOptions;
  const handleToggleLine = (key: string) => {
    if (activeMenu === 'shopping') setShoppingLineOptions(lines => lines.map(l => l.key === key ? { ...l, visible: !l.visible } : l));
    else setPlaceLineOptions(lines => lines.map(l => l.key === key ? { ...l, visible: !l.visible } : l));
  };
  const handleChangePeriod = (type: 'day' | 'week' | 'month') => {
    setPeriodType(type);
    // 실제 데이터 가공 로직은 추후 추가
  };

  // Firestore에서 실제 광고 물량 데이터 불러오기
  useEffect(() => {
    const loadRealChartData = async () => {
      try {
        const inflowHistory = await loadAdInflowHistory();
        if (inflowHistory && Object.keys(inflowHistory).length > 0) {
          // 어제부터 6일 전까지 7일을 오름차순으로 생성
          const end = new Date();
          end.setDate(end.getDate() - 1); // 어제
          const start = new Date();
          start.setDate(end.getDate() - 6); // 7일 전(포함)
          const prev7Dates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d.toISOString().slice(0, 10);
          });

          // 각 날짜별 데이터 매핑
          const chartDataWithDates = prev7Dates.map(date => {
            const dateData = inflowHistory[date] || {};
            const pad = (n: number) => n.toString().padStart(2, '0');
            // MM.DD 형식으로 변환
            const [year, month, day] = date.split('-').map(Number);
            const dateStr = `${pad(month)}.${pad(day)}`;
            return {
              date: dateStr,
              '쇼핑(가격비교)': dateData['쇼핑(가격비교)'] || 0,
              '쇼핑(단일)': dateData['쇼핑(단일)'] || 0,
              '플레이스퀴즈': dateData['플레이스퀴즈'] || 0,
              '저장하기': dateData['저장하기'] || 0,
              '저장x2': dateData['저장x2'] || 0,
              'KEEP': dateData['KEEP'] || 0,
              '쿠팡': dateData['쿠팡'] || 0,
            };
          });

          setRealChartData(chartDataWithDates);
        }
      } catch (error) {
        console.error('실제 차트 데이터 로드 실패:', error);
      }
    };

    loadRealChartData();
  }, []);

  // 보정치 적용 함수
  function getCorrectedRates(fact: any, correction: any, typeKey: any) {
    const keyMap: Record<string, string> = {
      'shopping': 'shopping',
      'shoppingSingle': 'shoppingSingle',
      'shoppingCompare': 'shoppingCompare',
      'place': 'place',
      'quiz': 'quiz',
      'placeSave': 'placeSave',
      'placeSave2': 'placeSave2',
      'placeKeep': 'placeKeep',
    };
    const baseKey = keyMap[typeKey] || typeKey;
    const riseMin = correction?.[`${baseKey}RiseMin`] ?? 0;
    const riseMax = correction?.[`${baseKey}RiseMax`] ?? 100;
    const fallMin = correction?.[`${baseKey}FallMin`] ?? 0;
    const fallMax = correction?.[`${baseKey}FallMax`] ?? 100;

    // 팩트 데이터가 없으면 구간 내 랜덤값
    if (!fact || typeof fact.상승 !== 'number' || typeof fact.하락 !== 'number') {
      let 상승 = Math.random() * (riseMax - riseMin) + riseMin;
      let 하락 = Math.random() * (fallMax - fallMin) + fallMin;
      let 유지 = 100 - 상승 - 하락;
      if (유지 < 0) {
        유지 = 0;
        const total = 상승 + 하락;
        if (total > 0) {
          상승 = (상승 / total) * 100;
          하락 = (하락 / total) * 100;
        }
      }
      상승 = Math.round(상승 * 10) / 10;
      유지 = Math.round(유지 * 10) / 10;
      하락 = Math.round(하락 * 10) / 10;
      return { 상승, 유지, 하락, 상승_개수: 0, 유지_개수: 0, 하락_개수: 0 };
    }

    // 팩트 데이터가 있으면 구간 보정
    function correct(val: number, min: number, max: number) {
      if (val >= min && val <= max) return val;
      return Math.random() * (max - min) + min;
    }
    let 상승 = correct(fact.상승, riseMin, riseMax);
    let 하락 = correct(fact.하락, fallMin, fallMax);
    let 유지 = 100 - 상승 - 하락;
    if (유지 < 0) {
      유지 = 0;
      const total = 상승 + 하락;
      if (total > 0) {
        상승 = (상승 / total) * 100;
        하락 = (하락 / total) * 100;
      }
    }
    상승 = Math.round(상승 * 10) / 10;
    유지 = Math.round(유지 * 10) / 10;
    하락 = Math.round(하락 * 10) / 10;
    return {
      상승,
      유지,
      하락,
      상승_개수: fact.상승_개수 ?? 0,
      유지_개수: fact.유지_개수 ?? 0,
      하락_개수: fact.하락_개수 ?? 0,
    };
  }

  // 보정치 캐시 저장/불러오기 함수
  function getCachedCorrectedRates(key: string, fact: any, correction: any, typeKey: any) {
    if (typeof window === 'undefined') return null;
    const cacheStr = localStorage.getItem('correctedRatesCache');
    let cache: any = {};
    if (cacheStr) {
      try { cache = JSON.parse(cacheStr); } catch {}
    }
    if (cache[key]) return cache[key];
    const corrected = getCorrectedRates(fact, correction, typeKey);
    cache[key] = corrected;
    localStorage.setItem('correctedRatesCache', JSON.stringify(cache));
    return corrected;
  }

  function clearCorrectedRatesCache() {
    if (typeof window !== 'undefined') localStorage.removeItem('correctedRatesCache');
  }

  // 날짜별로 해당 시점의 보정치 찾기
  function findAdjustmentForDate(dateStr: string) {
    if (!adjustmentHistory.length) return null;
    const date = new Date(dateStr + 'T23:59:59');
    // savedAt이 date 이하인 것 중 가장 최근
    const found = [...adjustmentHistory]
      .filter(adj => adj.savedAt <= date.getTime())
      .sort((a, b) => b.savedAt - a.savedAt)[0];
    return found || adjustmentHistory[0]; // 없으면 첫 보정치라도 반환
  }

  // chartData: 최근 7일치 Firestore 이력 기반으로 생성 (비로그인 시 보정치 적용)
  const chartData = React.useMemo(() => {
    if (!history || history.length === 0) return [];
    // 최신순 정렬 후 최근 7개만
    const sorted = [...history].sort((a, b) => (a.date > b.date ? 1 : -1));
    const recent = sorted.slice(-7);
    if (activeMenu === 'shopping') {
      return recent.map(item => ({
        date: item.date ? item.date.replace(/\d{4}-/, '').replace('-', '월 ') + '일' : '',
        전체: isLoggedIn ? item.shopping?.전체 ?? null : (typeof window !== 'undefined' ? getCachedCorrectedRates('shopping', { 상승: item.shopping?.전체 ?? null, 유지: item.shopping?.유지 ?? null, 하락: item.shopping?.하락 ?? null }, correctionRange, 'shopping') : null),
        단일: isLoggedIn ? item.shopping?.단일 ?? null : (typeof window !== 'undefined' ? getCachedCorrectedRates('shoppingSingle', { 상승: item.shopping?.단일 ?? null, 유지: item.shopping?.유지 ?? null, 하락: item.shopping?.하락 ?? null }, correctionRange, 'shoppingSingle') : null),
        가격비교: isLoggedIn ? item.shopping?.가격비교 ?? null : (typeof window !== 'undefined' ? getCachedCorrectedRates('shoppingCompare', { 상승: item.shopping?.가격비교 ?? null, 유지: item.shopping?.유지 ?? null, 하락: item.shopping?.하락 ?? null }, correctionRange, 'shoppingCompare') : null),
      }));
    } else {
      return recent.map(item => {
        let 전체 = isLoggedIn
          ? item.place?.전체 ?? { 상승: 0, 유지: 0, 하락: 0 }
          : getCachedCorrectedRates(
              'place',
              {
                상승: item.place?.전체?.상승 ?? 0,
                유지: item.place?.전체?.유지 ?? 0,
                하락: item.place?.전체?.하락 ?? 0,
              },
              correctionRange,
              'place'
            );
        // 보정치 반환값이 number가 아닐 경우 0으로 보정
        전체 = {
          상승: typeof 전체.상승 === 'number' && !isNaN(전체.상승) ? 전체.상승 : 0,
          유지: typeof 전체.유지 === 'number' && !isNaN(전체.유지) ? 전체.유지 : 0,
          하락: typeof 전체.하락 === 'number' && !isNaN(전체.하락) ? 전체.하락 : 0,
        };
        const 저장 = isLoggedIn
          ? item.place?.저장 ?? null
          : getCachedCorrectedRates('placeSave', { 상승: item.place?.저장?.상승 ?? null, 유지: item.place?.저장?.유지 ?? null, 하락: item.place?.저장?.하락 ?? null }, correctionRange, 'placeSave');
        const 저장x2 = isLoggedIn
          ? item.place?.저장x2 ?? null
          : getCachedCorrectedRates('placeSave2', { 상승: item.place?.저장x2?.상승 ?? null, 유지: item.place?.저장x2?.유지 ?? null, 하락: item.place?.저장x2?.하락 ?? null }, correctionRange, 'placeSave2');
        const KEEP = isLoggedIn
          ? item.place?.KEEP ?? null
          : getCachedCorrectedRates('placeKeep', { 상승: item.place?.KEEP?.상승 ?? null, 유지: item.place?.KEEP?.유지 ?? null, 하락: item.place?.KEEP?.하락 ?? null }, correctionRange, 'placeKeep');
        const 퀴즈 = isLoggedIn
          ? item.place?.퀴즈 ?? null
          : getCachedCorrectedRates('quiz', { 상승: item.place?.퀴즈?.상승 ?? null, 유지: item.place?.퀴즈?.유지 ?? null, 하락: item.place?.퀴즈?.하락 ?? null }, correctionRange, 'quiz');
        return {
          date: item.date ? item.date.replace(/\d{4}-/, '').replace('-', '월 ') + '일' : '',
          전체,
          전체_유지: 전체.유지,
          전체_하락: 전체.하락,
          퀴즈: 퀴즈?.상승 ?? null,
          퀴즈_유지: 퀴즈?.유지 ?? null,
          퀴즈_하락: 퀴즈?.하락 ?? null,
          저장: 저장?.상승 ?? null,
          저장_유지: 저장?.유지 ?? null,
          저장_하락: 저장?.하락 ?? null,
          저장x2: 저장x2?.상승 ?? null,
          저장x2_유지: 저장x2?.유지 ?? null,
          저장x2_하락: 저장x2?.하락 ?? null,
          KEEP: KEEP?.상승 ?? null,
          KEEP_유지: KEEP?.유지 ?? null,
          KEEP_하락: KEEP?.하락 ?? null,
        };
      });
    }
  }, [history, activeMenu, isLoggedIn, correctionRange]);

  // 1. 등락률 박스와 차트 동기화용: chartData 최신값 추출
  const latestChart = chartData && chartData.length > 0 ? chartData[chartData.length - 1] : null;

  useEffect(() => {
    // Firestore에서 이력 데이터 로드 등 불필요한 useEffect, 함수 호출부 삭제
    // FirestoreService에서 제공하지 않는 함수 관련 코드 전체 삭제
    // guestRates Firestore 연동만 남기고 나머지 Firestore 관련 데이터 로드는 제거
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogin = localStorage.getItem('isLoggedIn');
      if (savedLogin === 'true') {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Firestore에서 보정치(correctionRange) 항상 불러오기
  useEffect(() => {
    async function fetchCorrectionRange() {
      const range = await loadCorrectionRange();
      if (range) setCorrectionRange(range);
    }
    fetchCorrectionRange();
  }, [isLoggedIn, showCorrectionSetting]);

  // 비로그인 시 guestRates는 Firestore에서만 불러오고, correctionRange와 무관하게 항상 고정
  useEffect(() => {
    if (!isLoggedIn) {
      loadGuestRates().then(rates => {
        setGuestRates(rates);
      });
    }
  }, [isLoggedIn]);

  // 로그인 후 Firestore에서 데이터를 불러와서 state에 세팅하는 useEffect 추가
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      loadUploadData().then(data => {
        console.log("Firestore에서 불러온 데이터:", data);
        if (data) {
          setRawData(data.rawData || []);
          setTempData(data.tempData || []);
          setShoppingList(data.shoppingList || []);
          setPlaceList(data.placeList || []);
          setRate(data.rate || null);
          setSingleRate(data.singleRate || null);
          setCompareRate(data.compareRate || null);
          setPlaceRate(data.placeRate || null);
          setQuizRate(data.quizRate || null);
          setSaveRate(data.saveRate || null);
          setSave2Rate(data.save2Rate || null);
          setKeepRate(data.keepRate || null);
          // setReportRows(data.reportRows ? JSON.parse(data.reportRows) : []); // Firestore에서 reportRows 불러오기 제거
        } else {
          // 데이터가 없을 때도 명확히 로그
          console.log("Firestore에서 uploadData를 찾을 수 없습니다.");
        }
        setIsLoading(false);
      }).catch(err => {
        console.error("loadUploadData 에러:", err);
        setIsLoading(false);
      });
    }
  }, [isLoggedIn]);

  // 리포트 데이터 localStorage에서 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 리포트 입력 데이터 불러오기
      const savedInputs = localStorage.getItem('reportMultiInputs');
      if (savedInputs) {
        try {
          setReportMultiInputs(JSON.parse(savedInputs));
        } catch {
          setReportMultiInputs({});
        }
      }
      
      // 유입경로 옵션 불러오기
      const savedOptions = localStorage.getItem('reportDropdownOptions');
      if (savedOptions) {
        try {
          setReportDropdownOptions(JSON.parse(savedOptions));
        } catch {
          setReportDropdownOptions(["가격비교검색", "통합검색"]);
        }
      } else {
        setReportDropdownOptions(["가격비교검색", "통합검색"]);
      }
    }
  }, []);

  // 리포트 입력 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('reportMultiInputs', JSON.stringify(reportMultiInputs));
    }
  }, [reportMultiInputs]);

  // 옵션 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('reportDropdownOptions', JSON.stringify(reportDropdownOptions));
    }
  }, [reportDropdownOptions]);

  // 페이지 로드 시 realChartData 초기화
  useEffect(() => {
    const loadInitialRealChartData = async () => {
      try {
        const inflowHistory = await loadAdInflowHistory();
        if (inflowHistory && Object.keys(inflowHistory).length > 0) {
          // 어제부터 6일 전까지 7일을 오름차순으로 생성
          const end = new Date();
          end.setDate(end.getDate() - 1); // 어제
          const start = new Date();
          start.setDate(end.getDate() - 6); // 7일 전(포함)
          const prev7Dates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d.toISOString().slice(0, 10);
          });

          // 각 날짜별 데이터 매핑
          const chartDataWithDates = prev7Dates.map(date => {
            const dateData = inflowHistory[date] || {};
            const pad = (n: number) => n.toString().padStart(2, '0');
            // MM.DD 형식으로 변환
            const [year, month, day] = date.split('-').map(Number);
            const dateStr = `${pad(month)}.${pad(day)}`;
            return {
              date: dateStr,
              '쇼핑(가격비교)': dateData['쇼핑(가격비교)'] || 0,
              '쇼핑(단일)': dateData['쇼핑(단일)'] || 0,
              '플레이스퀴즈': dateData['플레이스퀴즈'] || 0,
              '저장하기': dateData['저장하기'] || 0,
              '저장x2': dateData['저장x2'] || 0,
              'KEEP': dateData['KEEP'] || 0,
              '쿠팡': dateData['쿠팡'] || 0,
            };
          });

          setRealChartData(chartDataWithDates);
        }
      } catch (error) {
        console.error('페이지 로드 시 realChartData 초기화 실패:', error);
      }
    };
    loadInitialRealChartData();
  }, []);

  // 기존 reportInputs → reportMultiInputs로 대체
  useEffect(() => {
    const newInputs: Record<string, { keywordCount: string; channels: string[] }> = {};
    reportRows.forEach(({ 광고ID, 슬롯ID }) => {
      const key = `${광고ID}-${슬롯ID}`;
      newInputs[key] = reportMultiInputs[key] || { keywordCount: "", channels: [] };
    });
    setReportMultiInputs(newInputs);
    // eslint-disable-next-line
  }, [reportRows]);

  // 리포트 발행용 데이터 추출 (쇼핑[가격비교] TOP5) - Raw 데이터 기반으로 변경
  useEffect(() => {
    if (isLoading) return; // 로딩 중에는 계산하지 않음
    if (!rawData || rawData.length < 2) return; // 헤더+최소 1행일 때만 계산
    if (activeMenu !== 'report') return; // 리포트 발행용 메뉴일 때만 계산
    const header = rawData[0];
    setReportHeader(header);
    const rows = rawData.slice(1);
    const idx = (name: string) => findColumnIndex(header, name);
    // 쇼핑(가격비교) 필터 + 숫자 유효성 검사 (상승 데이터 추적과 동일한 조건)
    const filtered = rows.filter(row => 
      row[idx("광고유형")] === "쇼핑(가격비교)" && 
      !isNaN(Number(row[idx("D-Day")])) && 
      !isNaN(Number(row[idx("최초순위")]))
    );
    
    // 최초순위 - D-Day = 상승폭 (상승폭이 클수록 좋음)
    const topRows = filtered
      .map(row => {
        const 최초순위 = Number(row[idx("최초순위")]) || 0;
        const dday = Number(row[idx("D-Day")]) || 0;
        const diff = 최초순위 - dday;
        return {
          row,
          diff,
          광고ID: row[idx("광고ID")] || '',
          슬롯ID: row[idx("슬롯ID")] || '',
          순위키워드: row[idx("순위키워드")] || '',
        };
      })
      .filter(item => !isNaN(item.diff) && item.diff > 0) // 양수 상승폭만 필터
      .sort((a, b) => b.diff - a.diff)
      // 순위키워드 중복 제거 (첫 번째만 유지)
      .reduce((acc: any[], item: any) => {
        const existing = acc.find((existing: any) => existing.순위키워드 === item.순위키워드);
        if (!existing) {
          acc.push(item);
        }
        return acc;
      }, [] as any[])
      .slice(0, 5);
    setReportRows(topRows);
  }, [rawData, isLoading, activeMenu]);



  // 2. 업로드 시 단일 날짜 기준으로 Firestore에 집계 저장
  const handleUpload = async (data: any[][], date?: string) => {
    clearCorrectedRatesCache();
    setRawData(data);
    const temp = makeTempData(data);
    setTempData(temp);
    const newRate = temp.length > 0 ? calcShoppingRate(temp) : null;
    const newSingleRate = temp.length > 0 ? calcShoppingSingleRate(temp) : null;
    const newCompareRate = temp.length > 0 ? calcShoppingCompareRate(temp) : null;
    const newPlaceRate = temp.length > 0 ? calcPlaceRate(temp) : null;
    const newQuizRate = temp.length > 0 ? calcPlaceTypeRate(temp, "플레이스퀴즈") : null;
    const newSaveRate = temp.length > 0 ? calcPlaceTypeRate(temp, "저장하기") : null;
    const newSave2Rate = temp.length > 0 ? calcPlaceTypeRate(temp, "저장x2") : null;
    const newKeepRate = temp.length > 0 ? calcPlaceTypeRate(temp, "KEEP") : null;
    const newShoppingList = temp.length > 0 ? getShoppingDashboardListV2(temp) : [];
    const newPlaceList = temp.length > 0 ? getPlaceDashboardListV2(temp) : [];
    setRate(newRate);
    setSingleRate(newSingleRate);
    setCompareRate(newCompareRate);
    setPlaceRate(newPlaceRate);
    setQuizRate(newQuizRate);
    setSaveRate(newSaveRate);
    setSave2Rate(newSave2Rate);
    setKeepRate(newKeepRate);
    setShoppingList(newShoppingList);
    setPlaceList(newPlaceList);

    // 리포트 데이터는 유지 (localStorage에 저장된 데이터 사용)
    // reportMultiInputs와 reportDropdownOptions는 그대로 유지

    // Top5 reportRows 계산 및 저장
    const header = data[0];
    const rows = data.slice(1);
    const idx = (name: string) => findColumnIndex(header, name);
    const filtered = rows.filter(row => 
      row[idx("광고유형")] === "쇼핑(가격비교)" && 
      !isNaN(Number(row[idx("D-Day")])) && 
      !isNaN(Number(row[idx("최초순위")]))
    );
    const topRows = filtered
      .map(row => {
        const 최초순위 = Number(row[idx("최초순위")]) || 0;
        const dday = Number(row[idx("D-Day")]) || 0;
        const diff = 최초순위 - dday;
        return {
          row,
          diff,
          광고ID: row[idx("광고ID")] || '',
          슬롯ID: row[idx("슬롯ID")] || '',
          순위키워드: row[idx("순위키워드")] || '',
        };
      })
      .filter(item => !isNaN(item.diff) && item.diff > 0)
      .sort((a, b) => b.diff - a.diff)
      .reduce((acc, item) => {
        const existing = acc.find(existing => existing.순위키워드 === item.순위키워드);
        if (!existing) acc.push(item);
        return acc;
      }, [] as any[])
      .slice(0, 5);
    setReportRows(topRows);

    // localStorage에 저장
    localStorage.setItem('dashboardData', JSON.stringify({
      rawData: data,
      tempData: temp,
      rate: newRate,
      singleRate: newSingleRate,
      compareRate: newCompareRate,
      placeRate: newPlaceRate,
      quizRate: newQuizRate,
      saveRate: newSaveRate,
      save2Rate: newSave2Rate,
      keepRate: newKeepRate,
      shoppingList: newShoppingList,
      placeList: newPlaceList,
      reportRows: JSON.stringify(topRows),
    }));

    // Firestore에 업로드 데이터 저장 (2차원 배열은 JSON 문자열로 저장)
    await saveUploadData({
      rawData: JSON.stringify(data),
      tempData: JSON.stringify(temp),
      rate: newRate,
      singleRate: newSingleRate,
      compareRate: newCompareRate,
      placeRate: newPlaceRate,
      quizRate: newQuizRate,
      saveRate: newSaveRate,
      save2Rate: newSave2Rate,
      keepRate: newKeepRate,
      shoppingList: JSON.stringify(newShoppingList),
      placeList: JSON.stringify(newPlaceList),
      // reportRows 저장 제거
      // reportRows: JSON.stringify(topRows),
      updatedAt: Date.now(), // 저장 시각 등 추가 가능
    });

    // 날짜별 광고유형별 유입수 집계 Firestore에 누적 저장
    if (date) {
      const adTypes = ['쇼핑(가격비교)', '쇼핑(단일)', '플레이스퀴즈', '저장하기', '저장x2', 'KEEP', '쿠팡'];
      let adTypeIdx = data[0].findIndex((h: string) => h.replace(/\s/g, '').includes('광고유형'));
      let inflowIdx = data[0].findIndex((h: string) => h.replace(/\s/g, '').includes('유입수'));
      if (adTypeIdx !== -1 && inflowIdx !== -1) {
        // 날짜별로 동일 데이터 집계(담당자가 날짜별로 분할 업로드하지 않는 한, 전체 데이터가 각 날짜에 동일하게 들어감)
        const inflowSummary: Record<string, number> = {};
        for (let i = 1; i < data.length; i++) {
          const type = data[i][adTypeIdx];
          const inflow = Number(data[i][inflowIdx]) || 0;
          if (adTypes.includes(type)) {
            inflowSummary[type] = (inflowSummary[type] || 0) + inflow;
          }
        }
        console.log('=== 업로드 시 adInflowHistory 저장 ===');
        console.log('선택된 날짜:', date);
        console.log('선택된 날짜 타입:', typeof date);
        console.log('선택된 날짜 길이:', date.length);
        console.log('계산된 inflowSummary:', inflowSummary);
        console.log('saveAdInflowHistory 호출 전 - 전달할 날짜:', date);
        await saveAdInflowHistory(date, inflowSummary);
        console.log('saveAdInflowHistory 완료');
        
        // 저장 후 확인
        const savedData = await loadAdInflowHistory();
        console.log('저장 후 전체 adInflowHistory:', savedData);
        console.log('저장 후 해당 날짜 데이터:', savedData[date]);
        
        // 차트 데이터 즉시 업데이트
        const loadRealChartData = async () => {
          try {
            const inflowHistory = await loadAdInflowHistory();
            if (inflowHistory && Object.keys(inflowHistory).length > 0) {
              // 어제부터 6일 전까지 7일을 오름차순으로 생성
              const end = new Date();
              end.setDate(end.getDate() - 1); // 어제
              const start = new Date();
              start.setDate(end.getDate() - 6); // 7일 전(포함)
              const prev7Dates = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                return d.toISOString().slice(0, 10);
              });

              // 각 날짜별 데이터 매핑
              const chartDataWithDates = prev7Dates.map(date => {
                const dateData = inflowHistory[date] || {};
                const pad = (n: number) => n.toString().padStart(2, '0');
                // MM.DD 형식으로 변환
                const [year, month, day] = date.split('-').map(Number);
                const dateStr = `${pad(month)}.${pad(day)}`;
                return {
                  date: dateStr,
                  '쇼핑(가격비교)': dateData['쇼핑(가격비교)'] || 0,
                  '쇼핑(단일)': dateData['쇼핑(단일)'] || 0,
                  '플레이스퀴즈': dateData['플레이스퀴즈'] || 0,
                  '저장하기': dateData['저장하기'] || 0,
                  '저장x2': dateData['저장x2'] || 0,
                  'KEEP': dateData['KEEP'] || 0,
                  '쿠팡': dateData['쿠팡'] || 0,
                };
              });

              setRealChartData(chartDataWithDates);
            }
          } catch (error) {
            console.error('실제 차트 데이터 로드 실패:', error);
          }
        };

        loadRealChartData();
      }
    }

    // guestRates 생성 및 저장 (비로그인용)
    const guestRates = {
      shopping: getCorrectedRatesStrict(safeFact(newRate), correctionRange, 'shopping'),
      shoppingSingle: getCorrectedRatesStrict(safeFact(newSingleRate), correctionRange, 'shoppingSingle'),
      shoppingCompare: getCorrectedRatesStrict(safeFact(newCompareRate), correctionRange, 'shoppingCompare'),
      place: getCorrectedRatesStrict(safeFact(newPlaceRate), correctionRange, 'place'),
      quiz: getCorrectedRatesStrict(safeFact(newQuizRate), correctionRange, 'quiz'),
      placeSave: getCorrectedRatesStrict(safeFact(newSaveRate), correctionRange, 'placeSave'),
      placeSave2: getCorrectedRatesStrict(safeFact(newSave2Rate), correctionRange, 'placeSave2'),
      placeKeep: getCorrectedRatesStrict(safeFact(newKeepRate), correctionRange, 'placeKeep'),
    };
    updateGuestRates(guestRates);

    // 관리자(로그인) 업로드 시 Firestore에 guestRates 저장
    if (isLoggedIn) {
      const keys = [
        'shopping', 'shoppingSingle', 'shoppingCompare',
        'place', 'quiz', 'placeSave', 'placeSave2', 'placeKeep'
      ];
      const newGuestRates: any = {};
      keys.forEach(key => {
        let fact = null;
        switch (key) {
          case 'shopping': fact = newRate; break;
          case 'shoppingSingle': fact = newSingleRate; break;
          case 'shoppingCompare': fact = newCompareRate; break;
          case 'place': fact = newPlaceRate; break;
          case 'quiz': fact = newQuizRate; break;
          case 'placeSave': fact = newSaveRate; break;
          case 'placeSave2': fact = newSave2Rate; break;
          case 'placeKeep': fact = newKeepRate; break;
        }
        newGuestRates[key] = getCorrectedRatesStrict(fact, correctionRange, key);
      });
      await saveGuestRates(newGuestRates); // Firestore에 저장
    }
  };

  // 업로드/로그인/로그아웃 시 guestRates 갱신
  const updateGuestRates = (newRates: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestRates', JSON.stringify(newRates as Record<string, any>));
    }
  };

  // 안전한 fact 생성 함수
  const safeFact = (fact: any) => fact && typeof fact.상승 === 'number' && typeof fact.유지 === 'number' && typeof fact.하락 === 'number'
    ? fact
    : { 상승: 0, 유지: 0, 하락: 0 };

  // 보정치 규칙을 엄격히 적용하는 함수
  function getCorrectedRatesStrict(fact: any, correction: any, typeKey: any) {
    const keyMap: Record<string, string> = {
      'shopping': 'shopping',
      'shoppingSingle': 'shoppingSingle',
      'shoppingCompare': 'shoppingCompare',
      'place': 'place',
      'quiz': 'quiz',
      'placeSave': 'placeSave',
      'placeSave2': 'placeSave2',
      'placeKeep': 'placeKeep',
    };
    const baseKey = keyMap[typeKey] || typeKey;
    const riseMin = correction?.[`${baseKey}RiseMin`] ?? 0;
    const riseMax = correction?.[`${baseKey}RiseMax`] ?? 100;
    const fallMin = correction?.[`${baseKey}FallMin`] ?? 0;
    const fallMax = correction?.[`${baseKey}FallMax`] ?? 100;

    let 상승 = fact && typeof fact.상승 === 'number' ? fact.상승 : undefined;
    let 하락 = fact && typeof fact.하락 === 'number' ? fact.하락 : undefined;

    // 구간 내면 그대로, 구간 밖이면 랜덤 보정
    if (typeof 상승 !== 'number' || 상승 < riseMin || 상승 > riseMax) {
      상승 = Math.random() * (riseMax - riseMin) + riseMin;
    }
    if (typeof 하락 !== 'number' || 하락 < fallMin || 하락 > fallMax) {
      하락 = Math.random() * (fallMax - fallMin) + fallMin;
    }
    let 유지 = 100 - 상승 - 하락;
    if (유지 < 0) 유지 = 0;
    상승 = Math.round(상승 * 10) / 10;
    유지 = Math.round(유지 * 10) / 10;
    하락 = Math.round(하락 * 10) / 10;
    return { 상승, 유지, 하락 };
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === "10k" && loginPw === "wade1234") {
      alert("로그인 성공");
      setShowLogin(false);
      setLoginId("");
      setLoginPw("");
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      updateGuestRates({}); // 로그인 시 guestRates 초기화
    } else {
      alert("로그인 실패");
    }
  };

  // 로그아웃 버튼에서 setIsLoggedIn(false) 호출 시에도 guestRates 초기화 필요
  // Sidebar 컴포넌트에 setIsLoggedIn, setLoginId, setLoginPw 넘길 때 아래처럼 래핑해서 전달
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginId("");
    setLoginPw("");
    localStorage.removeItem('isLoggedIn');
    updateGuestRates({}); // 로그아웃 시 guestRates 초기화
  };

  // 컬럼명 찾기 함수 (대소문자 무시, 부분 일치)
  function findColumnIndex(header: string[], columnName: string): number {
    // null 체크 추가
    if (!header || !Array.isArray(header) || !columnName) {
      return -1;
    }
    
    const lowerColumnName = columnName.toLowerCase();
    const exactMatch = header.findIndex(col => col && col.toLowerCase() === lowerColumnName);
    if (exactMatch !== -1) return exactMatch;
    
    // 부분 일치 검색
    const partialMatch = header.findIndex(col => col && (col.toLowerCase().includes(lowerColumnName) || lowerColumnName.includes(col.toLowerCase())));
    if (partialMatch !== -1) return partialMatch;
    
    return -1; // 찾지 못함
  }

  // 쇼핑 대시보드 헤더
  const shoppingDashboardHeader = [
    "광고유형", "검색량", "최초대비", "어제대비",
    todayStr || '', yesterdayStr || '', "D-2", "D-3", "D-4", "D-5", "D-6", "D-7",
    "최초순위", "어제순위대비", "최초순위대비", "신규진입", "RowID"
  ];
  // 플레이스 대시보드 헤더
  const placeDashboardHeader = [
    "광고유형", "검색량", "최초대비", "어제대비",
    todayStr || '', yesterdayStr || '', "D-2", "D-3", "D-4", "D-5", "D-6", "D-7",
    "최초순위", "어제순위대비", "최초순위대비", "신규진입", "RowID"
  ];

  const correctionItems = [
    { key: 'shopping', label: '쇼핑 전체 등락률' },
    { key: 'shoppingSingle', label: '쇼핑[단일] 등락률' },
    { key: 'shoppingCompare', label: '쇼핑[가격비교] 등락률' },
    { key: 'place', label: '플레이스 전체 등락률' },
    { key: 'quiz', label: '플레이스퀴즈 등락률' },
    { key: 'placeSave', label: '플레이스 저장 등락률' },
    { key: 'placeSave2', label: '플레이스 저장x2 등락률' },
    { key: 'placeKeep', label: '플레이스 KEEP 등락률' },
  ];
  const types = [
    { key: 'Rise', label: '상승', color: 'green' },
    { key: 'Keep', label: '유지', color: 'blue' },
    { key: 'Fall', label: '하락', color: 'red' },
  ];

  // 기존 reportInputs → reportMultiInputs로 대체
  useEffect(() => {
    const newInputs: Record<string, { keywordCount: string; channels: string[] }> = {};
    reportRows.forEach(({ 광고ID, 슬롯ID }) => {
      const key = `${광고ID}-${슬롯ID}`;
      newInputs[key] = reportMultiInputs[key] || { keywordCount: "", channels: [] };
    });
    setReportMultiInputs(newInputs);
    // eslint-disable-next-line
  }, [reportRows]);

  // 리포트 발행용 데이터 추출 (쇼핑[가격비교] TOP5) - Raw 데이터 기반으로 변경
  useEffect(() => {
    if (!rawData || rawData.length === 0) return;
    const header = rawData[0];
    setReportHeader(header);
    const rows = rawData.slice(1);
    const idx = (name: string) => findColumnIndex(header, name);
    // '쇼핑(가격비교)'만 필터
    const filtered = rows.filter(row => row[idx("광고유형")] === "쇼핑(가격비교)");
    // D-Day - 최초순위 = 상승폭
    const topRows = filtered
      .map(row => ({
        row,
        diff: Number(row[idx("D-Day")]) - Number(row[idx("최초순위")]),
        광고ID: row[idx("광고ID")],
        슬롯ID: row[idx("슬롯ID")],
      }))
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 5);
    setReportRows(topRows);
  }, [rawData]);

  // 리포트 자동 생성 함수(임시)
  function makeReport(row: any, input: { keywordCount: string; channel: string }) {
    if (!input.keywordCount || !input.channel) return "";
    // 실제 GPT 프롬프트 대신 임시 텍스트
    return `최초대비 오늘 상승폭이 큰 쇼핑(가격비교)상품 중 ${row[5]} 시작상품, ${row[9]}건의 검색량 상품이고, 최초대비 ${row[10]}의 변화를 보였습니다. ${input.keywordCount}개의 유입 키워드를 보유하고 있으며, 활용 유입 경로는 ${input.channel}이니 참고하세요.`;
  }

  // 상승 데이터 추적 박스: 10개 행
  const riseRows = (() => {
    if (!rawData || rawData.length === 0) return [];
    const header = rawData[0];
    const rows = rawData.slice(1);
    const idx = (name: string) => header.indexOf(name);
    return rows.filter(row => row[idx("광고유형")] === "쇼핑(가격비교)" && !isNaN(Number(row[idx("D-Day")])) && !isNaN(Number(row[idx("최초순위")])))
      .map(row => ({
        row,
        상승폭: Number(row[idx("최초순위")]) - Number(row[idx("D-Day")]),
        광고ID: row[idx("광고ID")],
        슬롯ID: row[idx("슬롯ID")],
      }))
      .sort((a, b) => b.상승폭 - a.상승폭)
      .slice(0, 10);
  })();

  // 리포트 발행용 테이블: riseRows 상위 5개만 (순위키워드 중복 제거)
  useEffect(() => {
    // 순위키워드 중복 없이 5개 행 추출
    const seen = new Set();
    const uniqueRows = [];
    for (const rowObj of riseRows) {
      const keyword = rowObj.row[reportHeader.indexOf("순위키워드")];
      if (!seen.has(keyword)) {
        seen.add(keyword);
        uniqueRows.push(rowObj);
      }
      if (uniqueRows.length === 5) break;
    }
    setReportRows(uniqueRows);
  }, [rawData]);

  // 유입경로 옵션 localStorage에서 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reportDropdownOptions');
      if (saved) {
        try {
          setReportDropdownOptions(JSON.parse(saved));
        } catch {
          setReportDropdownOptions(["가격비교검색", "통합검색"]);
        }
      } else {
        setReportDropdownOptions(["가격비교검색", "통합검색"]);
      }
    }
  }, []);

  // 옵션 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reportDropdownOptions', JSON.stringify(reportDropdownOptions));
    }
  }, [reportDropdownOptions]);

  // CorrectionSettings(보정치 저장)에도 guestRates 갱신 추가
  const handleSaveCorrection = async (range: any) => {
    setCorrectionRange(range);
    setShowCorrectionSetting(false);
    await saveCorrectionRange(range); // Firestore에 보정치 저장
    // 보정치 저장 시 guestRates 재생성
    const guestRates = {
      shopping: getCorrectedRatesStrict(safeFact(rate), range, 'shopping'),
      shoppingSingle: getCorrectedRatesStrict(safeFact(singleRate), range, 'shoppingSingle'),
      shoppingCompare: getCorrectedRatesStrict(safeFact(compareRate), range, 'shoppingCompare'),
      place: getCorrectedRatesStrict(safeFact(placeRate), range, 'place'),
      quiz: getCorrectedRatesStrict(safeFact(quizRate), range, 'quiz'),
      placeSave: getCorrectedRatesStrict(safeFact(saveRate), range, 'placeSave'),
      placeSave2: getCorrectedRatesStrict(safeFact(save2Rate), range, 'placeSave2'),
      placeKeep: getCorrectedRatesStrict(safeFact(keepRate), range, 'placeKeep'),
    };
    updateGuestRates(guestRates);
  };

  // 등락률 표시용 헬퍼
  const getDisplayRate = (fact: any, typeKey: string) => {
    if (isLoggedIn) return fact;
    if (!guestRates) return null; // Firestore에서 아직 불러오지 못한 경우
    return guestRates[typeKey] || { 상승: 0, 유지: 0, 하락: 0 };
  };

  // 모바일 슬라이드 메뉴 상태
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    // 햄버거 버튼 클릭 이벤트 리스너
    const openHandler = () => setMobileMenuOpen(true);
    window.addEventListener('openMobileSidebar', openHandler);
    return () => window.removeEventListener('openMobileSidebar', openHandler);
  }, []);

  // 광고유형별 유입수 집계 로직 (ReportGenerator와 동일)
  const adTypes = ['쇼핑(가격비교)', '쇼핑(단일)', '플레이스퀴즈', '저장하기', '저장x2', 'KEEP', '쿠팡'];
  let adTypeIdx = -1, inflowIdx = -1;
  if (rawData && rawData.length > 0) {
    adTypeIdx = rawData[0].findIndex((h: string) => h.replace(/\s/g, '').includes('광고유형'));
    inflowIdx = rawData[0].findIndex((h: string) => h.replace(/\s/g, '').includes('유입수'));
  }
  const inflowSummary: Record<string, number> = {};
  let total = 0;
  if (adTypeIdx !== -1 && inflowIdx !== -1) {
    for (let i = 1; i < rawData.length; i++) {
      const type = rawData[i][adTypeIdx];
      const inflow = Number(rawData[i][inflowIdx]) || 0;
      if (adTypes.includes(type)) {
        inflowSummary[type] = (inflowSummary[type] || 0) + inflow;
        total += inflow;
      }
    }
  }
  const formatNumber = (num: number) => num.toLocaleString('ko-KR');

  // 로그인 시 Firestore에서 reportMultiInputs, reportDropdownOptions 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      loadReportInputs().then(inputs => {
        setReportMultiInputs(inputs || {});
      });
      loadReportDropdownOptions().then(options => {
        setReportDropdownOptions(options && options.length > 0 ? options : ["가격비교검색", "통합검색"]);
      });
    }
  }, [isLoggedIn]);

  // reportMultiInputs 변경 시 Firestore에 저장
  useEffect(() => {
    if (isLoggedIn) {
      saveReportInputs(reportMultiInputs);
    }
  }, [reportMultiInputs, isLoggedIn]);

  // reportDropdownOptions 변경 시 Firestore에 저장
  useEffect(() => {
    if (isLoggedIn) {
      saveReportDropdownOptions(reportDropdownOptions);
    }
  }, [reportDropdownOptions, isLoggedIn]);

  if (!isClient) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black">
      {/* LoginModal: PC/모바일 공통 루트에서 조건부 렌더링 */}
      {showLogin && (
        <LoginModal
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          loginId={loginId}
          setLoginId={setLoginId}
          loginPw={loginPw}
          setLoginPw={setLoginPw}
          handleLogin={handleLogin}
        />
      )}
      {/* PC: flex row로 Sidebar + MainContent */}
      <div className="hidden md:flex min-h-screen w-full bg-black justify-center">
        <div className="w-full max-w-[1440px] mx-auto flex flex-row">
          <Sidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isLoggedIn={isLoggedIn}
            setShowLogin={setShowLogin}
            setShowCorrectionSetting={setShowCorrectionSetting}
            setIsLoggedIn={setIsLoggedIn}
            setLoginId={setLoginId}
            setLoginPw={setLoginPw}
          />
          <div className="flex-1">
            <main className="p-8">
              <div className="max-w-[1440px] mx-auto w-full">
              {/* LoginModal 분리: 기존 위치 삭제 */}
              {/* Raw 데이터 업로드: 최상단으로 복구 */}
              {isLoggedIn && (
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-4">Raw 데이터를 업로드 해주세요</h1>
                  <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 border border-white/10">
                    <ExcelUploader onData={handleUpload} />
                  </div>
                </div>
              )}
              {/* CorrectionSettings 분리 */}
              {showCorrectionSetting ? (
                <CorrectionSettings
                  correctionItems={correctionItems}
                  types={types}
                  correctionRange={correctionRange}
                  setCorrectionRange={setCorrectionRange}
                  saveAdjustment={handleSaveCorrection}
                  saveAdjustmentHistory={() => {}} // FirestoreService에서 제공하지 않는 함수
                  setShowCorrectionSetting={setShowCorrectionSetting}
                />
              ) : (
                <>
                  {/* RateDisplaySection 분리: 쇼핑 전체 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="쇼핑 전체 등락률"
                        data={getDisplayRate(rate, 'shopping')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* RateDisplaySection 분리: 쇼핑 단일 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="쇼핑[단일] 등락률"
                        data={getDisplayRate(singleRate, 'shoppingSingle')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* RateDisplaySection 분리: 쇼핑 가격비교 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="쇼핑[가격비교] 등락률"
                        data={getDisplayRate(compareRate, 'shoppingCompare')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* RateDisplaySection 분리: 플레이스 전체 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="플레이스 전체 등락률"
                        data={getDisplayRate(placeRate, 'place')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* RateDisplaySection 분리: 플레이스 퀴즈 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="플레이스 퀴즈 등락률"
                        data={getDisplayRate(quizRate, 'quiz')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* RateDisplaySection 분리: 플레이스 저장 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="플레이스 저장 등락률"
                        data={getDisplayRate(saveRate, 'placeSave')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* RateDisplaySection 분리: 플레이스 저장x2 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="플레이스 저장x2 등락률"
                        data={getDisplayRate(save2Rate, 'placeSave2')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* RateDisplaySection 분리: 플레이스 KEEP 등락률 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                    <div className="w-full">
                      <RateDisplaySection
                        title="플레이스 KEEP 등락률"
                        data={getDisplayRate(keepRate, 'placeKeep')}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>
                  )}
                  {/* ShoppingTable 분리 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'shopping') && shoppingList && shoppingList.length > 0 && (
                    <>
                      <div className="text-lg font-semibold mt-12 mb-4 text-white">네이버 쇼핑 데이터</div>
                      <ShoppingTable header={shoppingDashboardHeader} data={shoppingList} />
                    </>
                  )}
                  {/* PlaceTable 분리 */}
                  {(activeMenu === 'dashboard' || activeMenu === 'place') && placeList && placeList.length > 0 && (
                    <>
                      <div className="text-lg font-semibold mt-12 mb-4 text-white">네이버 플레이스 데이터</div>
                      <PlaceTable header={placeDashboardHeader} data={placeList} />
                    </>
                  )}
                  {/* ReportGenerator 분리 */}
                  {activeMenu === 'report' && (
                    <ReportGenerator
                      rawData={rawData}
                      reportRows={reportRows}
                      reportHeader={reportHeader}
                      reportMultiInputs={reportMultiInputs}
                      setReportMultiInputs={setReportMultiInputs}
                      reportDropdownOptions={reportDropdownOptions}
                      setReportDropdownOptions={setReportDropdownOptions}
                      showRawPreview={showRawPreview}
                      setShowRawPreview={setShowRawPreview}
                      showRisePreview={showRisePreview}
                      setShowRisePreview={setShowRisePreview}
                      excelSerialToDate={excelSerialToDate}
                      realChartData={realChartData}
                    />
                  )}
                </>
              )}
              </div>
            </main>
          </div>
        </div>
      </div>
      {/* 모바일: MainContent + MobileSidebar(햄버거/슬라이드) */}
      <div className="block md:hidden w-full min-h-screen bg-black">
        <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
          <Sidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isLoggedIn={isLoggedIn}
            setShowLogin={setShowLogin}
            setShowCorrectionSetting={setShowCorrectionSetting}
            setIsLoggedIn={setIsLoggedIn}
            setLoginId={setLoginId}
            setLoginPw={setLoginPw}
            onMenuClick={() => setMobileMenuOpen(false)} // 메뉴 클릭 시 자동 닫힘
          />
        </MobileSidebar>
        <main className="w-full px-4 pt-14 pb-8 flex flex-col gap-4">
            {/* 모바일 대시보드/리포트/보정치 모두 상단에 업로드 안내 박스 노출 */}
            {isLoggedIn && (
              <div className="max-w-[420px] mx-auto w-full mt-8">
                <h1 className="text-lg font-bold mb-4 text-white mt-4">Raw 데이터를 업로드 해주세요</h1>
                <div className="bg-[#18181b] rounded-2xl shadow-lg p-4 border border-white/10 flex justify-center items-center min-h-[90px]">
                  <ExcelUploader onData={handleUpload} />
                </div>
              </div>
            )}
            {/* 리포트 발행용 메뉴일 때만 집계 표 노출 */}
            {isLoggedIn && activeMenu === 'report' && (
              <div className="max-w-[420px] mx-auto w-full">
                {/* 10K 광고 물량 집계 표 */}
                <div className="w-full bg-[#232329] rounded-2xl p-6 shadow-lg border border-white/10 flex flex-col mb-8">
                  <div className="text-lg font-bold text-white mb-4">10K 광고 물량 파악</div>
                  <div className="text-base font-semibold text-white mb-2">어제 집행 물량 집계</div>
                  <table className="w-full text-xs border border-white/10 bg-[#18181b] rounded-xl">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-gray-300 border-b border-white/10">광고유형</th>
                        <th className="px-3 py-2 text-gray-300 border-b border-white/10">유입수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adTypes.map(type => (
                        <tr key={type}>
                          <td className="px-3 py-2 text-white border-b border-white/10">{type}</td>
                          <td className="px-3 py-2 text-white border-b border-white/10 text-right">{formatNumber((inflowSummary && inflowSummary[type]) || 0)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="px-3 py-2 font-bold text-blue-400">총 집행물량</td>
                        <td className="px-3 py-2 font-bold text-blue-400 text-right">{formatNumber((typeof total !== 'undefined' && total) || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {showCorrectionSetting ? (
              <div className="max-w-[420px] mx-auto w-full">
                <CorrectionSettings
                  correctionItems={correctionItems}
                  types={types}
                  correctionRange={correctionRange}
                  setCorrectionRange={setCorrectionRange}
                  saveAdjustment={handleSaveCorrection}
                  saveAdjustmentHistory={() => {}}
                  setShowCorrectionSetting={setShowCorrectionSetting}
                />
              </div>
            ) : (
              <>
                {/* 등락률 박스만 세로로 쭉 나열 */}
                {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                  <RateDisplaySection
                    title="쇼핑 전체 등락률"
                    data={getDisplayRate(rate, 'shopping')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                  <RateDisplaySection
                    title="쇼핑[단일] 등락률"
                    data={getDisplayRate(singleRate, 'shoppingSingle')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                  <RateDisplaySection
                    title="쇼핑[가격비교] 등락률"
                    data={getDisplayRate(compareRate, 'shoppingCompare')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                  <RateDisplaySection
                    title="플레이스 전체 등락률"
                    data={getDisplayRate(placeRate, 'place')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                  <RateDisplaySection
                    title="플레이스 퀴즈 등락률"
                    data={getDisplayRate(quizRate, 'quiz')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                  <RateDisplaySection
                    title="플레이스 저장 등락률"
                    data={getDisplayRate(saveRate, 'placeSave')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                  <RateDisplaySection
                    title="플레이스 저장x2 등락률"
                    data={getDisplayRate(save2Rate, 'placeSave2')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                  <RateDisplaySection
                    title="플레이스 KEEP 등락률"
                    data={getDisplayRate(keepRate, 'placeKeep')}
                    isLoggedIn={isLoggedIn}
                  />
                )}
                {/* 테이블/그래프/미리보기/리포트 등은 모바일에서 숨김 */}
              </>
            )}
        </main>
      </div>
    </div>
  );
}

function excelSerialToDate(serial: any): string {
  if (!serial || isNaN(serial)) return serial;
  // 엑셀 기준 1900-01-01
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  // YYYY-MM-DD 포맷
  const yyyy = date_info.getFullYear();
  const mm = String(date_info.getMonth() + 1).padStart(2, '0');
  const dd = String(date_info.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}