'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormField, FormLabel } from '@/components/forms/FormField';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

export interface AssigneeOption {
  id: string;
  name: string;
  subtitle?: string;
}

export interface AssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  assignees: AssigneeOption[];
  loading?: boolean;
  onAssign: (assigneeId: string, notes?: string) => Promise<void>;
}

export function AssignmentDialog({
  open,
  onClose,
  title = 'Assign Resource / Vendor',
  assignees,
  loading = false,
  onAssign,
}: AssignmentDialogProps) {
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    await onAssign(selectedId, notes);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} description="Select an eligible verified resource for assignment">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <FormField>
          <FormLabel required>Select Assignee</FormLabel>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-10 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            required
          >
            <option value="">Select Assignee...</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.subtitle ? `(${a.subtitle})` : ''}
              </option>
            ))}
          </select>
        </FormField>

        <FormField>
          <FormLabel>Assignment Instructions / Notes</FormLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions or notes..."
            rows={3}
            className="w-full p-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} disabled={!selectedId}>
            Assign Resource
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function WorkflowActionsBar({
  currentStatus,
  onAction,
}: {
  currentStatus: string;
  onAction: (targetStatus: string) => void;
}) {
  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      {currentStatus === 'CREATED' && (
        <Button variant="primary" size="sm" onClick={() => onAction('ASSIGNED')}>
          Assign Vendor
        </Button>
      )}
      {currentStatus === 'ASSIGNED' && (
        <Button variant="primary" size="sm" onClick={() => onAction('IN_PROGRESS')}>
          Start Progress
        </Button>
      )}
      {currentStatus === 'IN_PROGRESS' && (
        <Button variant="primary" size="sm" onClick={() => onAction('COMPLETED')}>
          Mark Completed
        </Button>
      )}
      <Button variant="danger" size="sm" onClick={() => onAction('CANCELLED')}>
        Cancel Request
      </Button>
    </div>
  );
}

export function WorkflowSummary({
  ticketNumber,
  title,
  category,
  priority,
  status,
}: {
  ticketNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">{ticketNumber}</span>
        <WorkflowStatusBadge status={status} />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Category: <strong className="text-slate-800 dark:text-slate-200">{category}</strong></span>
        <span>•</span>
        <span>Priority: <strong className="text-slate-800 dark:text-slate-200">{priority}</strong></span>
      </div>
    </div>
  );
}
