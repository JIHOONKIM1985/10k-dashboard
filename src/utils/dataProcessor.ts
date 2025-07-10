// src/utils/dataProcessor.ts

export function makeTempData(rawData: any[][]): any[][] {
    // rawData[0]은 헤더(제목)이므로, 1행부터 처리
    return rawData.slice(1).map((row, idx) => {
      // 각 컬럼 인덱스 (0부터 시작)
      // Raw!A: 0, B:1, ..., F:5, J:9, K:10, L:11, M:12, ..., R:17, S:18, T:19, U:20
  
      const col1 = row[5]; // Raw!F
      const col2 = row[9]; // Raw!J
      const col3 = toNumber(row[10]) - toNumber(row[18]); // Raw!K - Raw!S
      const col4 = isNumber(row[11]) ? toNumber(row[10]) - toNumber(row[11]) : 0; // IF(ISNUMBER(Raw!L), Raw!K-Raw!L, 0)
      const col5 = row[10]; // Raw!K
  
      // Raw!L2:R (L:11 ~ R:17) → 7개 컬럼
      const col6to12 = row.slice(11, 18);
  
      // Raw!S2:U (S:18 ~ U:20) → 3개 컬럼
      const col13to15 = row.slice(18, 21);
  
      // IF(ISNUMBER(Raw!L2:L), 0, 1)
      const col16 = isNumber(row[11]) ? 0 : 1;
  
      // ROW(Raw!A2:A) → 실제로는 2부터 시작 (엑셀 기준)
      const col17 = idx + 2;
  
      // 합치기
      return [
        col1,         // F
        col2,         // J
        col3,         // K-S
        col4,         // IF(ISNUMBER(L), K-L, 0)
        col5,         // K
        ...col6to12,  // L~R
        ...col13to15, // S~U
        col16,        // IF(ISNUMBER(L), 0, 1)
        col17,        // ROW
      ];
    });
  }
  
  function isNumber(val: any) {
    return val !== null && val !== undefined && !isNaN(Number(val));
  }
  function toNumber(val: any) {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }