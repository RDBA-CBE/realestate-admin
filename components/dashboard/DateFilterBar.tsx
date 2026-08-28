import React from 'react';

const DATE_TABS = [

  'Today',
  'Last 7 days',
  'This Month',
  'Last Month',
  'Last 3 Months',
  'Last 6 Month',
  'This Year',
  'Custom',
];

// Convert "DD-MM-YYYY" ↔ "YYYY-MM-DD" for the native date input
function ddmmyyyyToIso(val: any): any {
  if (!val) return '';
  // already ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const [d, m, y] = val.split('-');
  return `${y}-${m}-${d}`;
}

function isoToDdmmyyyy(val: any): any {
  if (!val) return '';
  // already DD-MM-YYYY?
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) return val;
  const [y, m, d] = val?.split('-');
  return `${d}-${m}-${y}`;
}

function formatDateForPill(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPresetDateRange(tab: string): [string, string] | null {
  const end = new Date();
  const start = new Date(end);

  switch (tab) {
    case 'Today':
      break;
    case 'Last 7 days':
      start.setDate(start.getDate() - 6);
      break;
    case 'This Month':
      start.setDate(1);
      break;
    case 'Last Month':
      start.setMonth(start.getMonth() - 1, 1);
      end.setDate(0);
      break;
    case 'Last 3 Months':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'Last 6 Month':
      start.setMonth(start.getMonth() - 6);
      break;
    case 'This Year':
      start.setMonth(0, 1);
      break;
    default:
      return null;
  }

  return [formatDateForPill(start), formatDateForPill(end)];
}

interface DateFilterBarProps {
  activeDateTab: string;
  startDate: string; // stored as DD-MM-YYYY
  endDate: string;   // stored as DD-MM-YYYY
  onTabClick: (tab: string) => void;
  onCustomDateChange?: (start: string, end: string) => void; // emits DD-MM-YYYY
}

export default function DateFilterBar({
  activeDateTab,
  startDate,
  endDate,
  onTabClick,
  onCustomDateChange,
}: DateFilterBarProps) {
  const isCustom = activeDateTab === 'Custom';

  // Preset tabs show their computed date range; Custom shows the selected dates.
  const presetDateRange = getPresetDateRange(activeDateTab);
  const pillStart = presetDateRange?.[0] ?? ddmmyyyyToIso(startDate);
  const pillEnd = presetDateRange?.[1] ?? ddmmyyyyToIso(endDate);

  return (
    <div
      id="date-filter-bar"
      className="w-full bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden"
    >
      {/* ── Row 1: period tabs ── */}
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-2.5 flex-wrap">
        {DATE_TABS.map((tab) => {
          const isActive = activeDateTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabClick(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#8b181b] text-white shadow-sm '
                  : 'text-[#000] bg-slate-100'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100" />

      {/* ── Row 2: date inputs + active-period pill ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2.5">
        {/* Left: date pickers */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Start date */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#000] whitespace-nowrap">
              Start Date (From):
            </span>
            <input
              type="date"
              value={ddmmyyyyToIso(startDate)}
              disabled={!isCustom}
              onChange={(e) => {
                if (isCustom && onCustomDateChange) {
                  onCustomDateChange(isoToDdmmyyyy(e.target.value), endDate);
                }
              }}
              className={`text-xs font-semibold rounded-md border px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b181b]/30 focus:border-[#8b181b] ${
                isCustom
                  ? 'bg-white border-slate-300 text-slate-800 cursor-pointer'
                  : 'bg-slate-50 border-slate-200 text-slate-600 cursor-default'
              }`}
            />
          </div>

          {/* Arrow separator */}
          <span className="text-slate-400 font-bold text-sm select-none">→</span>

          {/* End date */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#000] whitespace-nowrap">
              End Date (To):
            </span>
            <input
              type="date"
              value={ddmmyyyyToIso(endDate)}
              disabled={!isCustom}
              onChange={(e) => {
                if (isCustom && onCustomDateChange) {
                  onCustomDateChange(startDate, isoToDdmmyyyy(e.target.value));
                }
              }}
              className={`text-xs font-semibold rounded-md border px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b181b]/30 focus:border-[#8b181b] ${
                isCustom
                  ? 'bg-white border-slate-300 text-slate-800 cursor-pointer'
                  : 'bg-slate-50 border-slate-200 text-slate-600 cursor-default'
              }`}
            />
          </div>

          {/* Custom helper text */}
          {isCustom && (
            <span className="text-[10px] text-[#8b181b] font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Select your date range
            </span>
          )}
        </div>

        {/* Right: active period pill */}
        <div className="flex items-center gap-1.5 shrink-0 bg-red-100 px-2 py-0.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-[#8b181b] shrink-0" />
          <span className="text-[11px] font-bold text-[#8b181b]">{activeDateTab}:</span>
          <span className="text-[11px] font-semibold text-black">
            {pillStart} → {pillEnd}
          </span>
        </div>
      </div>
    </div>
  );
}
