'use client';

import React, { useState } from 'react';
import { EntityFormDialog } from '@/components/crud/EntityFormDialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField, FormLabel } from '@/components/forms/FormField';
import { CreateServiceRequestDto, ServiceRequestPriority } from '../types';

export interface ServiceRequestFormDialogProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: (dto: CreateServiceRequestDto) => Promise<void>;
}

export function ServiceRequestFormDialog({
  open,
  onClose,
  loading = false,
  error,
  onSubmit,
}: ServiceRequestFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HVAC Electrical');
  const [priority, setPriority] = useState<ServiceRequestPriority>('MEDIUM');
  const [serviceAddress, setServiceAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      description,
      category,
      priority,
      serviceAddress,
    });
    setTitle('');
    setDescription('');
    setServiceAddress('');
  };

  return (
    <EntityFormDialog
      open={open}
      onClose={onClose}
      title="Create New Service Request"
      description="Submit a new field service ticket for customer account"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Submit Ticket"
    >
      <div className="space-y-3">
        <Input
          label="Request Title"
          placeholder="e.g. HVAC Compressor Unit Tripping Breaker"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField>
            <FormLabel required>Service Category</FormLabel>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              disabled={loading}
            >
              <option value="HVAC Electrical">HVAC Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical Safety">Electrical Safety</option>
              <option value="General Maintenance">General Maintenance</option>
            </select>
          </FormField>

          <FormField>
            <FormLabel required>Priority Level</FormLabel>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ServiceRequestPriority)}
              className="w-full h-10 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              disabled={loading}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </FormField>
        </div>

        <Input
          label="Property Service Address"
          placeholder="742 Evergreen Terrace, Sector 4"
          value={serviceAddress}
          onChange={(e) => setServiceAddress(e.target.value)}
          disabled={loading}
        />

        <Textarea
          label="Detailed Problem Description"
          placeholder="Describe symptoms, equipment tag numbers, and access notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={loading}
        />
      </div>
    </EntityFormDialog>
  );
}
