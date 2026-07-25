'use client';

import React, { useState } from 'react';
import { useAuth } from '../auth-provider';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react';

export function TopHeader() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Administrator';
  const displayEmail = user?.email || 'admin@nabs.com';

  return (
    <header className="fixed top-0 z-50 px-6 bg-white flex justify-between items-center w-full h-14 border-b border-[#c6c6cd]">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <Image src="/logo.jpeg" alt="Logo" width={90} height={90} />
        </div>
        <div className="relative flex items-center hidden md:flex">
          <span className="material-symbols-outlined absolute left-3 text-[#45464d] text-[18px] pointer-events-none">
            <Search />
          </span>
          <input
            type="text"
            placeholder="Search requests, customers, vendors..."
            className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-lg pl-9 pr-12 py-1.5 text-xs text-[#0b1c30] w-96 focus:ring-1 focus:ring-[#006591] focus:border-[#006591] transition-all outline-none"
          />
          <span className="absolute right-3 px-1.5 py-0.5 rounded border border-[#c6c6cd] bg-white text-[10px] font-bold text-[#76777d] uppercase tracking-tighter">
            Ctrl + K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="hover:bg-[#eff4ff] transition-colors p-1.5 rounded-md relative group text-[#45464d]"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]"><Bell /></span>
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-4 ml-4 border-l border-[#c6c6cd] text-left focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[12px] leading-tight font-semibold text-[#0b1c30]">
                {displayName}
              </p>
              <p className="text-[10px] text-[#45464d] font-medium">{displayEmail}</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-[#c6c6cd] bg-[#006591] text-white font-bold text-xs flex items-center justify-center uppercase">
              {displayName.charAt(0)}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#c6c6cd] rounded-lg shadow-lg py-1 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-[#c6c6cd] sm:hidden">
                <p className="text-xs font-bold text-[#0b1c30]">{displayName}</p>
                <p className="text-[10px] text-[#45464d]">{displayEmail}</p>
              </div>
              <button
                onClick={() => logout()}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-[#eff4ff] flex items-center gap-2 font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
