import React from 'react';

interface RateDisplaySectionProps {
  title: string;
  data: any;
  isLoggedIn: boolean;
}

const RateDisplaySection: React.FC<RateDisplaySectionProps> = ({
  title,
  data,
  isLoggedIn,
}) => {
  const show = data;
  if (!show) {
    return <div className="mt-8 text-center text-gray-400">로딩 중...</div>;
  }
  if (typeof show.상승 !== 'number' || typeof show.유지 !== 'number' || typeof show.하락 !== 'number') {
    return <div className="mt-8 text-center text-gray-400">데이터가 없습니다.</div>;
  }
  return (
    <div className="mt-8 px-2 sm:px-0 w-full">
      <h2 className="font-semibold mb-4 text-white">{title}<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
      {/* 모바일: flex-row 3분할, PC: grid-cols-3 w-full */}
      <div className="flex flex-row gap-3 w-full justify-between sm:grid sm:grid-cols-3 sm:gap-6 sm:w-full">
        <div className="w-[30%] sm:w-full sm:max-w-none max-w-xs bg-[#18181b] rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-white border border-white/10">
          <span className="text-base sm:text-lg font-bold text-green-400">상승</span>
          <span className="text-2xl sm:text-3xl font-bold">{show.상승?.toFixed(1) + '%'}</span>
          {isLoggedIn && (
            <span className="text-xs sm:text-sm text-gray-400">{show?.상승_개수 ?? '-'}개</span>
          )}
        </div>
        <div className="w-[30%] sm:w-full sm:max-w-none max-w-xs bg-[#18181b] rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-white border border-white/10">
          <span className="text-base sm:text-lg font-bold text-blue-400">유지</span>
          <span className="text-2xl sm:text-3xl font-bold">{show.유지?.toFixed(1) + '%'}</span>
          {isLoggedIn && (
            <span className="text-xs sm:text-sm text-gray-400">{show?.유지_개수 ?? '-'}개</span>
          )}
        </div>
        <div className="w-[30%] sm:w-full sm:max-w-none max-w-xs bg-[#18181b] rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-white border border-white/10">
          <span className="text-base sm:text-lg font-bold text-red-400">하락</span>
          <span className="text-2xl sm:text-3xl font-bold">{show.하락?.toFixed(1) + '%'}</span>
          {isLoggedIn && (
            <span className="text-xs sm:text-sm text-gray-400">{show?.하락_개수 ?? '-'}개</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateDisplaySection; 