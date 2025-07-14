"use client";
import React, { useState, useEffect } from "react";
import ExcelUploader from "@/components/ExcelUploader";
import { makeTempData } from "@/utils/dataProcessor";
import {
  calcShoppingRate,
  calcShoppingSingleRate,
  calcShoppingCompareRate,
} from "@/utils/dashboardProcessor";
import { calcPlaceRate } from "@/utils/dashboardProcessor";
import { calcPlaceTypeRate } from "@/utils/dashboardProcessor";
import { getShoppingDashboardListV2 } from "@/utils/dashboardProcessor";
import { getPlaceDashboardListV2 } from "@/utils/dashboardProcessor";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { saveUploadData, loadUploadData, loadAdjustment, saveUploadHistory, loadUploadHistory, saveAdjustmentHistory, loadAdjustmentHistory } from "@/utils/firestoreService";
import { saveAdjustment } from "@/utils/firestoreService";
import DashboardLineChart from "@/components/DashboardLineChart";

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
  const [correctionRange, setCorrectionRange] = useState<any>({});
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
<<<<<<< HEAD
  
  // 리포트 발행용 관련 state
  const [reportMultiInputs, setReportMultiInputs] = useState<Record<string, { keywordCount: string; channels: string[] }>>({});
  const [reportInputs, setReportInputs] = useState<Record<string, { keywordCount: string; channel: string }>>({});
  const [showRawPreview, setShowRawPreview] = useState(false);
  const [reportHeader, setReportHeader] = useState<string[]>([]);
  const [showRisePreview, setShowRisePreview] = useState(false);
  const [reportDropdownOptions, setReportDropdownOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [editOptionIdx, setEditOptionIdx] = useState<number|null>(null);
  const [editOptionValue, setEditOptionValue] = useState("");
  const [reportRows, setReportRows] = useState<any[]>([]);

  // 차트 상태 및 예시 데이터 (쇼핑/플레이스)
=======
>>>>>>> 58a181ddb163c65343bbaac185ff431c5cafb04c
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
  const [reportMultiInputs, setReportMultiInputs] = useState<Record<string, { keywordCount: string; channels: string[] }>>({});
  const [reportInputs, setReportInputs] = useState<Record<string, { keywordCount: string; channel: string }>>({});
  const [showRawPreview, setShowRawPreview] = useState(false);
  const [reportHeader, setReportHeader] = useState<string[]>([]);
  const [showRisePreview, setShowRisePreview] = useState(false);
  const [reportDropdownOptions, setReportDropdownOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [editOptionIdx, setEditOptionIdx] = useState<number|null>(null);
  const [editOptionValue, setEditOptionValue] = useState("");

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
    loadUploadData().then(data => {
      if (data) {
        setRawData(data.rawData ? JSON.parse(data.rawData) : []);
        setTempData(data.tempData ? JSON.parse(data.tempData) : []);
        setRate(data.rate || null);
        setSingleRate(data.singleRate || null);
        setCompareRate(data.compareRate || null);
        setPlaceRate(data.placeRate || null);
        setQuizRate(data.quizRate || null);
        setSaveRate(data.saveRate || null);
        setSave2Rate(data.save2Rate || null);
        setKeepRate(data.keepRate || null);
        setShoppingList(data.shoppingList ? JSON.parse(data.shoppingList) : []);
        setPlaceList(data.placeList ? JSON.parse(data.placeList) : []);
      } else {
        // Firestore에 데이터가 없을 때 기본값 세팅 (또는 안내 메시지)
        setRawData([]);
        setTempData([]);
        setRate(null);
        setSingleRate(null);
        setCompareRate(null);
        setPlaceRate(null);
        setQuizRate(null);
        setSaveRate(null);
        setSave2Rate(null);
        setKeepRate(null);
        setShoppingList([]);
        setPlaceList([]);
      }
    });
    loadAdjustment().then(data => {
      if (data) setCorrectionRange(data);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogin = localStorage.getItem('isLoggedIn');
      if (savedLogin === 'true') {
        setIsLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('correctionRange');
      if (saved) setCorrectionRange(JSON.parse(saved));
      else setCorrectionRange({
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
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('correctionRange', JSON.stringify(correctionRange));
    }
  }, [correctionRange]);

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
      .reduce((acc, item) => {
        const existing = acc.find(existing => existing.순위키워드 === item.순위키워드);
        if (!existing) {
          acc.push(item);
        }
        return acc;
      }, [] as any[])
      .slice(0, 5);
    setReportRows(topRows);
  }, [rawData]);

  // 보정치 적용 함수
  function getCorrectedRates(fact: any, correction: any, typeKey: any) {
    // 비로그인 시: 보정치 적용 (팩트 데이터 기반)
    if (!isLoggedIn) {
      // 보정치 키 매핑
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
      const keepMin = correction?.[`${baseKey}KeepMin`] ?? 0;
      const keepMax = correction?.[`${baseKey}KeepMax`] ?? 100;
      const fallMin = correction?.[`${baseKey}FallMin`] ?? 0;
      const fallMax = correction?.[`${baseKey}FallMax`] ?? 100;

      // 팩트 데이터 추출
      const factRise = fact?.상승 ?? 0;
      const factKeep = fact?.유지 ?? 0;
      const factFall = fact?.하락 ?? 0;

      // 구간 보정 로직
      function getCorrectedValue(factValue: number, min: number, max: number): number {
        // 팩트 데이터가 구간 내에 있으면 그대로 사용
        if (factValue >= min && factValue <= max) {
          return factValue;
        }
        // 구간 밖이면 구간 내 랜덤값으로 보정
        return Math.random() * (max - min) + min;
      }

      // 상승/하락 구간 보정
      let 상승 = getCorrectedValue(factRise, riseMin, riseMax);
      let 하락 = getCorrectedValue(factFall, fallMin, fallMax);
      
      // 유지 = 100 - (상승 + 하락) 자동 계산
      let 유지 = 100 - 상승 - 하락;
      
      // 값 보정 (음수 방지)
      if (유지 < 0) {
        유지 = 0;
        // 상승과 하락을 비율에 맞게 조정
        const total = 상승 + 하락;
        if (total > 0) {
          상승 = (상승 / total) * 100;
          하락 = (하락 / total) * 100;
        }
      }
      
      // 소수점 1자리로 고정
      상승 = Math.round(상승 * 10) / 10;
      유지 = Math.round(유지 * 10) / 10;
      하락 = Math.round(하락 * 10) / 10;
      
      return {
        '상승': 상승,
        '유지': 유지,
        '하락': 하락,
        '상승_개수': 0,
        '유지_개수': 0,
        '하락_개수': 0
      };
    }
    // 로그인 시: 실제 데이터만 반환
    return {
      '상승': fact && typeof fact['상승'] === 'number' ? fact['상승'] : 0,
      '유지': fact && typeof fact['유지'] === 'number' ? fact['유지'] : 0,
      '하락': fact && typeof fact['하락'] === 'number' ? fact['하락'] : 0,
      '상승_개수': fact?.상승_개수 ?? 0,
      '유지_개수': fact?.유지_개수 ?? 0,
      '하락_개수': fact?.하락_개수 ?? 0
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

  // 2. 업로드 시 등락률 박스(팩트/보정) 기준으로 이력 저장
  const handleUpload = (data: any[][]) => {
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
    }));

    // Firestore에 업로드 데이터 저장 (2차원 배열은 JSON 문자열로 저장)
    saveUploadData({
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
      updatedAt: Date.now(), // 저장 시각 등 추가 가능
    }).then(() => {
      alert("업로드 데이터가 Firestore에 저장되었습니다!");
    });

    // Firestore에 업로드 이력 누적 저장 (YYYY-MM-DD)
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    saveUploadHistory(dateStr, {
      date: dateStr,
      shopping: {
        전체: { 상승: newRate?.상승 ?? null, 유지: newRate?.유지 ?? null, 하락: newRate?.하락 ?? null },
        단일: { 상승: newSingleRate?.상승 ?? null, 유지: newSingleRate?.유지 ?? null, 하락: newSingleRate?.하락 ?? null },
        가격비교: { 상승: newCompareRate?.상승 ?? null, 유지: newCompareRate?.유지 ?? null, 하락: newCompareRate?.하락 ?? null },
      },
      place: {
        전체: { 상승: newPlaceRate?.상승 ?? null, 유지: newPlaceRate?.유지 ?? null, 하락: newPlaceRate?.하락 ?? null },
        퀴즈: { 상승: newQuizRate?.상승 ?? null, 유지: newQuizRate?.유지 ?? null, 하락: newQuizRate?.하락 ?? null },
        저장: { 상승: newSaveRate?.상승 ?? null, 유지: newSaveRate?.유지 ?? null, 하락: newSaveRate?.하락 ?? null },
        저장x2: { 상승: newSave2Rate?.상승 ?? null, 유지: newSave2Rate?.유지 ?? null, 하락: newSave2Rate?.하락 ?? null },
        KEEP: { 상승: newKeepRate?.상승 ?? null, 유지: newKeepRate?.유지 ?? null, 하락: newKeepRate?.하락 ?? null },
      },
      updatedAt: Date.now(),
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === "10k" && loginPw === "wade1234") {
      alert("로그인 성공");
      setShowLogin(false);
      setLoginId("");
      setLoginPw("");
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      alert("로그인 실패");
    }
  };

  // 컬럼명 찾기 함수 (대소문자 무시, 부분 일치)
  function findColumnIndex(header: string[], columnName: string): number {
    const lowerColumnName = columnName.toLowerCase();
    const exactMatch = header.findIndex(col => col.toLowerCase() === lowerColumnName);
    if (exactMatch !== -1) return exactMatch;
    
    // 부분 일치 검색
    const partialMatch = header.findIndex(col => col.toLowerCase().includes(lowerColumnName) || lowerColumnName.includes(col.toLowerCase()));
    if (partialMatch !== -1) return partialMatch;
    
    return -1; // 찾지 못함
  }

  // 엑셀 시리얼 넘버를 JS 날짜 문자열로 변환하는 함수
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

  // 엑셀 시리얼 넘버를 JS 날짜 문자열로 변환하는 함수
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

  // 리포트 발행용 데이터 추출 (쇼핑[가격비교] TOP5) - Raw 데이터 기반으로 변경
  useEffect(() => {
    if (!rawData || rawData.length === 0) return;
    const header = rawData[0];
    setReportHeader(header);
    const rows = rawData.slice(1);
    const idx = (name: string) => header.indexOf(name);
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

  if (!isClient) return null;

  return (
    <div className="w-full min-h-screen bg-black">
      <div className="flex justify-center min-h-screen">
        {/* 로그인 모달 */}
        {showLogin && (
          <form
            onSubmit={handleLogin}
            className="fixed inset-0 flex items-center justify-center bg-black/60"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-[#232329] rounded-2xl p-8 shadow-lg flex flex-col gap-4 min-w-[320px]">
              <div className="text-xl font-bold mb-2 text-white">관리자 로그인</div>
              <input
                className="px-4 py-2 rounded bg-[#18181b] text-white border border-white/10 outline-none"
                placeholder="ID"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
              />
              <input
                className="px-4 py-2 rounded bg-[#18181b] text-white border border-white/10 outline-none"
                placeholder="PW"
                type="password"
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-green-500 text-white font-bold"
              >
                로그인
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-500 text-white font-bold"
                onClick={() => setShowLogin(false)}
              >
                취소
              </button>
            </div>
          </form>
        )}
        {/* 사이드바 */}
        <aside className="w-80 flex-shrink-0 bg-[#18181b] rounded-2xl shadow-lg text-white flex flex-col p-6 mt-8 h-fit sticky top-8 self-start border border-white/10">
          {/* 사이드바 상단에 로그인 상태 뱃지 추가 */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-gray-500'}`}></span>
            <span className="text-sm font-semibold">
              {isLoggedIn ? '🟢 관리자 로그인됨' : '⚪ 게스트'}
            </span>
          </div>
          <div className="text-2xl font-bold mb-8">10K Dashboard</div>
          {todayFullStr && (
            <div className="pl-6 py-1 text-left text-gray-400 mb-6">{todayFullStr}</div>
          )}
          <nav className="flex flex-col gap-2">
            <button
              className={`text-lg font-bold text-left mb-2 ${activeMenu === 'dashboard' ? 'text-white' : 'text-gray-400'}`}
              onClick={() => { setActiveMenu('dashboard'); setShowCorrectionSetting(false); }}
            >
              대시보드
            </button>
            <button
              className={`pl-6 py-1 text-left ${activeMenu === 'shopping' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white transition'}`}
              onClick={() => { setActiveMenu('shopping'); setShowCorrectionSetting(false); }}
            >
              네이버 쇼핑 데이터
            </button>
            <button
              className={`pl-6 py-1 text-left ${activeMenu === 'place' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white transition'}`}
              onClick={() => { setActiveMenu('place'); setShowCorrectionSetting(false); }}
            >
              네이버 플레이스 데이터
            </button>
            <button
              className="text-lg font-bold text-left mt-4 text-gray-400 hover:text-white transition"
              onClick={() => { window.open('https://pf.kakao.com/_WfxmxfG', '_blank'); setShowCorrectionSetting(false); }}
            >
              10K 고객센터
            </button>
            {/* 관리자 로그인/로그아웃 버튼 */}
            {isLoggedIn ? (
              <button
                className="text-lg font-bold text-left mt-2 text-green-400 hover:text-white transition"
                onClick={() => { setIsLoggedIn(false); setLoginId(""); setLoginPw(""); localStorage.removeItem('isLoggedIn'); }}
              >
                로그아웃
              </button>
            ) : (
              <button
                className="text-lg font-bold text-left mt-2 text-gray-400 hover:text-white transition"
                onClick={() => setShowLogin(true)}
              >
                관리자 로그인
              </button>
            )}
<<<<<<< HEAD

=======
            {isLoggedIn && (
              <button
                className={`pl-6 py-1 text-left text-gray-400 hover:text-white transition`}
                onClick={() => { setActiveMenu('report'); setShowCorrectionSetting(false); }}
              >
                리포트 발행용
              </button>
            )}
>>>>>>> 58a181ddb163c65343bbaac185ff431c5cafb04c
            {isLoggedIn && (
              <button
                className="pl-6 py-1 text-left text-gray-400 hover:text-white transition"
                onClick={() => { setShowCorrectionSetting(true); setActiveMenu('dashboard'); }}
              >
                등락률 보정치 조정
              </button>
            )}
            {isLoggedIn && (
              <button
                className={`pl-6 py-1 text-left text-gray-400 hover:text-white transition`}
                onClick={() => { setActiveMenu('report'); setShowCorrectionSetting(false); }}
              >
                리포트 발행용
              </button>
            )}
          </nav>
          <div className="mt-auto pt-8 text-sm text-gray-400">ⓒ 10K ALL rights reserved.</div>
        </aside>
        {/* 메인 컨텐츠 */}
        <main className="w-[1440px] max-w-none p-8">
          {/* Raw 데이터 업로드: 최상단으로 이동 */}
          {isLoggedIn && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-4">Raw 데이터를 업로드 해주세요</h1>
              <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 border border-white/10">
                <ExcelUploader onData={handleUpload} />
              </div>
            </div>
          )}
<<<<<<< HEAD
          {/* 차트: 숨김 처리 */}
=======
          {/* 차트: 쇼핑/플레이스 메뉴에서만 노출, 보정치 조정 중에는 숨김 (아래는 완전 주석처리) */}
          {/*
          {(activeMenu === 'shopping' || activeMenu === 'place') && !showCorrectionSetting && (
            <DashboardLineChart
              data={chartData}
              lines={lineOptions}
              onToggleLine={handleToggleLine}
              periodType={periodType}
              onChangePeriod={handleChangePeriod}
              chartTitle={activeMenu === 'shopping' ? '네이버 쇼핑 상승 추이' : '네이버 플레이스 상승 추이'}
            />
          )}
          */}
>>>>>>> 58a181ddb163c65343bbaac185ff431c5cafb04c
          {showCorrectionSetting ? (
            <div className="flex flex-col gap-8">
              {correctionItems.map(item => (
                <div key={item.key}>
                  <div className="font-bold text-lg mb-4">
                    {item.label}
                    <sup className="ml-2 text-xs text-gray-400 sup-top-align">(어제대비)</sup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {types.map(type => (
                      <div key={type.key} className="bg-[#232329] rounded-2xl p-6 flex flex-col items-center shadow-lg border border-white/10 min-w-[220px]">
                        <span className={`font-semibold text-lg mb-2 text-${type.color}-400`}>{type.label}</span>
                        <div className="relative w-full flex flex-col items-center mb-2">
                          <Slider
                            range
                            min={0}
                            max={100}
                            value={[
                              correctionRange[`${item.key}${type.key}Min`] ?? 0,
                              correctionRange[`${item.key}${type.key}Max`] ?? 100
                            ]}
                            onChange={value => {
                              if (Array.isArray(value)) {
                                const [newMin, newMax] = value;
                                setCorrectionRange((r: any) => ({
                                  ...r,
                                  [`${item.key}${type.key}Min`]: newMin,
                                  [`${item.key}${type.key}Max`]: newMax,
                                }));
                              }
                            }}
                            trackStyle={[{ backgroundColor: type.color === 'green' ? '#22c55e' : type.color === 'blue' ? '#3b82f6' : '#ef4444', height: 8 }]}
                            handleStyle={[
                              { borderColor: '#fff', backgroundColor: type.color === 'green' ? '#22c55e' : type.color === 'blue' ? '#3b82f6' : '#ef4444', width: 24, height: 24, marginTop: -8, boxShadow: '0 0 0 4px #fff4' },
                              { borderColor: '#fff', backgroundColor: type.color === 'green' ? '#22c55e' : type.color === 'blue' ? '#3b82f6' : '#ef4444', width: 24, height: 24, marginTop: -8, boxShadow: '0 0 0 4px #fff4' }
                            ]}
                            railStyle={{ backgroundColor: '#374151', height: 8, borderRadius: 8 }}
                            allowCross={false}
                            pushable={1}
                          />
                          <div className="flex justify-between w-full mt-2 text-xs">
                            <span className={`text-${type.color}-300`}>{correctionRange[`${item.key}${type.key}Min`] ?? 0}%</span>
                            <span className={`text-${type.color}-300`}>{correctionRange[`${item.key}${type.key}Max`] ?? 100}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-4 mt-8">
                <button
                  className="px-6 py-2 rounded text-sm font-bold bg-green-500 text-white transition"
                  onClick={() => {
                    console.log("보정치 저장 함수 호출!", correctionRange);
                    saveAdjustment(correctionRange).then(() => {
                      // 보정치 이력도 Firestore에 누적 저장
                      saveAdjustmentHistory(correctionRange, Date.now());
                      alert("보정치가 Firestore에 저장되었습니다!");
                      setShowCorrectionSetting(false);
                    });
                  }}
                >
                  보정치 저장
                </button>
                <button
                  className="px-6 py-2 rounded text-sm font-bold bg-gray-500 text-white transition"
                  onClick={() => setCorrectionRange({})}
                >
                  초기화
                </button>
                <button
                  className="px-6 py-2 rounded text-sm font-bold bg-gray-600 text-white transition"
                  onClick={() => { setShowCorrectionSetting(false); }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 카드 시각화 */}
              {/* 대시보드(홈): 전체 등락률, 쇼핑/플레이스 모두 보임 */}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                (() => {
                  let show;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!rate) return <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>;
                    show = rate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummyRate = { 상승: 35, 유지: 40, 하락: 25 };
                      show = getCachedCorrectedRates('shopping', dummyRate, correctionRange, 'shopping');
                      if (!show || typeof show.상승 !== 'number' || isNaN(show.상승)) show = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof show.유지 !== 'number' || isNaN(show.유지)) show.유지 = 100;
                      if (typeof show.하락 !== 'number' || isNaN(show.하락)) show.하락 = 0;
                    } else {
                      // SSR에서는 렌더링하지 않음
                      return null;
                    }
                  }
                  return (
                    <div className="mt-8">
                      <h2 className="font-semibold mb-4 text-white">쇼핑 전체 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{show.상승.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show?.상승_개수 ?? '-'}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{show.유지.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show?.유지_개수 ?? '-'}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{show.하락.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show?.하락_개수 ?? '-'}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                (() => {
                  let showSingle;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!singleRate) return null;
                    showSingle = singleRate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummySingleRate = { 상승: 35, 유지: 40, 하락: 25 };
                      showSingle = getCachedCorrectedRates('shoppingSingle', dummySingleRate, correctionRange, 'shoppingSingle');
                      if (!showSingle || typeof showSingle.상승 !== 'number' || isNaN(showSingle.상승)) showSingle = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof showSingle.유지 !== 'number' || isNaN(showSingle.유지)) showSingle.유지 = 100;
                      if (typeof showSingle.하락 !== 'number' || isNaN(showSingle.하락)) showSingle.하락 = 0;
                    } else {
                      return null;
                    }
                  }
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">쇼핑[단일] 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showSingle.상승.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSingle.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showSingle.유지.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSingle.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showSingle.하락.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSingle.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                (() => {
                  let showCompare;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!compareRate) return null;
                    showCompare = compareRate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummyCompareRate = { 상승: 35, 유지: 40, 하락: 25 };
                      showCompare = getCachedCorrectedRates('shoppingCompare', dummyCompareRate, correctionRange, 'shoppingCompare');
                      if (!showCompare || typeof showCompare.상승 !== 'number' || isNaN(showCompare.상승)) showCompare = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof showCompare.유지 !== 'number' || isNaN(showCompare.유지)) showCompare.유지 = 100;
                      if (typeof showCompare.하락 !== 'number' || isNaN(showCompare.하락)) showCompare.하락 = 0;
                    } else {
                      return null;
                    }
                  }
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">쇼핑[가격비교] 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showCompare.상승.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showCompare.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showCompare.유지.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showCompare.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showCompare.하락.toFixed(1) + '%'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showCompare.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                (() => {
                  let showPlace;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!placeRate) return <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>;
                    showPlace = placeRate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummyPlaceRate = { 상승: 35, 유지: 40, 하락: 25 };
                      showPlace = getCachedCorrectedRates('place', dummyPlaceRate, correctionRange, 'place');
                      if (!showPlace || typeof showPlace.상승 !== 'number' || isNaN(showPlace.상승)) showPlace = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof showPlace.유지 !== 'number' || isNaN(showPlace.유지)) showPlace.유지 = 100;
                      if (typeof showPlace.하락 !== 'number' || isNaN(showPlace.하락)) showPlace.하락 = 0;
                    } else {
                      return null;
                    }
                  }
                  return (
                    <div className="mt-8">
                      <h2 className="font-semibold mb-4 text-white">플레이스 전체 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{typeof showPlace.상승 === 'number' && !isNaN(showPlace.상승) ? showPlace.상승.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showPlace.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{typeof showPlace.유지 === 'number' && !isNaN(showPlace.유지) ? showPlace.유지.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showPlace.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{typeof showPlace.하락 === 'number' && !isNaN(showPlace.하락) ? showPlace.하락.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showPlace.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                (() => {
                  let showQuiz;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!quizRate) return null;
                    showQuiz = quizRate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummyQuizRate = { 상승: 35, 유지: 40, 하락: 25 };
                      showQuiz = getCachedCorrectedRates('quiz', dummyQuizRate, correctionRange, 'quiz');
                      if (!showQuiz || typeof showQuiz.상승 !== 'number' || isNaN(showQuiz.상승)) showQuiz = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof showQuiz.유지 !== 'number' || isNaN(showQuiz.유지)) showQuiz.유지 = 100;
                      if (typeof showQuiz.하락 !== 'number' || isNaN(showQuiz.하락)) showQuiz.하락 = 0;
                    } else {
                      return null;
                    }
                  }
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 퀴즈 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{typeof showQuiz.상승 === 'number' && !isNaN(showQuiz.상승) ? showQuiz.상승.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showQuiz.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{typeof showQuiz.유지 === 'number' && !isNaN(showQuiz.유지) ? showQuiz.유지.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showQuiz.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{typeof showQuiz.하락 === 'number' && !isNaN(showQuiz.하락) ? showQuiz.하락.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showQuiz.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                (() => {
                  let showSave;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!saveRate) return null;
                    showSave = saveRate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummySaveRate = { 상승: 35, 유지: 40, 하락: 25 };
                      showSave = getCachedCorrectedRates('placeSave', dummySaveRate, correctionRange, 'placeSave');
                      if (!showSave || typeof showSave.상승 !== 'number' || isNaN(showSave.상승)) showSave = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof showSave.유지 !== 'number' || isNaN(showSave.유지)) showSave.유지 = 100;
                      if (typeof showSave.하락 !== 'number' || isNaN(showSave.하락)) showSave.하락 = 0;
                    } else {
                      return null;
                    }
                  }
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 저장 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{typeof showSave.상승 === 'number' && !isNaN(showSave.상승) ? showSave.상승.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{typeof showSave.유지 === 'number' && !isNaN(showSave.유지) ? showSave.유지.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{typeof showSave.하락 === 'number' && !isNaN(showSave.하락) ? showSave.하락.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                (() => {
                  let showSave2;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!save2Rate) return null;
                    showSave2 = save2Rate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummySave2Rate = { 상승: 35, 유지: 40, 하락: 25 };
                      showSave2 = getCachedCorrectedRates('placeSave2', dummySave2Rate, correctionRange, 'placeSave2');
                      if (!showSave2 || typeof showSave2.상승 !== 'number' || isNaN(showSave2.상승)) showSave2 = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof showSave2.유지 !== 'number' || isNaN(showSave2.유지)) showSave2.유지 = 100;
                      if (typeof showSave2.하락 !== 'number' || isNaN(showSave2.하락)) showSave2.하락 = 0;
                    } else {
                      return null;
                    }
                  }
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 저장x2 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{typeof showSave2.상승 === 'number' && !isNaN(showSave2.상승) ? showSave2.상승.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave2.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{typeof showSave2.유지 === 'number' && !isNaN(showSave2.유지) ? showSave2.유지.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave2.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{typeof showSave2.하락 === 'number' && !isNaN(showSave2.하락) ? showSave2.하락.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave2.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                (() => {
                  let showKeep;
                  if (isLoggedIn) {
                    // 로그인 시: 실제 데이터 사용
                    if (!keepRate) return null;
                    showKeep = keepRate;
                  } else {
                    // 비로그인 시: 보정치 적용 (데이터가 없어도 랜덤값 생성)
                    if (typeof window !== 'undefined') {
                      // 더미 데이터로 보정치 적용
                      const dummyKeepRate = { 상승: 35, 유지: 40, 하락: 25 };
                      showKeep = getCachedCorrectedRates('placeKeep', dummyKeepRate, correctionRange, 'placeKeep');
                      if (!showKeep || typeof showKeep.상승 !== 'number' || isNaN(showKeep.상승)) showKeep = { 상승: 0, 유지: 100, 하락: 0 };
                      if (typeof showKeep.유지 !== 'number' || isNaN(showKeep.유지)) showKeep.유지 = 100;
                      if (typeof showKeep.하락 !== 'number' || isNaN(showKeep.하락)) showKeep.하락 = 0;
                    } else {
                      return null;
                    }
                  }
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 KEEP 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{typeof showKeep.상승 === 'number' && !isNaN(showKeep.상승) ? showKeep.상승.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showKeep.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{typeof showKeep.유지 === 'number' && !isNaN(showKeep.유지) ? showKeep.유지.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showKeep.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{typeof showKeep.하락 === 'number' && !isNaN(showKeep.하락) ? showKeep.하락.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showKeep.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {/* 표: 메뉴에 따라 쇼핑/플레이스 표만 보이게 */}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && shoppingList && shoppingList.length > 0 ? (
                <>
                  <div className="text-lg font-semibold mt-12 mb-4 text-white">네이버 쇼핑 데이터</div>
                  <div className="rounded-2xl shadow-lg bg-[#18181b] mt-0 border border-white/10 overflow-hidden">
                    <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-[#18181b]">
                      <table className="w-full">
                        <thead>
                          <tr>
                            {/* 쇼핑 표 헤더 */}
                            {shoppingDashboardHeader.slice(0, -1).map((header, idx) => (
                              <th
                                key={idx}
                                className={`bg-[#232329] text-[#e4e4e7] font-semibold text-xs px-2 py-3 whitespace-nowrap text-center min-w-0`}
                                style={{ position: 'sticky', top: 0, zIndex: 2 }}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {shoppingList.slice(0, 200).map((row, i) => (
                            <tr key={i} className="border-b border-[#232329] last:rounded-b-2xl">
                              {row.slice(0, -1).map((cell, j) => {
                                // 신규진입 열이면 0→'기존', 1→'신규진입'으로 표시
                                const isNewEntryCol = shoppingDashboardHeader[j] === '신규진입';
                                let cellStr = String(cell);
                                if (isNewEntryCol) {
                                  if (cellStr === '0') cellStr = '기존';
                                  else if (cellStr === '1') cellStr = '신규진입';
                                }
                                const tokens = cellStr.split(/\s|,|\//).filter(Boolean);
                                if (tokens.length > 1) {
                                  return (
                                    <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}>
                                      {tokens.map((token, idx) => {
                                        if (/^-[0-9.]+$/.test(token)) {
                                          return <span key={idx} className="text-red-500 font-bold mr-1">▲{token.slice(1)}</span>;
                                        } else if (token === "-") {
                                          return <span key={idx} className="mr-1">-</span>;
                                        } else if (/^\+[0-9.]+$/.test(token)) {
                                          return <span key={idx} className="text-blue-500 font-bold mr-1">▼{token.slice(1)}</span>;
                                        } else if (token === "0" || token === "0.0" || token === "0.00") {
                                          return <span key={idx} className="mr-1">{token}</span>;
                                        } else {
                                          return <span key={idx} className="mr-1">{token}</span>;
                                        }
                                      })}
                                    </td>
                                  );
                                } else if (/^-[0-9.]+$/.test(cellStr)) {
                                  return (
                                    <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}><span className="text-red-500 font-bold">▲{cellStr.slice(1)}</span></td>
                                  );
                                } else if (cellStr === "-") {
                                  return (
                                    <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}>-</td>
                                  );
                                } else if (/^\+[0-9.]+$/.test(cellStr)) {
                                  return (
                                    <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}><span className="text-blue-500 font-bold">▼{cellStr.slice(1)}</span></td>
                                  );
                                } else {
                                  return (
                                    <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-xs px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}>{cellStr}</td>
                                  );
                                }
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                (activeMenu === 'dashboard' || activeMenu === 'shopping') && (
                  <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>
                )
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && (
                placeList && placeList.length > 0 ? (
                  <>
                    <div className="text-lg font-semibold mt-12 mb-4 text-white">네이버 플레이스 데이터</div>
                    <div className="rounded-2xl shadow-lg bg-[#18181b] mt-0 border border-white/10 overflow-hidden">
                      <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-[#18181b]">
                        <table className="w-full">
                          <thead>
                            <tr>
                              {/* 플레이스 표 헤더 */}
                              {placeDashboardHeader.slice(0, -1).map((header, idx) => (
                                <th
                                  key={idx}
                                  className={`bg-[#232329] text-[#e4e4e7] font-semibold text-xs px-2 py-3 whitespace-nowrap text-center min-w-0`}
                                  style={{ position: 'sticky', top: 0, zIndex: 2 }}
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {placeList.slice(0, 200).map((row, i) => (
                              <tr key={i} className="border-b border-[#232329] last:rounded-b-2xl">
                                {row.slice(0, -1).map((cell, j) => {
                                  // 신규진입 열이면 0→'기존', 1→'신규진입'으로 표시
                                  const isNewEntryCol = placeDashboardHeader[j] === '신규진입';
                                  let cellStr = String(cell);
                                  if (isNewEntryCol) {
                                    if (cellStr === '0') cellStr = '기존';
                                    else if (cellStr === '1') cellStr = '신규진입';
                                  }
                                  const tokens = cellStr.split(/\s|,|\//).filter(Boolean);
                                  if (tokens.length > 1) {
                                    return (
                                      <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}>
                                        {tokens.map((token, idx) => {
                                          if (/^-[0-9.]+$/.test(token)) {
                                            return <span key={idx} className="text-red-500 font-bold mr-1">▲{token.slice(1)}</span>;
                                          } else if (token === "-") {
                                            return <span key={idx} className="mr-1">-</span>;
                                          } else if (/^\+[0-9.]+$/.test(token)) {
                                            return <span key={idx} className="text-blue-500 font-bold mr-1">▼{token.slice(1)}</span>;
                                          } else if (token === "0" || token === "0.0" || token === "0.00") {
                                            return <span key={idx} className="mr-1">{token}</span>;
                                          } else {
                                            return <span key={idx} className="mr-1">{token}</span>;
                                          }
                                        })}
                                      </td>
                                    );
                                  } else if (/^-[0-9.]+$/.test(cellStr)) {
                                    return (
                                      <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}><span className="text-red-500 font-bold">▲{cellStr.slice(1)}</span></td>
                                    );
                                  } else if (cellStr === "-") {
                                    return (
                                      <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}>-</td>
                                    );
                                  } else if (/^\+[0-9.]+$/.test(cellStr)) {
                                    return (
                                      <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-sm px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}><span className="text-blue-500 font-bold">▼{cellStr.slice(1)}</span></td>
                                    );
                                  } else {
                                    return (
                                      <td key={j} className={`bg-[#18181b] text-[#e4e4e7] text-xs px-4 py-2 whitespace-nowrap text-center min-w-0 ${j === 0 ? 'rounded-bl-2xl' : ''} ${j === row.length - 1 ? 'rounded-br-2xl' : ''}`}>{cellStr}</td>
                                    );
                                  }
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>
                )
              )}
              {activeMenu === 'report' && (
                <div className="mt-8">
                  {/* Raw 데이터 미리보기 박스 (최상단) */}
                  <button
                    className="mb-4 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-xs text-white font-semibold shadow-md hover:from-gray-600 hover:to-gray-800 transition-all border border-white/10"
                    onClick={() => setShowRawPreview(v => !v)}
                  >
                    {showRawPreview ? 'Raw 데이터 숨기기' : 'Raw 데이터 미리보기'}
                  </button>
                  {showRawPreview && rawData && rawData.length > 0 && (
                    <div className="mb-8 overflow-x-auto">
                      <table className="w-full text-xs border border-white/10 table-auto" style={{ tableLayout: 'auto' }}>
                        <colgroup>
                          {rawData[0]?.map((_, idx) => <col key={idx} />)}
                        </colgroup>
                        <thead>
                          <tr>
                            {rawData[0]?.map((col, idx) => <th key={idx} className="px-3 py-2 bg-[#232329] text-[#e4e4e7] font-semibold whitespace-nowrap">{col}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {rawData.slice(1, 11).map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => {
                                const isDateCol = rawData[0][j] === "광고시작일";
                                return (
                                  <td key={j} className="px-3 py-2 text-[#e4e4e7] whitespace-nowrap text-center">
                                    {isDateCol ? excelSerialToDate(cell) : cell}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* 리포트 타이틀 */}
                  <h2 className="text-2xl font-bold mb-4 text-white">최초 순위 대비 오늘, 상승 폭 TOP5 광고ID : (쇼핑[가격비교])</h2>
                  {/* 상승 데이터 추적 미리보기 박스 */}
                  <button
                    className="mb-4 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-800 to-gray-900 text-xs text-white font-semibold shadow-md hover:from-blue-700 hover:to-gray-800 transition-all border border-blue-900/30"
                    onClick={() => setShowRisePreview(v => !v)}
                  >
                    {showRisePreview ? '상승 데이터 추적 숨기기' : '상승 데이터 추적 미리보기'}
                  </button>
                  {showRisePreview && rawData && rawData.length > 0 && (() => {
                    const header = rawData[0];
                    const rows = rawData.slice(1);
                    const idx = (name: string) => header.indexOf(name);
                    // B열(슬롯ID) 추가 반영, 광고유형 '쇼핑(가격비교)', D-Day/최초순위 숫자인 행만
                    const filtered = rows.filter(row => row[idx("광고유형")] === "쇼핑(가격비교)" && !isNaN(Number(row[idx("D-Day")])) && !isNaN(Number(row[idx("최초순위")])));
                    const riseRows = filtered
                      .map(row => ({
                        row,
                        상승폭: Number(row[idx("최초순위")]) - Number(row[idx("D-Day")]),
                      }))
                      .sort((a, b) => b.상승폭 - a.상승폭)
                      .slice(0, 10);
                    // 주요 컬럼만 출력
                    const cols = ["광고ID", "슬롯ID", "이름", "광고유형", "광고시작일", "유입수", "순위키워드", "검색량", "D-Day", "최초순위", "상승폭"];
                    return (
                      <div className="mb-8 overflow-x-auto">
                        <div className="font-bold mb-2 text-white">상승 데이터 추적</div>
                        <table className="w-full text-xs border border-white/10 table-auto" style={{ tableLayout: 'auto' }}>
                          <colgroup>
                            {cols.map((_, idx) => <col key={idx} />)}
                          </colgroup>
                          <thead>
                            <tr>
                              {cols.map(col => <th key={col} className="px-3 py-2 bg-[#232329] text-[#e4e4e7] font-semibold whitespace-nowrap">{col}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {riseRows.map(({ row, 상승폭 }, i) => (
                              <tr key={i}>
                                {cols.map(col => {
                                  if (col === "상승폭") {
                                    return <td key={col} className="px-3 py-2 text-[#e4e4e7] whitespace-nowrap text-center">{상승폭}</td>;
                                  } else if (col === "D-Day") {
                                    const dday = row[idx("D-Day")];
                                    const first = row[idx("최초순위")];
                                    const diff = Number(first) - Number(dday);
                                    let diffColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-blue-500" : "";
                                    return (
                                      <td key={col} className="px-3 py-2 text-[#e4e4e7] whitespace-nowrap text-center">
                                        {dday}{!isNaN(diff) && diff !== 0 && (
                                          <span className={`${diffColor} font-semibold ml-1`}>({diff > 0 ? "+" : ""}{diff})</span>
                                        )}
                                      </td>
                                    );
                                  } else if (col === "광고시작일") {
                                    return <td key={col} className="px-3 py-2 text-[#e4e4e7] whitespace-nowrap text-center">{excelSerialToDate(row[idx("광고시작일")])}</td>;
                                  } else {
                                    return <td key={col} className="px-3 py-2 text-[#e4e4e7] whitespace-nowrap text-center">{row[idx(col)]}</td>;
                                  }
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                  {/* 기존 리포트용 테이블 */}
                  <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-[#18181b] to-[#232329] border border-white/20 overflow-x-auto mt-8 p-4">
                    <table className="w-full table-auto border-separate border-spacing-0 text-xs text-gray-200" style={{ tableLayout: 'auto' }}>
                      <colgroup>
                        <col /><col /><col /><col /><col /><col /><col /><col /><col /><col />
                      </colgroup>
                      <thead>
                        <tr className="bg-[#232329]">
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">광고ID</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">로그인ID</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">광고시작일</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">유입수</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">순위키워드</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">검색량</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">D-DAY</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">10K 슬롯ID</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">10K 활성화 키워드 수</th>
                          <th className="px-3 py-2 font-bold text-xs text-gray-300 border-b border-white/10">10K 유입경로</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRows.map(({ row, 광고ID, 슬롯ID }, idx) => {
                          const key = `${광고ID}-${슬롯ID}`;
                          const input = reportMultiInputs[key] || { keywordCount: "", channels: [] };
                          return (
                            <tr key={key} className={idx % 2 === 0 ? "bg-[#202024] hover:bg-[#232329] transition" : "bg-[#18181b] hover:bg-[#232329] transition"}>
<<<<<<< HEAD
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[findColumnIndex(reportHeader, "광고ID")] || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[findColumnIndex(reportHeader, "로그인ID")] || row[findColumnIndex(reportHeader, "ID")] || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{excelSerialToDate(row[findColumnIndex(reportHeader, "광고시작일")])}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[findColumnIndex(reportHeader, "유입수")] || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[findColumnIndex(reportHeader, "순위키워드")] || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[findColumnIndex(reportHeader, "검색량")] || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">
                                {(() => {
                                  const dday = row[findColumnIndex(reportHeader, "D-Day")];
                                  const first = row[findColumnIndex(reportHeader, "최초순위")];
                                  const diff = Number(first) - Number(dday);
                                  let diffColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-blue-500" : "";
                                  return (
                                    <>
                                      {dday}{!isNaN(diff) && diff !== 0 && (
                                        <span className={`${diffColor} font-semibold ml-1`}>({diff > 0 ? "+" : ""}{diff})</span>
                                      )}
                                    </>
                                  );
                                })()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[findColumnIndex(reportHeader, "슬롯ID")] || '-'}</td>
=======
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("광고ID")]}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("로그인ID")]}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{excelSerialToDate(row[reportHeader.indexOf("광고시작일")])}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("유입수")]}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("순위키워드")]}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("검색량")]}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("D-Day")]}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("슬롯ID")]}</td>
>>>>>>> 58a181ddb163c65343bbaac185ff431c5cafb04c
                              {/* 입력/선택 필드는 기존대로 */}
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">
                                <input type="number" className="bg-[#232329] text-white px-2 py-1 rounded w-16 text-xs border border-gray-600/30" value={input.keywordCount} onChange={e => setReportMultiInputs(inputs => ({ ...inputs, [key]: { ...inputs[key], keywordCount: e.target.value } }))} />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">
                                {/* 다중 선택 드롭다운 */}
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {input.channels.map((ch, i) => (
                                    <span key={i} className="bg-blue-700 text-white rounded px-2 py-0.5 text-xs flex items-center">
                                      {ch}
                                      <button className="ml-1 text-xs" onClick={() => setReportMultiInputs(inputs => ({ ...inputs, [key]: { ...inputs[key], channels: inputs[key].channels.filter(c => c !== ch) } }))}>×</button>
                                    </span>
                                  ))}
                                </div>
                                <select className="bg-[#232329] text-white px-2 py-1 rounded w-full text-xs border border-gray-600/30" value="" onChange={e => {
                                  const val = e.target.value;
                                  if (val && !input.channels.includes(val)) {
                                    setReportMultiInputs(inputs => ({ ...inputs, [key]: { ...inputs[key], channels: [...inputs[key].channels, val] } }));
                                  }
                                }}>
                                  <option value="">추가 선택</option>
                                  {reportDropdownOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                        {/* GPT 리포트 2행 */}
                        <tr>
                          <td colSpan={10} className="bg-[#232329] text-blue-400 font-bold px-4 py-2 text-xs rounded-t-lg">GPT리포트 : 최초 대비 오늘 상승폭이 큰 "쇼핑(가격비교)"상품</td>
                        </tr>
                        <tr>
                          <td colSpan={10} className="bg-[#18181b] text-white px-4 py-3 text-xs rounded-b-lg border-b border-white/10">
                            {/* 실제 리포트 내용: 5개 행의 입력/선택값을 조합해서 출력 (임시) */}
                            {reportRows.map(({ row, 광고ID, 슬롯ID }, idx) => {
                              const key = `${광고ID}-${슬롯ID}`;
                              const input = reportMultiInputs[key] || { keywordCount: "", channels: [] };
                              return (
                                <div key={key} className="mb-1">
<<<<<<< HEAD
                                  <span className="font-semibold text-green-400">[{row[findColumnIndex(reportHeader, "광고ID")] || '-'}]</span> 키워드 {input.keywordCount}개, 유입경로: {input.channels.join(", ")}
=======
                                  <span className="font-semibold text-green-400">[{row[reportHeader.indexOf("광고ID")]}]</span> 키워드 {input.keywordCount}개, 유입경로: {input.channels.join(", ")}
>>>>>>> 58a181ddb163c65343bbaac185ff431c5cafb04c
                                </div>
                              );
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {/* 드롭다운 옵션 관리 UI */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white shadow-lg border border-white/10">
                      <div className="font-bold mb-2 text-xs text-gray-300">유입경로 옵션 관리</div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {reportDropdownOptions.map((opt, i) => (
                          <span key={i} className="bg-gray-700 rounded px-2 py-1 flex items-center gap-1 text-xs shadow-sm border border-gray-600/30">
                            {editOptionIdx === i ? (
                              <>
                                <input value={editOptionValue} onChange={e => setEditOptionValue(e.target.value)} className="bg-[#18181b] text-white px-2 py-1 rounded text-xs border border-gray-500/30" />
                                <button onClick={() => {
                                  setReportDropdownOptions(opts => opts.map((o, idx) => idx === i ? editOptionValue : o));
                                  setEditOptionIdx(null); setEditOptionValue("");
                                }} className="text-green-400 text-xs px-1 py-0.5 rounded hover:bg-green-900/30">저장</button>
                                <button onClick={() => { setEditOptionIdx(null); setEditOptionValue(""); }} className="text-gray-400 text-xs px-1 py-0.5 rounded hover:bg-gray-700/30">취소</button>
                              </>
                            ) : (
                              <>
                                {opt}
                                <button onClick={() => { setEditOptionIdx(i); setEditOptionValue(opt); }} className="text-yellow-400 ml-1 text-xs px-1 py-0.5 rounded hover:bg-yellow-900/30">수정</button>
                                <button onClick={() => setReportDropdownOptions(opts => opts.filter((_, idx) => idx !== i))} className="text-red-400 ml-1 text-xs px-1 py-0.5 rounded hover:bg-red-900/30">삭제</button>
                              </>
                            )}
                          </span>
                        ))}
                        <input value={newOption} onChange={e => setNewOption(e.target.value)} className="bg-[#18181b] text-white px-2 py-1 rounded text-xs border border-gray-500/30" placeholder="새 옵션"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newOption && !reportDropdownOptions.includes(newOption)) {
                                setReportDropdownOptions(opts => [...opts, newOption]);
                                setNewOption("");
                              }
                            }
                          }}
                        />
                        <button onClick={() => { if (newOption && !reportDropdownOptions.includes(newOption)) { setReportDropdownOptions(opts => [...opts, newOption]); setNewOption(""); } }} className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold shadow hover:bg-blue-700 transition">추가</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}