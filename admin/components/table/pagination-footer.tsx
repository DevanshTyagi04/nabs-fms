'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PaginationFooter({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationFooterProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="border-t border-[#c6c6cd] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8FAFC]">
      <div className="flex items-center gap-4 text-xs text-[#45464d]">
        <span>
          Showing <span className="font-bold text-[#0b1c30]">{startItem}</span> to{' '}
          <span className="font-bold text-[#0b1c30]">{endItem}</span> of{' '}
          <span className="font-bold text-[#0b1c30]">{totalItems.toLocaleString()}</span> entries
        </span>
        <div className="flex items-center gap-1.5 ml-2">
          <label className="text-[11px] font-medium text-[#76777d]">Rows per page:</label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-white border border-[#c6c6cd] rounded text-xs font-bold text-[#0b1c30] py-0.5 px-1.5 focus:outline-none focus:ring-1 focus:ring-[#006591] cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 border border-[#c6c6cd] rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent text-[#45464d]"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  page === currentPage
                    ? 'bg-[#0b1c30] text-white shadow-sm'
                    : 'text-[#45464d] hover:bg-white border border-transparent hover:border-[#c6c6cd]'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-1 text-xs text-[#76777d]">
                ...
              </span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="p-1.5 border border-[#c6c6cd] rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent text-[#45464d]"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
