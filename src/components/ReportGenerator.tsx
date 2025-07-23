import React from 'react';
import { saveAdInflowSummary, loadAdInflowSummary, saveAdInflowHistory, loadAdInflowHistory } from '@/utils/firestoreService';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ReportGeneratorProps {
  rawData: any[][];
  reportRows: any[];
  reportHeader: string[];
  reportMultiInputs: Record<string, { keywordCount: string; channels: string[] }>;
  setReportMultiInputs: (inputs: any) => void;
  reportDropdownOptions: string[];
  setReportDropdownOptions: (opts: string[]) => void;
  showRawPreview: boolean;
  setShowRawPreview: (v: boolean) => void;
  showRisePreview: boolean;
  setShowRisePreview: (v: boolean) => void;
  excelSerialToDate: (serial: any) => string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  rawData,
  reportRows,
  reportHeader,
  reportMultiInputs,
  setReportMultiInputs,
  reportDropdownOptions,
  setReportDropdownOptions,
  showRawPreview,
  setShowRawPreview,
  showRisePreview,
  setShowRisePreview,
  excelSerialToDate,
}) => {
  const [inflowHistory, setInflowHistory] = React.useState<any>({});
  const [inflowChartData, setInflowChartData] = React.useState<any[]>([]);
  const [inflowPeriod, setInflowPeriod] = React.useState<'day' | 'week' | 'month'>('day');

  // Firestore에서 집계 이력 불러오기
  React.useEffect(() => {
    loadAdInflowHistory().then(history => {
      setInflowHistory(history || {});
    });
  }, []);

  // 그래프용 데이터 가공 (일간/주간/월간)
  React.useEffect(() => {
    if (!inflowHistory || Object.keys(inflowHistory).length === 0) {
      setInflowChartData([]);
      return;
    }
    const allDates = Object.keys(inflowHistory).sort();
    if (inflowPeriod === 'day') {
      // 오늘 날짜 구하기
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      // 오늘 제외, 직전 7일(어제~7일 전)만 추출
      const prev7Dates = allDates.filter(d => d < todayStr).slice(-7);
      const chartData = prev7Dates.map(date => ({ date, ...inflowHistory[date] }));
      setInflowChartData(chartData);
      return;
    }
    const adTypes = ['쇼핑(가격비교)', '쇼핑(단일)', '플레이스퀴즈', '저장하기', '저장x2', 'KEEP', '쿠팡'];
    // 날짜 정렬 (최신순)
    const dates = Object.keys(inflowHistory).sort();
    let chartData: any[] = [];
    if (inflowPeriod === 'week') {
      // 주간: 7일씩 묶어서 합산
      const weekChunks = [];
      for (let i = 0; i < dates.length; i += 7) {
        weekChunks.push(dates.slice(i, i + 7));
      }
      chartData = weekChunks.map((chunk, idx) => {
        const obj: any = { week: `${chunk[0]}~${chunk[chunk.length - 1]}` };
        adTypes.forEach(type => {
          obj[type] = chunk.reduce((sum, date) => sum + (inflowHistory[date]?.[type] || 0), 0);
        });
        return obj;
      });
    } else if (inflowPeriod === 'month') {
      // 월간: YYYY-MM별로 합산
      const monthMap: Record<string, any> = {};
      dates.forEach(date => {
        const ym = date.slice(0, 7);
        if (!monthMap[ym]) monthMap[ym] = {};
        adTypes.forEach(type => {
          monthMap[ym][type] = (monthMap[ym][type] || 0) + (inflowHistory[date]?.[type] || 0);
        });
      });
      chartData = Object.keys(monthMap).map(ym => {
        const obj: any = { month: ym };
        adTypes.forEach(type => {
          obj[type] = monthMap[ym][type] || 0;
        });
        return obj;
      });
    }
    setInflowChartData(chartData);
  }, [inflowHistory, inflowPeriod]);

  React.useEffect(() => {
    // rawData가 변경될 때 Firestore에 날짜별 집계 저장
    if (rawData && rawData.length > 1) {
      const adTypes = ['쇼핑(가격비교)', '쇼핑(단일)', '플레이스퀴즈', '저장하기', '저장x2', 'KEEP', '쿠팡'];
      let adTypeIdx = rawData[0].findIndex((h: string) => h.replace(/\s/g, '').includes('광고유형'));
      let inflowIdx = rawData[0].findIndex((h: string) => h.replace(/\s/g, '').includes('유입수'));
      if (adTypeIdx !== -1 && inflowIdx !== -1) {
        const inflowSummary: Record<string, number> = {};
        for (let i = 1; i < rawData.length; i++) {
          const type = rawData[i][adTypeIdx];
          const inflow = Number(rawData[i][inflowIdx]) || 0;
          if (adTypes.includes(type)) {
            inflowSummary[type] = (inflowSummary[type] || 0) + inflow;
          }
        }
        // 오늘 날짜(YYYY-MM-DD)
        const today = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        saveAdInflowHistory(dateStr, inflowSummary);
      }
    }
  }, [rawData]);
  // 광고유형별 유입수 집계 로직
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
  // 숫자 포맷 함수
  const formatNumber = (num: number) => num.toLocaleString('ko-KR');
  // 파스텔톤/연한 단색 계열 컬러 추천
  const lineColors = [
    '#2563eb', // 파랑
    '#60a5fa', // 연파랑
    '#a5b4fc', // 연보라
    '#fbbf24', // 노랑
    '#34d399', // 민트
    '#f472b6', // 핑크
    '#a3a3a3', // 연회색
  ];
  // SVG filter: glow 효과
  const GlowDefs = () => (
    <defs>
      <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#60a5fa" floodOpacity="0.8" />
      </filter>
      <filter id="glow-mint" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#34d399" floodOpacity="0.8" />
      </filter>
      <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#a5b4fc" floodOpacity="0.8" />
      </filter>
      <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#fbbf24" floodOpacity="0.8" />
      </filter>
      <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f472b6" floodOpacity="0.8" />
      </filter>
      <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f87171" floodOpacity="0.8" />
      </filter>
      <filter id="glow-gray" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#a3a3a3" floodOpacity="0.8" />
      </filter>
    </defs>
  );
  // 커스텀 툴팁: 각 텍스트 앞에 색상 점
  const CustomTooltip = ({ active, payload, label, adTypes, lineColors }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-lg bg-[#232329] px-3 py-2 shadow text-xs text-white border border-white/10">
        <div className="mb-1 text-[13px] text-blue-300 font-semibold">{label}</div>
        {payload.map((entry: any, idx: number) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: lineColors[idx], display: 'inline-block', marginRight: 4, boxShadow: `0 0 2px 1px ${lineColors[idx]}` }} />
            <span>{adTypes[idx]}</span>
            <span className="ml-2 font-bold">{entry.value.toLocaleString('ko-KR')}</span>
          </div>
        ))}
      </div>
    );
  };
  // 모바일 환경 감지
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // 모바일 분기 제거, 모든 UI는 PC에서만 노출
  return (
    <div className="mt-8">
      {/* 10K 광고 물량 파악 섹션 */}
      <div className="flex w-full mb-8 gap-8">
        {/* 왼쪽 1/4: 어제 집행 물량 집계 표 */}
        <div className="w-1/4 bg-[#232329] rounded-2xl p-6 shadow-lg border border-white/10 flex flex-col">
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
                  <td className="px-3 py-2 text-white border-b border-white/10 text-right">{formatNumber(inflowSummary[type] || 0)}</td>
                </tr>
              ))}
              <tr>
                <td className="px-3 py-2 font-bold text-blue-400">총 집행물량</td>
                <td className="px-3 py-2 font-bold text-blue-400 text-right">{formatNumber(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 오른쪽 3/4: 물량 추이 그래프 */}
        <div className="w-3/4 flex flex-col items-center justify-center">
          <div className="bg-[#232329] bg-opacity-80 rounded-xl border border-white/10 shadow px-12 py-6 w-full h-[420px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 w-full">
              <div className="text-base font-bold text-white">10K 광고 물량 추이</div>
              <div className="flex gap-2">
                <button className={`px-3 py-1 rounded text-xs font-semibold border ${inflowPeriod === 'day' ? 'bg-blue-700 text-white' : 'bg-[#232329] text-gray-300'} border-blue-700`} onClick={() => setInflowPeriod('day')}>일간</button>
                <button className={`px-3 py-1 rounded text-xs font-semibold border ${inflowPeriod === 'week' ? 'bg-blue-700 text-white' : 'bg-[#232329] text-gray-300'} border-blue-700`} onClick={() => setInflowPeriod('week')}>주간</button>
                <button className={`px-3 py-1 rounded text-xs font-semibold border ${inflowPeriod === 'month' ? 'bg-blue-700 text-white' : 'bg-[#232329] text-gray-300'} border-blue-700`} onClick={() => setInflowPeriod('month')}>월간</button>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* 커스텀 얇은 가로선 4줄 */}
              <div className="absolute left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute w-full h-px bg-gray-700/40" style={{ top: '20%' }} />
                <div className="absolute w-full h-px bg-gray-700/40" style={{ top: '40%' }} />
                <div className="absolute w-full h-px bg-gray-700/40" style={{ top: '60%' }} />
                <div className="absolute w-full h-px bg-gray-700/40" style={{ top: '80%' }} />
              </div>
              <ResponsiveContainer width="95%" height="100%">
                <LineChart data={inflowChartData} margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
                  <GlowDefs />
                  <CartesianGrid stroke="#393944" vertical={false} horizontal={false} strokeWidth={0.5} />
                  <XAxis hide dataKey="date" />
                  <YAxis hide width={0} />
                  <Tooltip content={<CustomTooltip adTypes={adTypes} lineColors={lineColors} />} />
                  {adTypes.map((type, idx) => (
                    <Line
                      key={type}
                      type="linear"
                      dataKey={type}
                      stroke="#f5f5f5"
                      strokeWidth={1}
                      dot={false}
                      activeDot={false}
                      strokeOpacity={0.9}
                      isAnimationActive={false}
                      filter={`url(#glow-${['blue','mint','purple','yellow','pink','red','gray'][idx]})`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              {/* 날짜 라벨: 그래프 아래에 직접 표시 */}
              <div className="flex w-full justify-between mt-2 px-2 select-none">
                {inflowChartData.map((d, i) => (
                  <span key={d.date} className="text-xs text-gray-300" style={{ minWidth: 40, textAlign: 'center' }}>{d.date?.slice(2)}</span>
                ))}
              </div>
              {/* 미니멀 범례 */}
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {adTypes.map((type, idx) => (
                  <div key={type} className="flex items-center gap-1 text-xs text-gray-300">
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: lineColors[idx], display: 'inline-block', boxShadow: `0 0 2px 1px ${lineColors[idx]}` }} />
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Raw 데이터 미리보기 박스 (최상단) */}
      <button
        className="mb-4 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-xs text-white font-semibold shadow-md hover:from-gray-600 hover:to-gray-800 transition-all border border-white/10"
        onClick={() => setShowRawPreview(!showRawPreview)}
      >
        {showRawPreview ? 'Raw 데이터 숨기기' : 'Raw 데이터 미리보기'}
      </button>
      {showRawPreview && rawData && rawData.length > 0 && (
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-xs border border-white/10 table-auto" style={{ tableLayout: 'auto' }}>
            <colgroup>
              {rawData[0]?.map((_: any, idx: number) => <col key={idx} />)}
            </colgroup>
            <thead>
              <tr>
                {rawData[0]?.map((col: any, idx: number) => <th key={idx} className="px-3 py-2 bg-[#232329] text-[#e4e4e7] font-semibold whitespace-nowrap">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {rawData.slice(1, 11).map((row, i) => (
                <tr key={i}>
                  {row.map((cell: any, j: number) => {
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
        onClick={() => setShowRisePreview(!showRisePreview)}
      >
        {showRisePreview ? '상승 데이터 추적 숨기기' : '상승 데이터 추적 미리보기'}
      </button>
      {/* ...상승 데이터 추적 미리보기 로직은 Home에서 복사해서 붙여넣기... */}
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
            {reportRows.map(({ row, 광고ID, 슬롯ID }: any, idx: number) => {
              const key = `${광고ID}-${슬롯ID}`;
              const input = reportMultiInputs[key] || { keywordCount: "", channels: [] };
              return (
                <tr key={key} className={idx % 2 === 0 ? "bg-[#202024] hover:bg-[#232329] transition" : "bg-[#18181b] hover:bg-[#232329] transition"}>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("광고ID")]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("로그인ID")]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{excelSerialToDate(row[reportHeader.indexOf("광고시작일")])}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("유입수")]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("순위키워드")]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("검색량")]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("D-Day")]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">{row[reportHeader.indexOf("슬롯ID")]}</td>
                  {/* 입력/선택 필드는 기존대로 */}
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">
                    <input type="number" className="bg-[#232329] text-white px-2 py-1 rounded w-16 text-xs border border-gray-600/30" value={input.keywordCount} onChange={e => setReportMultiInputs((inputs: any) => ({ ...inputs, [key]: { ...inputs[key], keywordCount: e.target.value } }))} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-b border-white/10">
                    {/* 다중 선택 드롭다운 */}
                    <div className="flex flex-wrap gap-1 mb-1">
                      {input.channels.map((ch: string, i: number) => (
                        <span key={i} className="bg-blue-700 text-white rounded px-2 py-0.5 text-xs flex items-center">
                          {ch}
                          <button className="ml-1 text-xs" onClick={() => setReportMultiInputs((inputs: any) => ({ ...inputs, [key]: { ...inputs[key], channels: inputs[key].channels.filter((c: string) => c !== ch) } }))}>×</button>
                        </span>
                      ))}
                    </div>
                    <select className="bg-[#232329] text-white px-2 py-1 rounded w-full text-xs border border-gray-600/30" value="" onChange={e => {
                      const val = e.target.value;
                      if (val && !input.channels.includes(val)) {
                        setReportMultiInputs((inputs: any) => ({ ...inputs, [key]: { ...inputs[key], channels: [...inputs[key].channels, val] } }));
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
                {reportRows.map(({ row, 광고ID, 슬롯ID }: any, idx: number) => {
                  const key = `${광고ID}-${슬롯ID}`;
                  const input = reportMultiInputs[key] || { keywordCount: "", channels: [] };
                  return (
                    <div key={key} className="mb-1">
                      <span className="font-semibold text-green-400">[{row[reportHeader.indexOf("광고ID")]}]</span> 키워드 {input.keywordCount}개, 유입경로: {input.channels.join(", ")}
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
                {opt}
                <button onClick={() => setReportDropdownOptions(reportDropdownOptions.filter((_: string, idx: number) => idx !== i))} className="text-red-400 ml-1 text-xs px-1 py-0.5 rounded hover:bg-red-900/30">삭제</button>
              </span>
            ))}
            <input value={""} onChange={() => {}} className="bg-[#18181b] text-white px-2 py-1 rounded text-xs border border-gray-500/30" placeholder="새 옵션" />
            {/* 옵션 추가 로직은 Home에서 구현 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator; 