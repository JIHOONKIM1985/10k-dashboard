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
import { saveUploadData, loadUploadData, loadAdjustment } from "@/utils/firestoreService";
import { saveAdjustment } from "@/utils/firestoreService";

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
  const [correctionRange, setCorrectionRange] = useState<any>({});
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

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

  // 오늘/어제 날짜 구하기
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const formatDate = (date: Date) => `${pad(date.getMonth() + 1)}월 ${pad(date.getDate())}일`;
  const formatFullDate = (date: Date) => `${date.getFullYear()}년 ${pad(date.getMonth() + 1)}월 ${pad(date.getDate())}일 ${week[date.getDay()]}요일`;
  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);
  const todayFullStr = formatFullDate(today);

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
                  onClick={() => {
                    console.log("보정치 저장 함수 호출!", correctionRange);
                    saveAdjustment(correctionRange).then(() => {
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
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && (rate ? (
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
              ) : (
                <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>
              ))}
              {(activeMenu === 'dashboard' || activeMenu === 'shopping') && singleRate && (
                (() => {
                  const showSingle = isLoggedIn ? singleRate : getCachedCorrectedRates('shoppingSingle', singleRate, correctionRange, 'shoppingSingle');
                  return (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">쇼핑[단일] 등락률</h2>
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
                      <h2 className="font-semibold mb-2">쇼핑[가격비교] 등락률</h2>
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
                      <h2 className="font-semibold mb-4 text-white">플레이스 전체 등락률</h2>
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
                      <h2 className="font-semibold mb-2">플레이스 퀴즈 등락률</h2>
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
                      <h2 className="font-semibold mb-2">플레이스 저장 등락률</h2>
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
                      <h2 className="font-semibold mb-2">플레이스 저장x2 등락률</h2>
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
                      <h2 className="font-semibold mb-2">플레이스 KEEP 등락률</h2>
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
                  <div className="rounded-2xl shadow-lg bg-[#18181b] mt-0 border border-white/10">
                    <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-[#18181b]">
                      <table className="w-full rounded-2xl">
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
                    <div className="rounded-2xl shadow-lg bg-[#18181b] mt-0 border border-white/10">
                      <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-[#18181b]">
                        <table className="w-full rounded-2xl">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}