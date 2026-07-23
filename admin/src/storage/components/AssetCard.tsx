'use client';

import React from 'react';
import { StorageEngine } from '../core/Engines';
import { Asset } from '../core/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface AssetCardProps {
  asset: Asset;
  onPreview?: (asset: Asset) => void;
  onDownload?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
}

export function AssetCard({ asset, onPreview, onDownload, onDelete }: AssetCardProps) {
  const { formattedSize, viewerType } = StorageEngine.evaluateAsset(asset);

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="primary" size="sm">
            {asset.category}
          </Badge>
          <span className="text-[11px] text-slate-400 font-mono">{formattedSize}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block">
            {asset.originalName}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono block truncate">{asset.contentType}</span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {onPreview && viewerType !== 'UNKNOWN' && (
          <Button variant="ghost" size="sm" onClick={() => onPreview(asset)}>
            Preview
          </Button>
        )}
        {onDownload && (
          <Button variant="secondary" size="sm" onClick={() => onDownload(asset)}>
            Download
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(asset)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
