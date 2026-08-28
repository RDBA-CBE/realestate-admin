import React from 'react';
import { DataTable } from 'mantine-datatable';
import { Loader2, AlertCircle, Database, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { MetricCardItem } from './types';

interface DrillDownTableProps {
  selectedMetric: MetricCardItem;
  records: any[];
  columns: any[];
  totalCount: number;
  page: number;
  onPageChange: (p: number) => void;
  pageSize: number;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  activeFilters: { label: string; onRemove: () => void }[];
  filterList: () => JSX.Element;
}

export default function DrillDownTable({
  selectedMetric,
  records,
  columns,
  totalCount,
  page,
  onPageChange,
  pageSize,
  loading,
  error,
  onClose,
  activeFilters,
  filterList,
}: DrillDownTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Build up to 5 page-number pills, centred around the current page
  function getPageNumbers(): number[] {
    const range: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else if (page <= 3) {
      range.push(1, 2, 3, 4, 5);
    } else if (page >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) range.push(i);
    } else {
      for (let i = page - 2; i <= page + 2; i++) range.push(i);
    }
    return range;
  }

  const showingFrom = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingTo   = Math.min(page * pageSize, totalCount);

  return (
    <div
      id="drill-down-table-container"
      className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-2.5 flex-wrap mb-4">
        <span className="h-2 w-2 rounded-full bg-dred" />
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {selectedMetric.label}
        </h3>

        {loading ? (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading…
          </span>
        ) : (
          <span className="bg-red-50 text-[#8b181b] border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {totalCount.toLocaleString()} records
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close drill-down table"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>

       

       
        <p className="w-full text-xs text-slate-500 mt-0.5">
          {selectedMetric.filterDescription}
        </p>
      </div>

       {filterList()}

        {activeFilters.length > 0 && (
          <div className="flex w-full flex-wrap items-center gap-2 mb-2.5">
            {activeFilters.map((filter) => (
              <span key={filter.label} className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 text-[11px] font-semibold text-[#8b181b]">
                {filter.label}
                <button type="button" onClick={filter.onRemove} aria-label={`Remove ${filter.label}`} title="Remove filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}


      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex flex-col items-center gap-2 py-8 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span className="text-sm font-semibold">Failed to load data</span>
          <span className="text-xs text-slate-500">{error}</span>
        </div>
      )}

      {/* ── Empty — no API card ──────────────────────────────────────────────── */}
      {!loading && !error && records.length === 0 && columns.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
          <Database className="w-6 h-6" />
          <span className="text-sm font-semibold text-slate-600">
            No data available for this metric
          </span>
        </div>
      )}

      {/* ── DataTable ───────────────────────────────────────────────────────── */}
      {!error && columns.length > 0 && (
        <div className="mt-2 datatables pagination-padding [&_.mantine-datatable-table-container]:overflow-visible [&_table]:overflow-visible">
          <DataTable
            className="table-responsive !border-none"
            records={records}
            columns={columns}
            fetching={loading}
            /* mantine built-in pagination disabled — custom bar below */
            totalRecords={undefined}
            recordsPerPage={pageSize}
            page={undefined}
            onPageChange={() => {}}
            minHeight={200}
            highlightOnHover
            withBorder
            borderRadius="sm"
            striped
            rowClassName={(_, index) =>
              index % 2 === 0
                ? 'bg-white dark:bg-gray-900'
                : 'bg-gray-50 dark:bg-gray-800'
            }
          />
        </div>
      )}

      {/* ── Custom Pagination ───────────────────────────────────────────────── */}
      {!error && columns.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-600">

          {/* Left: showing X – Y of total */}
          <div>
            {!loading && totalCount > 0 && (
              <>
                Showing{' '}
                <span className="font-semibold text-slate-800">{showingFrom}</span>
                {' '}to{' '}
                <span className="font-semibold text-slate-800">{showingTo}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-800">{totalCount.toLocaleString()}</span>
                {' '}total records
              </>
            )}
          </div>

          {/* Right: prev · page pills · next */}
          <div className="flex items-center gap-1.5">

            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={loading}
                className={`min-w-[28px] h-7 rounded-md border text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  p === page
                    ? 'bg-[#8b181b] text-white border-[#8b181b]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
