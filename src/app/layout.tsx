"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { useState } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 모바일 헤더는 항상 상단에 고정 (높이 56px = 14*4)
function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="md:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-3 bg-[#18181b] border-b border-white/10 h-14">
      <button onClick={onMenuClick} className="p-2"><svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
      <span className="text-lg font-bold text-white">10K</span>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        {/* 모바일 헤더만, MobileSidebar는 page.tsx에서 관리 */}
        <MobileHeader onMenuClick={() => {
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('openMobileSidebar');
            window.dispatchEvent(event);
          }
        }} />
        {/* (모바일 컨텐츠에는 pt-14로 헤더 높이만큼 여백을 둘 것) */}
        {children}
      </body>
    </html>
  );
}
