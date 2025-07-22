import React from 'react';

interface PlaceTableProps {
  header: string[];
  data: any[][];
  maxRows?: number;
}

const PlaceTable: React.FC<PlaceTableProps> = ({ header, data, maxRows = 200 }) => {
  if (!data || data.length === 0) {
    return <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>;
  }
  return (
    <div className="rounded-2xl shadow-lg bg-[#18181b] mt-0 border border-white/10 overflow-hidden">
      <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-[#18181b]">
        <table className="w-full">
          <thead>
            <tr>
              {header.slice(0, -1).map((h, idx) => (
                <th
                  key={idx}
                  className={`bg-[#232329] text-[#e4e4e7] font-semibold text-xs px-2 py-3 whitespace-nowrap text-center min-w-0`}
                  style={{ position: 'sticky', top: 0, zIndex: 2 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, maxRows).map((row, i) => (
              <tr key={i} className="border-b border-[#232329] last:rounded-b-2xl">
                {row.slice(0, -1).map((cell, j) => {
                  // 신규진입 열이면 0→'기존', 1→'신규진입'으로 표시
                  const isNewEntryCol = header[j] === '신규진입';
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
  );
};

export default PlaceTable; 