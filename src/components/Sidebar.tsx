import React from 'react';

interface SidebarProps {
  activeMenu: 'dashboard' | 'shopping' | 'place' | 'report';
  setActiveMenu: (menu: 'dashboard' | 'shopping' | 'place' | 'report') => void;
  isLoggedIn: boolean;
  setShowLogin: (show: boolean) => void;
  setShowCorrectionSetting: (show: boolean) => void;
  setIsLoggedIn: (v: boolean) => void;
  setLoginId: (v: string) => void;
  setLoginPw: (v: string) => void;
  onMenuClick?: () => void; // 모바일에서 메뉴 클릭 시 사이드바 닫기용
}

const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  isLoggedIn,
  setShowLogin,
  setShowCorrectionSetting,
  setIsLoggedIn,
  setLoginId,
  setLoginPw,
  onMenuClick,
}) => {
  return (
    <aside className="w-80 flex-shrink-0 bg-[#18181b] rounded-2xl shadow-lg text-white flex flex-col p-6 mt-8 h-fit sticky top-8 self-start border border-white/10">
      {/* 사이드바 상단에 로그인 상태 뱃지 추가 */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-gray-500'}`}></span>
        <span className="text-sm font-semibold">
          {isLoggedIn ? '🟢 관리자 로그인됨' : '⚪ 게스트'}
        </span>
      </div>
      <div className="text-2xl font-bold mb-8">10K Dashboard</div>
      <nav className="flex flex-col gap-2">
        <button
          className={`text-lg font-bold text-left mb-2 ${activeMenu === 'dashboard' ? 'text-white' : 'text-gray-400'}`}
          onClick={() => { setActiveMenu('dashboard'); setShowCorrectionSetting(false); onMenuClick && onMenuClick(); }}
        >
          대시보드
        </button>
        <button
          className={`pl-6 py-1 text-left ${activeMenu === 'shopping' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white transition'}`}
          onClick={() => { setActiveMenu('shopping'); setShowCorrectionSetting(false); onMenuClick && onMenuClick(); }}
        >
          네이버 쇼핑 데이터
        </button>
        <button
          className={`pl-6 py-1 text-left ${activeMenu === 'place' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white transition'}`}
          onClick={() => { setActiveMenu('place'); setShowCorrectionSetting(false); onMenuClick && onMenuClick(); }}
        >
          네이버 플레이스 데이터
        </button>
        <button
          className="text-lg font-bold text-left mt-4 text-gray-400 hover:text-white transition"
          onClick={() => { window.open('https://pf.kakao.com/_WfxmxfG', '_blank'); setShowCorrectionSetting(false); onMenuClick && onMenuClick(); }}
        >
          10K 고객센터
        </button>
        {/* 관리자 로그인/로그아웃 버튼 */}
        {isLoggedIn ? (
          <button
            className="text-lg font-bold text-left mt-2 text-green-400 hover:text-white transition"
            onClick={() => { setIsLoggedIn(false); setLoginId(""); setLoginPw(""); localStorage.removeItem('isLoggedIn'); onMenuClick && onMenuClick(); }}
          >
            로그아웃
          </button>
        ) : (
          <button
            className="text-lg font-bold text-left mt-2 text-gray-400 hover:text-white transition"
            onClick={() => { setShowLogin(true); onMenuClick && onMenuClick(); }}
          >
            관리자 로그인
          </button>
        )}
        {isLoggedIn && (
          <button
            className={`pl-6 py-1 text-left text-gray-400 hover:text-white transition`}
            onClick={() => { setActiveMenu('report'); setShowCorrectionSetting(false); onMenuClick && onMenuClick(); }}
          >
            리포트 발행용
          </button>
        )}
        {isLoggedIn && (
          <button
            className="pl-6 py-1 text-left text-gray-400 hover:text-white transition"
            onClick={() => { setShowCorrectionSetting(true); setActiveMenu('dashboard'); onMenuClick && onMenuClick(); }}
          >
            등락률 보정치 조정
          </button>
        )}
      </nav>
      <div className="mt-auto pt-8 text-sm text-gray-400">ⓒ 10K ALL rights reserved.</div>
    </aside>
  );
};

export default Sidebar; 