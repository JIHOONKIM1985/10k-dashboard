import React from 'react';

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
  return (
    <div className="mt-8">
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