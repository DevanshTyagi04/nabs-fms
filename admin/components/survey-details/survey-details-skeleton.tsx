'use client';

import React from 'react';
import { TopHeader } from '@/components/dashboard/top-header';
import { Sidebar } from '@/components/dashboard/sidebar';

export function SurveyDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopHeader />
      <div className="flex min-h-screen pt-14">
        <Sidebar />
        <main className="lg:ml-60 flex-1 pt-6 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 animate-pulse space-y-3 shadow-xs">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
          </div>

          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left Content Skeleton */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Summary Shimmer */}
              <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 animate-pulse space-y-4 shadow-xs">
                <div className="h-4 bg-slate-200 rounded w-1/6" />
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-12 bg-slate-100 rounded" />
                  <div className="h-12 bg-slate-100 rounded" />
                  <div className="h-12 bg-slate-100 rounded" />
                  <div className="h-12 bg-slate-100 rounded" />
                </div>
              </div>

              {/* Findings Shimmer */}
              <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 animate-pulse space-y-4 shadow-xs">
                <div className="h-5 bg-slate-200 rounded w-1/4" />
                <div className="h-32 bg-slate-100 rounded" />
                <div className="h-32 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 animate-pulse space-y-4 shadow-xs">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-24 bg-slate-100 rounded" />
              </div>
              <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 animate-pulse space-y-4 shadow-xs">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-24 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
