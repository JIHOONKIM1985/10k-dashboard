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
    <div className="mt-8">
      <h2 className="font-semibold mb-4 text-white">{title}<sup className="ml-1 text-xs text-gray-400 sup-top-align">(어제대비)</sup></h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
          <span className="text-lg font-bold text-green-400">상승</span>
          <span className="text-3xl font-bold">{show.상승?.toFixed(1) + '%'}</span>
          {isLoggedIn && (
            <span className="text-sm text-gray-400">{show?.상승_개수 ?? '-'}개</span>
          )}
        </div>
        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
          <span className="text-lg font-bold text-blue-400">유지</span>
          <span className="text-3xl font-bold">{show.유지?.toFixed(1) + '%'}</span>
          {isLoggedIn && (
            <span className="text-sm text-gray-400">{show?.유지_개수 ?? '-'}개</span>
          )}
        </div>
        <div className="bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center text-white border border-white/10">
          <span className="text-lg font-bold text-red-400">하락</span>
          <span className="text-3xl font-bold">{show.하락?.toFixed(1) + '%'}</span>
          {isLoggedIn && (
            <span className="text-sm text-gray-400">{show?.하락_개수 ?? '-'}개</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateDisplaySection; 