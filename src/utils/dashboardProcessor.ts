// src/utils/dashboardProcessor.ts

// Temp 데이터에서 쇼핑 전체 등락률(상승/유지/하락) 계산
export function calcShoppingRate(tempData: any[][]) {
    // Temp 컬럼 인덱스: A=0, ..., N=13
    // A: 광고유형, N: 등락(상승/유지/하락/10위이내유지 등)
    const getType = (row: any[]) => row[0];
    const getStatus = (row: any[]) => row[13];
  
    // 쇼핑(단일) 또는 쇼핑(가격비교)만 필터
    const filtered = tempData.filter(
      (row) => getType(row) === "쇼핑(단일)" || getType(row) === "쇼핑(가격비교)"
    );
  
    // 분모: 등락이 상승/유지/10위이내유지/하락인 것만
    const validStatus = ["상승", "유지", "10위이내유지", "하락"];
    const denominator = filtered.filter((row) =>
      validStatus.includes(getStatus(row))
    );
  
    // 각각의 등락률
    const count = (statusArr: string[]) =>
      filtered.filter((row) => statusArr.includes(getStatus(row))).length;
  
    const 상승 = count(["상승"]);
    const 유지 = count(["유지", "10위이내유지"]);
    const 하락 = count(["하락"]);
  
    const total = denominator.length;
  
    return {
      상승: total ? (상승 / total) * 100 : 0,
      유지: total ? (유지 / total) * 100 : 0,
      하락: total ? (하락 / total) * 100 : 0,
      상승_개수: 상승,
      유지_개수: 유지,
      하락_개수: 하락,
      전체_개수: total,
    };
  }

  // 쇼핑[단일] 등락률(상승/유지/하락)
export function calcShoppingSingleRate(tempData: any[][]) {
    const getType = (row: any[]) => row[0];
    const getStatus = (row: any[]) => row[13];
  
    // 쇼핑(단일)만 필터
    const filtered = tempData.filter((row) => getType(row) === "쇼핑(단일)");
  
    const validStatus = ["상승", "유지", "10위이내유지", "하락"];
    const denominator = filtered.filter((row) =>
      validStatus.includes(getStatus(row))
    );
  
    const count = (statusArr: string[]) =>
      filtered.filter((row) => statusArr.includes(getStatus(row))).length;
  
    const 상승 = count(["상승"]);
    const 유지 = count(["유지", "10위이내유지"]);
    const 하락 = count(["하락"]);
    const total = denominator.length;
  
    return {
      상승: total ? (상승 / total) * 100 : 0,
      유지: total ? (유지 / total) * 100 : 0,
      하락: total ? (하락 / total) * 100 : 0,
      상승_개수: 상승,
      유지_개수: 유지,
      하락_개수: 하락,
      전체_개수: total,
    };
  }

  // 쇼핑[가격비교] 등락률(상승/유지/하락)
export function calcShoppingCompareRate(tempData: any[][]) {
    const getType = (row: any[]) => row[0];
    const getStatus = (row: any[]) => row[13];
  
    // 쇼핑(가격비교)만 필터
    const filtered = tempData.filter((row) => getType(row) === "쇼핑(가격비교)");
  
    const validStatus = ["상승", "유지", "10위이내유지", "하락"];
    const denominator = filtered.filter((row) =>
      validStatus.includes(getStatus(row))
    );
  
    const count = (statusArr: string[]) =>
      filtered.filter((row) => statusArr.includes(getStatus(row))).length;
  
    const 상승 = count(["상승"]);
    const 유지 = count(["유지", "10위이내유지"]);
    const 하락 = count(["하락"]);
    const total = denominator.length;
  
    return {
      상승: total ? (상승 / total) * 100 : 0,
      유지: total ? (유지 / total) * 100 : 0,
      하락: total ? (하락 / total) * 100 : 0,
      상승_개수: 상승,
      유지_개수: 유지,
      하락_개수: 하락,
      전체_개수: total,
    };
  }

// 플레이스 전체 등락률(상승/유지/하락)
export function calcPlaceRate(tempData: any[][]) {
  const getType = (row: any[]) => row[0];
  const getStatus = (row: any[]) => row[13];

  // 플레이스 관련 유형만 필터
  const placeTypes = ["KEEP", "저장하기", "저장x2", "플레이스퀴즈"];
  const filtered = tempData.filter((row) => placeTypes.includes(getType(row)));

  const validStatus = ["상승", "유지", "10위이내유지", "하락"];
  const denominator = filtered.filter((row) =>
    validStatus.includes(getStatus(row))
  );

  const count = (statusArr: string[]) =>
    filtered.filter((row) => statusArr.includes(getStatus(row))).length;

  const 상승 = count(["상승"]);
  const 유지 = count(["유지", "10위이내유지"]);
  const 하락 = count(["하락"]);
  const total = denominator.length;

  return {
    상승: total ? (상승 / total) * 100 : 0,
    유지: total ? (유지 / total) * 100 : 0,
    하락: total ? (하락 / total) * 100 : 0,
    상승_개수: 상승,
    유지_개수: 유지,
    하락_개수: 하락,
    전체_개수: total,
  };
}

