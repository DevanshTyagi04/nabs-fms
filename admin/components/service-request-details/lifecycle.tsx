'use client';

import React from 'react';
import { Check, Flag } from 'lucide-react';

interface LifecycleProps {
  status: string;
}

const LIFECYCLE_STEPS = [
  { id: 'request', label: 'Request', statuses: ['CREATED', 'ASSIGNED'] },
  { id: 'survey', label: 'Survey', statuses: ['SURVEY_PENDING', 'SURVEY_SUBMITTED', 'SURVEY_APPROVED'] },
  {
    id: 'estimate',
    label: 'Estimate',
    statuses: ['ESTIMATE_CREATED', 'AWAITING_APPROVAL', 'ADVANCE_PENDING', 'ADVANCE_RECEIVED'],
  },
  {
    id: 'execution',
    label: 'Execution',
    statuses: ['SCHEDULED', 'IN_PROGRESS', 'WORK_COMPLETED', 'QUALITY_CHECK'],
  },
  { id: 'payment', label: 'Payment', statuses: ['FINAL_PAYMENT_PENDING'] },
  { id: 'completed', label: 'Completed', statuses: ['COMPLETED', 'ARCHIVED'] },
];

export function Lifecycle({ status }: LifecycleProps) {
  // Determine current active step index based on status
  let activeStepIndex = 0;
  for (let i = 0; i < LIFECYCLE_STEPS.length; i++) {
    if (LIFECYCLE_STEPS[i].statuses.includes(status)) {
      activeStepIndex = i;
      break;
    }
  }

  // Handle cancelled state
  const isCancelled = status === 'CANCELLED';

  return (
    <section className="bg-white border border-[#c6c6cd] rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between relative px-2">
        {/* Background Connector Line */}
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-[#c6c6cd] z-0" />

        {LIFECYCLE_STEPS.map((step, idx) => {
          const isCompleted = !isCancelled && idx < activeStepIndex;
          const isActive = !isCancelled && idx === activeStepIndex;
          const isPending = isCancelled || idx > activeStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5 text-center">
              {isCompleted ? (
                <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4" />
                </div>
              ) : isActive ? (
                <div className="w-8 h-8 rounded-full border-2 border-[#000000] bg-white flex items-center justify-center shadow-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#000000] animate-pulse" />
                </div>
              ) : idx === LIFECYCLE_STEPS.length - 1 ? (
                <div className="w-8 h-8 rounded-full border-2 border-[#c6c6cd] bg-white text-[#76777d] flex items-center justify-center opacity-50">
                  <Flag className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-[#c6c6cd] bg-white text-[#76777d] flex items-center justify-center opacity-50">
                  <span className="text-[11px] font-mono font-bold">0{idx + 1}</span>
                </div>
              )}

              <span
                className={`text-xs font-semibold ${
                  isActive
                    ? 'text-[#0b1c30] font-bold'
                    : isCompleted
                    ? 'text-[#0b1c30]'
                    : 'text-[#76777d]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
