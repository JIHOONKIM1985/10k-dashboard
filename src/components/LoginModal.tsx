import React from 'react';

interface LoginModalProps {
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  loginId: string;
  setLoginId: (id: string) => void;
  loginPw: string;
  setLoginPw: (pw: string) => void;
  handleLogin: (e: React.FormEvent) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  showLogin,
  setShowLogin,
  loginId,
  setLoginId,
  loginPw,
  setLoginPw,
  handleLogin,
}) => {
  if (!showLogin) return null;
  return (
    <form
      onSubmit={handleLogin}
      className="fixed inset-0 flex items-center justify-center bg-black/600"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-[#232329] rounded-2xl p-8 shadow-lg flex flex-col gap-4 min-w-[320px]">
        <div className="text-xl font-bold mb-2 text-white">관리자 로그인</div>
        <input
          className="px-4 py-2 rounded bg-[#18181b] text-white border border-white/10 outline-none"
          placeholder="ID"
          value={loginId}
          onChange={e => setLoginId(e.target.value)}
        />
        <input
          className="px-4 py-2 rounded bg-[#18181b] text-white border border-white/10 outline-none"
          placeholder="PW"
          type="password"
          value={loginPw}
          onChange={e => setLoginPw(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-500 text-white font-bold"
        >
          로그인
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-500 text-white font-bold"
          onClick={() => setShowLogin(false)}
        >
          취소
        </button>
      </div>
    </form>
  );
};

export default LoginModal; 