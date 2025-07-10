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
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'shopping' | 'place'>('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCorrectionSetting, setShowCorrectionSetting] = useState(false);
  const [correctionRange, setCorrectionRange] = useState(() => {
    const saved = localStorage.getItem('correctionRange');
    return saved ? JSON.parse(saved) : {
      shoppingRiseMin: 30, shoppingRiseMax: 40,
      // 추후 유지/하락, 다른 등락률도 추가 가능
    };
  });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  useEffect(() => {
    // 페이지 로드 시 localStorage에서 데이터 불러오기
    const saved = localStorage.getItem('dashboardData');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRawData(parsed.rawData || []);
      setTempData(parsed.tempData || []);
      setRate(parsed.rate || null);
      setSingleRate(parsed.singleRate || null);
      setCompareRate(parsed.compareRate || null);
      setPlaceRate(parsed.placeRate || null);
      setQuizRate(parsed.quizRate || null);
      setSaveRate(parsed.saveRate || null);
      setSave2Rate(parsed.save2Rate || null);
      setKeepRate(parsed.keepRate || null);
      setShoppingList(parsed.shoppingList || []);
      setPlaceList(parsed.placeList || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('correctionRange', JSON.stringify(correctionRange));
  }, [correctionRange]);

  // 보정치 적용 함수
  function getCorrectedRates(fact: any, correction: any, typeKey: any) {
    if (!fact) return null;
    // typeKey: 'shopping', 'shoppingSingle', ...
    // correction: correctionRange
    const keys = ['상승', '유지', '하락'];
    const typeMap = { '상승': 'Rise', '유지': 'Keep', '하락': 'Fall' };
    // 1. 팩트 값 배열
    const factArr = keys.map(k => fact[k]);
    // 2. 보정 구간
    const min = correction?.[`${typeKey}RiseMin`] ?? 0;
    const max = correction?.[`${typeKey}RiseMax`] ?? 100;
    // 3. 보정 적용
    let rise = fact['상승'];
    if (rise < min || rise > max) {
      // 구간 내 랜덤+노이즈
      const base = Math.random() * (max - min) + min;
      rise = Math.round((base + (Math.random() - 0.5) * 2) * 10) / 10; // 소수점 1자리 노이즈
      rise = Math.max(min, Math.min(max, rise));
    }
    // 4. 나머지 비율 분배
    const rest = 100 - rise;
    const keepFact = fact['유지'];
    const fallFact = fact['하락'];
    const sumRest = keepFact + fallFact;
    let keep = sumRest > 0 ? Math.round((rest * keepFact / sumRest) * 10) / 10 : Math.round(rest / 2 * 10) / 10;
    let fall = Math.round((rest - keep) * 10) / 10;
    // 소수점 오차 보정
    const total = Math.round((rise + keep + fall) * 10) / 10;
    if (total !== 100) {
      fall += 100 - total;
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
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === "10k" && loginPw === "wade1234") {
      alert("로그인 성공");
      setShowLogin(false);
      setLoginId("");
      setLoginPw("");
      setIsLoggedIn(true);
    } else {
      alert("로그인 실패");
    }
  };

  // 오늘/어제 날짜 구하기
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDate = (date: Date) => `${pad(date.getMonth() + 1)}월 ${pad(date.getDate())}일`;
  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

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
                onClick={() => { setIsLoggedIn(false); setLoginId(""); setLoginPw(""); }}
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
                className={`pl-6 py-1 text-left text-gray-400 hover:text-white transition`}
                onClick={() => alert('준비중')}
              >
                리포트 발행용
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
          </nav>
          <div className="mt-auto pt-8 text-sm text-gray-400">ⓒ 10K ALL rights reserved.</div>
        </aside>
        {/* 메인 컨텐츠 */}
        <main className="w-[1440px] max-w-none p-8">
          {showCorrectionSetting ? (
            <div className="flex flex-col gap-8">
              {correctionItems.map(item => (
                <div key={item.key}>
                  <div className="font-bold text-lg mb-4">{item.label}</div>
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
                  onClick={() => { setShowCorrectionSetting(false); }}
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
              {isLoggedIn && (
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-4">Raw 데이터를 업로드 해주세요</h1>
                  <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 border border-white/10">
                    <ExcelUploader onData={handleUpload} />
                  </div>
                </div>
              )}
              {/* 카드 시각화 */}
              {/* 대시보드(홈): 전체 등락률, 쇼핑/플레이스 모두 보임 */}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && rate && (
                (() => {
                  const show = isLoggedIn ? rate : getCachedCorrectedRates('shopping', rate, correctionRange, 'shopping');
                  return (
                    <div className="mt-8">
                      <h2 className="font-semibold mb-4 text-white">쇼핑 전체 등락률</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-green-400">상승</span>
                          <span className="text-3xl font-bold">{show.상승.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show.상승_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-blue-400">유지</span>
                          <span className="text-3xl font-bold">{show.유지.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show.유지_개수}개</span>
                          )}
                        </div>
                        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                          <span className="text-lg font-bold text-red-400">하락</span>
                          <span className="text-3xl font-bold">{show.하락.toFixed(1)}%</span>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-400">{show.하락_개수}개</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && singleRate && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2">쇼핑[단일] 등락률</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-green-400">상승</span>
                      <span className="text-3xl font-bold">{singleRate.상승.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{singleRate.상승_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-blue-400">유지</span>
                      <span className="text-3xl font-bold">{singleRate.유지.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{singleRate.유지_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-red-400">하락</span>
                      <span className="text-3xl font-bold">{singleRate.하락.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{singleRate.하락_개수}개</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && compareRate && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2">쇼핑[가격비교] 등락률</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-green-400">상승</span>
                      <span className="text-3xl font-bold">{compareRate.상승.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{compareRate.상승_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-blue-400">유지</span>
                      <span className="text-3xl font-bold">{compareRate.유지.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{compareRate.유지_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-red-400">하락</span>
                      <span className="text-3xl font-bold">{compareRate.하락.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{compareRate.하락_개수}개</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* 플레이스 등락률 */}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && placeRate && (
                <div className="mt-8">
                  <h2 className="font-semibold mb-4 text-white">플레이스 전체 등락률</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-green-400">상승</span>
                      <span className="text-3xl font-bold">{placeRate.상승.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{placeRate.상승_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-blue-400">유지</span>
                      <span className="text-3xl font-bold">{placeRate.유지.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{placeRate.유지_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-red-400">하락</span>
                      <span className="text-3xl font-bold">{placeRate.하락.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{placeRate.하락_개수}개</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && quizRate && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2">플레이스퀴즈 등락률</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-green-400">상승</span>
                      <span className="text-3xl font-bold">{quizRate.상승.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{quizRate.상승_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-blue-400">유지</span>
                      <span className="text-3xl font-bold">{quizRate.유지.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{quizRate.유지_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-red-400">하락</span>
                      <span className="text-3xl font-bold">{quizRate.하락.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{quizRate.하락_개수}개</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && saveRate && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2">플레이스 저장 등락률</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-green-400">상승</span>
                      <span className="text-3xl font-bold">{saveRate.상승.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{saveRate.상승_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-blue-400">유지</span>
                      <span className="text-3xl font-bold">{saveRate.유지.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{saveRate.유지_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-red-400">하락</span>
                      <span className="text-3xl font-bold">{saveRate.하락.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{saveRate.하락_개수}개</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && save2Rate && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2">플레이스 저장x2 등락률</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-green-400">상승</span>
                      <span className="text-3xl font-bold">{save2Rate.상승.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{save2Rate.상승_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-blue-400">유지</span>
                      <span className="text-3xl font-bold">{save2Rate.유지.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{save2Rate.유지_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-red-400">하락</span>
                      <span className="text-3xl font-bold">{save2Rate.하락.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{save2Rate.하락_개수}개</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && keepRate && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2">플레이스 KEEP 등락률</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-green-400">상승</span>
                      <span className="text-3xl font-bold">{keepRate.상승.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{keepRate.상승_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-blue-400">유지</span>
                      <span className="text-3xl font-bold">{keepRate.유지.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{keepRate.유지_개수}개</span>
                      )}
                    </div>
                    <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
                      <span className="text-lg font-bold text-red-400">하락</span>
                      <span className="text-3xl font-bold">{keepRate.하락.toFixed(1)}%</span>
                      {isLoggedIn && (
                        <span className="text-sm text-gray-400">{keepRate.하락_개수}개</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* 표: 메뉴에 따라 쇼핑/플레이스 표만 보이게 */}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && shoppingList && shoppingList.length > 0 && (
                <div className="rounded-2xl shadow-lg bg-[#18181b] mt-8 border border-white/10">
                  <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-[#18181b]">
                    <table className="w-full rounded-2xl">
                      <thead>
                        <tr>
                          {/* 쇼핑 표 헤더 */}
                          {shoppingDashboardHeader.slice(0, -1).map((header, idx) => (
                            <th
                              key={idx}
                              className={`bg-[#232329] text-[#e4e4e7] font-semibold text-xs px-2 py-3 whitespace-nowrap text-center min-w-0 ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === shoppingDashboardHeader.length - 2 ? 'rounded-tr-2xl' : ''}`}
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
              )}
              {(activeMenu === 'dashboard' || activeMenu === 'place') && placeList && placeList.length > 0 && (
                <div className="rounded-2xl shadow-lg bg-[#18181b] mt-8 border border-white/10">
                  <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-[#18181b]">
                    <table className="w-full rounded-2xl">
                      <thead>
                        <tr>
                          {/* 플레이스 표 헤더 */}
                          {placeDashboardHeader.slice(0, -1).map((header, idx) => (
                            <th
                              key={idx}
                              className={`bg-[#232329] text-[#e4e4e7] font-semibold text-xs px-2 py-3 whitespace-nowrap text-center min-w-0 ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === placeDashboardHeader.length - 2 ? 'rounded-tr-2xl' : ''}`}
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
              )}
            </>
          )}
        </main>
        {/* 로그인 모달 */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[#232329] rounded-2xl p-8 shadow-lg w-80 border border-white/10">
              <h2 className="text-xl font-bold mb-4 text-white">관리자 로그인</h2>
              <form onSubmit={handleLogin}>
                <input
                  className="w-full mb-3 px-3 py-2 rounded bg-[#18181b] text-white border border-white/10 outline-none"
                  placeholder="ID"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                />
                <input
                  className="w-full mb-4 px-3 py-2 rounded bg-[#18181b] text-white border border-white/10 outline-none"
                  placeholder="PW"
                  type="password"
                  value={loginPw}
                  onChange={e => setLoginPw(e.target.value)}
                />
                <button type="submit" className="w-full bg-white/10 text-white py-2 rounded font-bold hover:bg-white/20 transition">로그인</button>
                <button type="button" className="w-full mt-2 text-gray-400 hover:text-white" onClick={() => setShowLogin(false)}>취소</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}