'use client';

import React from 'react';
import Link from 'next/link';
import { SurveySummary } from '@/lib/types/service-requests.types';

interface VersionHistoryBarProps {
  versions: SurveySummary[];
  currentSurveyId: string;
  currentVersion: number;
  isLoading?: boolean;
}

export function VersionHistoryBar({
  versions,
  currentSurveyId,
  currentVersion,
  isLoading = false,
}: VersionHistoryBarProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-1">
        <span className="text-xs text-[#76777d] font-bold">REVISION HISTORY:</span>
        <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
      </div>
    );
  }

  // Sort versions by version number ascending
  const sortedVersions = [...versions].sort((a, b) => {
    const vA = (a as any).version || 0;
    const vB = (b as any).version || 0;
    return vA - vB;
  });

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-[#45464d] font-bold uppercase tracking-wider">
        Revision History:
      </span>
      <div className="flex gap-2 flex-wrap">
        {sortedVersions.map((ver, idx) => {
          const verNumber = (ver as any).version || idx + 1;
          const isCurrent = ver.id === currentSurveyId || verNumber === currentVersion;

          if (isCurrent) {
            return (
              <span
                key={ver.id}
                className="px-3 py-1 rounded-full bg-[#000000] text-white text-[11px] font-mono font-bold shadow-2xs"
              >
                v{verNumber} - Active
              </span>
            );
          }

          return (
            <Link
              key={ver.id}
              href={`/technical-surveys/${ver.id}`}
              className="px-3 py-1 rounded-full bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#004c6e] text-[11px] font-mono font-bold transition-colors"
            >
              v{verNumber}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
