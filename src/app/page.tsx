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
  const lineOptions = activeMenu === 'shopping' ? shoppingLineOptions : placeLineOptions;
  const handleToggleLine = (key: string) => {
    if (activeMenu === 'shopping') setShoppingLineOptions(lines => lines.map(l => l.key === key ? { ...l, visible: !l.visible } : l));
    else setPlaceLineOptions(lines => lines.map(l => l.key === key ? { ...l, visible: !l.visible } : l));
  };
  const handleChangePeriod = (type: 'day' | 'week' | 'month') => {
    setPeriodType(type);
    // 실제 데이터 가공 로직은 추후 추가
  };

  // 차트 이력 데이터 상태
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    loadUploadHistory().then(data => {
      if (Array.isArray(data)) setHistory(data);
    });
  }, []);

  // 보정치 이력 상태
  const [adjustmentHistory, setAdjustmentHistory] = useState<any[]>([]);
  useEffect(() => {
    loadAdjustmentHistory().then(data => {
      if (Array.isArray(data)) setAdjustmentHistory(data);
    });
  }, []);

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

  // 오늘/어제 날짜를 useState/useEffect로 관리 (SSR/CSR 불일치 방지)
  const [todayStr, setTodayStr] = React.useState('');
  const [yesterdayStr, setYesterdayStr] = React.useState('');
  const [todayFullStr, setTodayFullStr] = React.useState('');
  React.useEffect(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    setTodayStr(`${pad(today.getMonth() + 1)}월 ${pad(today.getDate())}일`);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    setYesterdayStr(`${pad(yesterday.getMonth() + 1)}월 ${pad(yesterday.getDate())}일`);
    setTodayFullStr(`${today.getFullYear()}년 ${pad(today.getMonth() + 1)}월 ${pad(today.getDate())}일 (${week[today.getDay()]})`);
  }, []);

  // chartData는 todayStr을 date로 사용
  const chartData = React.useMemo(() => {
    if (!todayStr) return [];
    if (activeMenu === 'shopping') {
      return [
        {
          date: todayStr,
          전체: rate?.상승 ?? null,
          단일: singleRate?.상승 ?? null,
          가격비교: compareRate?.상승 ?? null,
        },
      ];
    } else {
      return [
        {
          date: todayStr,
          전체: placeRate?.상승 ?? null,
          퀴즈: quizRate?.상승 ?? null,
          저장: saveRate?.상승 ?? null,
          저장x2: save2Rate?.상승 ?? null,
          KEEP: keepRate?.상승 ?? null,
        },
      ];
    }
  }, [activeMenu, rate, singleRate, compareRate, placeRate, quizRate, saveRate, save2Rate, keepRate, todayStr]);

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
        shoppingRiseMin: 30, shoppingRiseMax: 40,
        // 추후 유지/하락, 다른 등락률도 추가 가능
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
    if (!fact) return null;
    // typeKey: 'shopping', 'shoppingSingle', ...
    // correction: correctionRange
    // 1. 보정 구간
    const riseMin = correction?.[`${typeKey}RiseMin`] ?? 0;
    const riseMax = correction?.[`${typeKey}RiseMax`] ?? 100;
    const fallMin = correction?.[`${typeKey}FallMin`] ?? 0;
    const fallMax = correction?.[`${typeKey}FallMax`] ?? 100;
    // 2. 상승 보정
    let rise = fact['상승'];
    if (rise < riseMin || rise > riseMax) {
      const base = Math.random() * (riseMax - riseMin) + riseMin;
      rise = Math.round((base + (Math.random() - 0.5) * 2) * 10) / 10;
      rise = Math.max(riseMin, Math.min(riseMax, rise));
    }
    // 3. 하락 보정
    let fall = fact['하락'];
    if (fall < fallMin || fall > fallMax) {
      const base = Math.random() * (fallMax - fallMin) + fallMin;
      fall = Math.round((base + (Math.random() - 0.5) * 2) * 10) / 10;
      fall = Math.max(fallMin, Math.min(fallMax, fall));
    }
    // 4. 유지 자동 계산
    let keep = Math.round((100 - rise - fall) * 10) / 10;
    // 소수점 오차 보정
    const total = Math.round((rise + keep + fall) * 10) / 10;
    if (total !== 100) {
      keep += 100 - total;
    }
    return { '상승': rise, '유지': keep, '하락': fall, '상승_개수': fact['상승_개수'], '유지_개수': fact['유지_개수'], '하락_개수': fact['하락_개수'] };
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
        전체: newRate?.상승 ?? null,
        단일: newSingleRate?.상승 ?? null,
        가격비교: newCompareRate?.상승 ?? null,
      },
      place: {
        전체: newPlaceRate?.상승 ?? null,
        퀴즈: newQuizRate?.상승 ?? null,
        저장: newSaveRate?.상승 ?? null,
        저장x2: newSave2Rate?.상승 ?? null,
        KEEP: newKeepRate?.상승 ?? null,
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
    todayStr, yesterdayStr, "D-2", "D-3", "D-4", "D-5", "D-6", "D-7",
    "최초순위", "어제순위대비", "최초순위대비", "신규진입", "RowID"
  ];
  // 플레이스 대시보드 헤더
  const placeDashboardHeader = [
    "광고유형", "검색량", "최초대비", "어제대비",
    todayStr, yesterdayStr, "D-2", "D-3", "D-4", "D-5", "D-6", "D-7",
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

  return (
    <div className="w-full min-h-screen bg-black">
      <div className="flex justify-center min-h-screen">
        {/* 로그인 모달 */}
        {showLogin && (
          <form
            onSubmit={handleLogin}
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
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
          <div className="pl-6 py-1 text-left text-gray-400 mb-6">{todayFullStr}</div>
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

            {isLoggedIn && (
              <button
                className="pl-6 py-1 text-left text-gray-400 hover:text-white transition"
                onClick={() => setShowCorrectionSetting(true)}
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
          {/* 차트: 숨김 처리 */}
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
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (rate ? (
                (() => {
                  const show = isLoggedIn ? rate : getCachedCorrectedRates('shopping', rate, correctionRange, 'shopping');
                  return (
                    <div className="mt-8">
                      <h2 className="font-semibold mb-4 text-white">쇼핑 전체 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{show?.상승 !== undefined ? show.상승.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show?.상승_개수 ?? '-'}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{show?.유지 !== undefined ? show.유지.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show?.유지_개수 ?? '-'}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{show?.하락 !== undefined ? show.하락.toFixed(1) + '%' : '-'}</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show?.하락_개수 ?? '-'}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>
              ))}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && singleRate && (
                (() => {
                  const showSingle = isLoggedIn ? singleRate : getCachedCorrectedRates('shoppingSingle', singleRate, correctionRange, 'shoppingSingle');
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">쇼핑[단일] 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showSingle.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSingle.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showSingle.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSingle.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showSingle.하락.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSingle.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && compareRate && (
                (() => {
                  const showCompare = isLoggedIn ? compareRate : getCachedCorrectedRates('shoppingCompare', compareRate, correctionRange, 'shoppingCompare');
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">쇼핑[가격비교] 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showCompare.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showCompare.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showCompare.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showCompare.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showCompare.하락.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showCompare.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && placeRate && (
                (() => {
                  const showPlace = isLoggedIn ? placeRate : getCachedCorrectedRates('place', placeRate, correctionRange, 'place');
                  return (
                    <div className="mt-8">
                      <h2 className="font-semibold mb-4 text-white">플레이스 전체 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showPlace.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showPlace.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showPlace.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showPlace.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showPlace.하락.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showPlace.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && quizRate && (
                (() => {
                  const showQuiz = isLoggedIn ? quizRate : getCachedCorrectedRates('quiz', quizRate, correctionRange, 'quiz');
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 퀴즈 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showQuiz.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showQuiz.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showQuiz.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showQuiz.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showQuiz.하락.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showQuiz.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && saveRate && (
                (() => {
                  const showSave = isLoggedIn ? saveRate : getCachedCorrectedRates('placeSave', saveRate, correctionRange, 'placeSave');
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 저장 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showSave.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showSave.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showSave.하락.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && save2Rate && (
                (() => {
                  const showSave2 = isLoggedIn ? save2Rate : getCachedCorrectedRates('placeSave2', save2Rate, correctionRange, 'placeSave2');
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 저장x2 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showSave2.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave2.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showSave2.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave2.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showSave2.하락.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showSave2.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && keepRate && (
                (() => {
                  const showKeep = isLoggedIn ? keepRate : getCachedCorrectedRates('placeKeep', keepRate, correctionRange, 'placeKeep');
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">플레이스 KEEP 등락률<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{showKeep.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showKeep.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{showKeep.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{showKeep.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{showKeep.하락.toFixed(1)}%</span>
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
                                  <span className="font-semibold text-green-400">[{row[findColumnIndex(reportHeader, "광고ID")] || '-'}]</span> 키워드 {input.keywordCount}개, 유입경로: {input.channels.join(", ")}
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