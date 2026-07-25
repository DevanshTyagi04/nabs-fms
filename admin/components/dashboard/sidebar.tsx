'use client';

import React from 'react';
import Link from 'next/link';
import { HealthWidget } from './health-widget';
import { Banknote, ChevronRight, HardHat, LayoutDashboard, Settings, Users, Wallet } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] z-40 w-60 bg-white border-r border-[#c6c6cd] flex flex-col hidden lg:flex">
      <div className="flex-1 overflow-y-auto scroll-hide px-3 py-4">
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-[#0b1c30] text-white transition-all"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              <LayoutDashboard />
            </span>
            <span>Dashboard</span>
          </Link>

          <div className="pt-3">
            <p className="px-3 text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
              Service Operations
            </p>
            <div className="nav-link group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#45464d] font-medium hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]"><HardHat /></span>
                <span>Operations</span>
              </div>
              <span className="material-symbols-outlined text-[14px]"><ChevronRight /></span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Service Requests
              </a>
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Technical Surveys
              </a>
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Estimates
              </a>
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Work Orders
              </a>
            </div>
          </div>

          <div className="pt-3">
            <div className="nav-link flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#45464d] font-medium hover:bg-slate-100 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]"><Users /></span>
              <span>People</span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Customers
              </a>
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Vendors
              </a>
            </div>
          </div>

          <div className="pt-3">
            <div className="nav-link flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#45464d] font-medium hover:bg-slate-100 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]"><Banknote /></span>
              <span>Finance</span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Payments
              </a>
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Invoices
              </a>
            </div>
          </div>

          <div className="pt-3">
            <div className="nav-link flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#45464d] font-medium hover:bg-slate-100 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]"><Settings /></span>
              <span>System</span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Activity Logs
              </a>
              <a href="#" className="block pl-8 py-1 text-[12px] text-[#76777d] hover:text-[#006591] transition-colors border-l border-slate-200 ml-5">
                Settings
              </a>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
