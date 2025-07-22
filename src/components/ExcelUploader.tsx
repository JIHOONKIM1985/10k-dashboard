import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ExcelUploaderProps {
  onData: (data: any[][], date: string) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onData }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsed = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      onData(parsed, selectedDate ? selectedDate.toISOString().slice(0, 10) : "");
      setFileName("");
      setSelectedDate(null);
      if (inputRef.current) inputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const handleUploadClick = () => {
    setShowDatePicker(true);
  };

  const handleDateSelect = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setShowDatePicker(false);
    setTimeout(() => {
      inputRef.current?.click();
    }, 100);
  };

  // 미니멀 달력 커스텀 스타일
  const datepickerCustomStyle = `
  .react-datepicker {
    border: none;
    box-shadow: none;
    background: #fff;
    font-size: 14px;
    border-radius: 12px;
    padding: 8px 0 0 0;
  }
  .react-datepicker__header {
    background: #fff;
    border-bottom: none;
    padding-top: 8px;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    font-weight: 400;
    color: #222;
    font-size: 13px;
  }
  .react-datepicker__day {
    border-radius: 8px;
    width: 32px;
    height: 32px;
    line-height: 32px;
    margin: 2px;
    font-size: 14px;
    font-weight: 400;
    color: #222;
    transition: background 0.15s, color 0.15s;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: #2563eb;
    color: #fff;
  }
  .react-datepicker__day:hover {
    background: #e0e7ef;
    color: #222;
  }
  .react-datepicker__day--today {
    border: 1.5px solid #2563eb;
    background: #f3f6fa;
    color: #2563eb;
  }
  .react-datepicker__triangle {
    display: none;
  }
`;

  return (
    <div className="flex flex-col w-full items-center gap-2">
      {/* 업로드 버튼 중앙 정렬 */}
      <div className="w-full flex justify-center">
        <button
          type="button"
          className="w-60 min-w-[240px] px-8 py-3 bg-blue-700 text-white rounded text-base font-bold mb-2 text-center"
          onClick={handleUploadClick}
        >
          엑셀/CSV 업로드
        </button>
      </div>
      {/* 날짜 선택 모달 */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <style>{datepickerCustomStyle}</style>
          <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-3 shadow-md border border-gray-200 min-w-[320px]">
            <div className="text-sm font-medium text-gray-800 mb-1">날짜를 선택하세요</div>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              maxDate={new Date()}
              dateFormat="yyyy-MM-dd"
              inline
              locale="ko"
            />
            <button className="mt-1 text-xs text-gray-400 hover:text-blue-700" onClick={() => setShowDatePicker(false)}>취소</button>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      {fileName && (
        <div className="text-xs text-gray-500">업로드 파일: {fileName}</div>
      )}
    </div>
  );
};

export default ExcelUploader;