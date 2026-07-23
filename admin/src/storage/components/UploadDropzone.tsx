'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface UploadDropzoneProps {
  category?: string;
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export function UploadDropzone({ category = 'attachments', onFileSelect, loading }: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`p-6 rounded-lg border-2 border-dashed text-center transition-all ${
        dragOver
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
          : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
      }`}
    >
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
          Upload Platform File or Document ({category})
        </span>
        <p className="text-[11px] text-slate-500">Drag & drop files here, or click to choose from system storage.</p>
        <div className="pt-2 flex justify-center">
          <label>
            <input type="file" className="hidden" onChange={handleFileChange} disabled={loading} />
            <Button variant="primary" size="sm" type="button" disabled={loading} onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
              if (input) input.click();
            }}>
              {loading ? 'Uploading File...' : 'Select File'}
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}
