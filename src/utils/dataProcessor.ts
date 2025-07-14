// src/utils/dataProcessor.ts

export function makeTempData(rawData: any[][]): any[][] {
    // rawData[0]은 헤더(제목)이므로, 1행부터 처리
    return rawData.slice(1).map((row, idx) => {
      // 각 컬럼 인덱스 (0부터 시작)
      // Raw!A: 0, B:1, ..., G:6, K:10, L:11, M:12, ..., S:18, T:19, U:20, V:21

      const col1 = row[6]; // Raw!G
      const col2 = row[10]; // Raw!K
      const col3 = toNumber(row[11]) - toNumber(row[19]); // Raw!L - Raw!T
      const col4 = isNumber(row[12]) ? toNumber(row[11]) - toNumber(row[12]) : 0; // IF(ISNUMBER(M), L-M, 0)
      const col5 = row[11]; // Raw!L

      // Raw!M2:S (M:12 ~ S:18) → 7개 컬럼
      const col6to12 = row.slice(12, 19);

      // Raw!T2:V (T:19 ~ V:21) → 3개 컬럼
      const col13to15 = row.slice(19, 22);

      // IF(ISNUMBER(M2:M), 0, 1)
      const col16 = isNumber(row[12]) ? 0 : 1;

      // ROW(Raw!A2:A) → 실제로는 2부터 시작 (엑셀 기준)
      const col17 = idx + 2;

      // 합치기
      return [
        col1,         // G
        col2,         // K
        col3,         // L-T
        col4,         // IF(ISNUMBER(M), L-M, 0)
        col5,         // L
        ...col6to12,  // M~S
        ...col13to15, // T~V
        col16,        // IF(ISNUMBER(M), 0, 1)
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