// 플레이스 유형별 등락률(상승/유지/하락)
export function calcPlaceTypeRate(tempData: any[][], type: string) {
  const getType = (row: any[]) => row[0];
  const getStatus = (row: any[]) => row[13];

  // 해당 유형만 필터
  const filtered = tempData.filter((row) => getType(row) === type);

  const validStatus = ["상승", "유지", "10위이내유지", "하락"];
  const denominator = filtered.filter((row) =>
    validStatus.includes(getStatus(row))
  );

  const count = (statusArr: string[]) =>
    filtered.filter((row) => statusArr.includes(getStatus(row))).length;

  const 상승 = count(["상승"]);
  const 유지 = count(["유지", "10위이내유지"]);
  const 하락 = count(["하락"]);
  const total = denominator.length;

  return {
    상승: total ? (상승 / total) * 100 : 0,
    유지: total ? (유지 / total) * 100 : 0,
    하락: total ? (하락 / total) * 100 : 0,
    상승_개수: 상승,
    유지_개수: 유지,
    하락_개수: 하락,
    전체_개수: total,
  };
}

// [Dashboard] 쇼핑 리스트 쿼리 (md 파일 4개 쿼리 합본, 중복 제거, 최대 200개)
export function getShoppingDashboardListV2(tempData: any[][], limit = 200) {
  // 컬럼 인덱스
  // Col1=0, Col2=1, Col3=2, Col4=3, Col5=4, Col14=13, Col15=14, Col16=15
  const isShopping = (row: any[]) => row[0] === "쇼핑(가격비교)" || row[0] === "쇼핑(단일)";

  // 쿼리1
  const q1 = tempData
    .filter(row =>
      isShopping(row) &&
      ["상승", "10위이내유지", "유지"].includes(row[13]) &&
      Number(row[3]) <= 0
    )
    .sort((a, b) => Number(a[4]) - Number(b[4]))
    .slice(0, 40);

  // 쿼리2
  const q2 = tempData
    .filter(row =>
      isShopping(row) &&
      row[13] === "상승" &&
      Number(row[3]) < 0
    )
    .sort((a, b) => {
      const c = Number(a[3]) - Number(b[3]);
      if (c !== 0) return c;
      return Number(b[1]) - Number(a[1]);
    })
    .slice(0, 180);

  // 쿼리3
  const q3 = tempData
    .filter(row =>
      isShopping(row) &&
      row[14] === "상승" &&
      Number(row[2]) < 0 &&
      Number(row[15]) === 0
    )
    .sort((a, b) => Number(a[2]) - Number(b[2]))
    .slice(0, 100);

  // 쿼리4
  const q4 = tempData
    .filter(row =>
      isShopping(row) &&
      Number(row[15]) === 1
    )
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 20);

  // 합치고 중복 제거 (RowID=16 기준)
  const all = [...q1, ...q2, ...q3, ...q4];
  const seen = new Set();
  const unique = all.filter(row => {
    const id = row[16];
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return unique.slice(0, limit);
}

// [Dashboard] 플레이스 리스트 쿼리 (md 파일 4개 쿼리 합본, 중복 제거, 최대 200개)
export function getPlaceDashboardListV2(tempData: any[][], limit = 200) {
  // 컬럼 인덱스
  // Col1=0, Col2=1, Col3=2, Col4=3, Col5=4, Col14=13, Col15=14, Col16=15
  const placeTypes = ["플레이스퀴즈", "저장하기", "저장x2", "KEEP"];
  const isPlace = (row: any[]) => placeTypes.includes(row[0]);

  // 쿼리1
  const q1 = tempData
    .filter(row =>
      isPlace(row) &&
      ["상승", "10위이내유지", "유지"].includes(row[13]) &&
      Number(row[3]) <= 0
    )
    .sort((a, b) => Number(a[4]) - Number(b[4]))
    .slice(0, 40);

  // 쿼리2
  const q2 = tempData
    .filter(row =>
      isPlace(row) &&
      row[13] === "상승" &&
      Number(row[3]) < 0
    )
    .sort((a, b) => {
      const c = Number(a[3]) - Number(b[3]);
      if (c !== 0) return c;
      return Number(b[1]) - Number(a[1]);
    })
    .slice(0, 180);

  // 쿼리3
  const q3 = tempData
    .filter(row =>
      isPlace(row) &&
      row[14] === "상승" &&
      Number(row[2]) < 0 &&
      Number(row[15]) === 0
    )
    .sort((a, b) => Number(a[2]) - Number(b[2]))
    .slice(0, 100);

  // 쿼리4
  const q4 = tempData
    .filter(row =>
      isPlace(row) &&
      Number(row[15]) === 1
    )
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 20);

  // 합치고 중복 제거 (RowID=16 기준)
  const all = [...q1, ...q2, ...q3, ...q4];
  const seen = new Set();
  const unique = all.filter(row => {
    const id = row[16];
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return unique.slice(0, limit);
}