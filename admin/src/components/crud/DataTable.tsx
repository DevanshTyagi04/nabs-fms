'use client';

import React from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/States';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortingState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  selection?: string[]; // Selected row IDs
  rowKey: (item: T) => string;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  pagination,
  sorting,
  selection,
  rowKey,
  onPaginationChange,
  onSortingChange,
  onSelectionChange,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
}: DataTableProps<T>) {
  const isAllSelected =
    data.length > 0 && selection && selection.length === data.length;

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(rowKey));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange || !selection) return;
    if (selection.includes(id)) {
      onSelectionChange(selection.filter((item) => item !== id));
    } else {
      onSelectionChange([...selection, id]);
    }
  };

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable || !onSortingChange) return;
    if (sorting?.sortBy === key) {
      onSortingChange({
        sortBy: key,
        sortOrder: sorting.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortingChange({
        sortBy: key,
        sortOrder: 'asc',
      });
    }
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-semibold select-none">
              {onSelectionChange && (
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={cn(
                    'p-3 font-semibold uppercase tracking-wider',
                    col.sortable && 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  style={{ width: col.width }}
                >
                  <div className={cn('inline-flex items-center gap-1.5', col.align === 'right' && 'justify-end')}>
                    <span>{col.header}</span>
                    {col.sortable && sorting?.sortBy === col.key && (
                      <Icon
                        name={sorting.sortOrder === 'asc' ? 'chevron-right' : 'chevron-down'}
                        size="xs"
                        className="text-blue-600"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {onSelectionChange && <td className="p-3"><Skeleton className="h-4 w-4 mx-auto" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="p-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="py-12 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = rowKey(item);
                const isSelected = selection?.includes(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors',
                      isSelected && 'bg-blue-50/50 dark:bg-blue-950/30',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {onSelectionChange && (
                      <td className="p-3 text-center" onClick={(e) => toggleSelectRow(id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'p-3 text-slate-700 dark:text-slate-300 font-medium',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">
              {data.length === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1}
            </span> to <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{pagination.total}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPaginationChange && onPaginationChange({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Page {pagination.page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages || loading}
              onClick={() => onPaginationChange && onPaginationChange({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
