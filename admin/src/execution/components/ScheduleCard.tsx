'use client';

import React from 'react';
import { Appointment } from '../core/types';
import { SchedulingEngine } from '../core/Engines';
import { Icon } from '@/components/ui/Icon';

export interface ScheduleCardProps {
  appointment?: Appointment;
}

export function ScheduleCard({ appointment }: ScheduleCardProps) {
  const scheduleText = SchedulingEngine.formatAppointment(appointment);

  return (
    <div className="p-3.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Icon name="calendar" size="sm" />
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
          Confirmed Visit Schedule
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
          {scheduleText}
        </span>
      </div>
    </div>
  );
}
