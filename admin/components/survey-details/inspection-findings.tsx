'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { FindingCard } from './finding-card';
import { TableEmptyState } from '@/components/table/table-empty-state';
import { SurveyItem } from '@/lib/types/surveys.types';

interface InspectionFindingsProps {
  items?: SurveyItem[];
}

export function InspectionFindings({ items = [] }: InspectionFindingsProps) {
  // Client-side computation of severity summary
  const severityCounts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  items.forEach((item) => {
    const sev = item.severity?.toUpperCase() as keyof typeof severityCounts;
    if (sev && severityCounts[sev] !== undefined) {
      severityCounts[sev]++;
    }
  });

  // Group items by Area dynamically
  const groupedAreas: Record<string, SurveyItem[]> = {};
  items.forEach((item) => {
    const areaName = item.area || 'General Findings';
    if (!groupedAreas[areaName]) {
      groupedAreas[areaName] = [];
    }
    groupedAreas[areaName].push(item);
  });

  const areaKeys = Object.keys(groupedAreas);

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
      {/* Header bar with computed Findings Summary */}
      <div className="px-6 py-4 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Inspection Findings ({items.length})
        </h2>

        <div className="flex items-center gap-4 text-[11px] font-mono font-bold flex-wrap">
          <div className="flex items-center gap-1.5 text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>CRITICAL: {severityCounts.CRITICAL}</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-700">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>HIGH: {severityCounts.HIGH}</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-700">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span>MEDIUM: {severityCounts.MEDIUM}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>LOW: {severityCounts.LOW}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 space-y-8">
        {items.length === 0 ? (
          <TableEmptyState
            title="No Inspection Findings"
            description="This technical survey currently has no specific inspection finding items logged."
          />
        ) : (
          areaKeys.map((areaName) => (
            <div key={areaName} className="space-y-4">
              <div className="flex items-center gap-2 text-[#45464d] border-b border-[#c6c6cd] pb-2">
                <Layers className="w-4 h-4 text-[#006591]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b1c30]">
                  Section: {areaName}
                </h3>
              </div>

              <div className="space-y-4">
                {groupedAreas[areaName].map((item) => (
                  <FindingCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
