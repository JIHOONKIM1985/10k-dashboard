import React, { useRef } from "react";
import * as XLSX from "xlsx";

interface ExcelUploaderProps {
  onData: (data: any[][]) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onData }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFile 호출됨", e.target.files?.[0]);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      console.log("FileReader onload 실행");
      const bstr = evt.target?.result;
      if (!bstr) return;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsed = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      console.log("엑셀 파싱 결과:", parsed);
      onData && onData(parsed);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-6 py-3 rounded bg-blue-500 text-white font-bold"
      >
        엑셀/CSV 업로드
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </>
  );
};

export default ExcelUploader;