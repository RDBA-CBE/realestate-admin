import React from 'react';
import { Building2, X } from 'lucide-react';
import CustomSelect from '@/components/FormFields/CustomSelect.component';

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
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (tab) {
    case 'Today':
      break;
    case 'Last 7 days':
      start.setDate(start.getDate() - 6);
      break;
    case 'This Month':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0); // last day of current month
      break;
    case 'Last Month':
      start.setMonth(start.getMonth() - 1, 1);
      end.setDate(0); // last day of previous month
      break;
    case 'Last 3 Months':
      start.setMonth(start.getMonth() - 3);
      end.setMonth(end.getMonth() + 1, 0); // last day of current month
      break;
    case 'Last 6 Month':
      start.setMonth(start.getMonth() - 6);
      end.setMonth(end.getMonth() + 1, 0); // last day of current month
      break;
    case 'This Year':
      start.setMonth(0, 1);
      end.setMonth(11, 31); // 31 Dec of current year
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
  showDeveloperFilter?: boolean;
  selectedDeveloper?: any;
  onDeveloperChange?: (developer: any) => void;
  developerOptions?: any[];
  onDeveloperLoadMore?: () => void;
}

export default function DateFilterBar({
  activeDateTab,
  startDate,
  endDate,
  onTabClick,
  onCustomDateChange,
  showDeveloperFilter,
  selectedDeveloper,
  onDeveloperChange,
  developerOptions,
  onDeveloperLoadMore,
}: DateFilterBarProps) {
  const isCustom = activeDateTab === 'Custom';

  function handleDateInputClick() {
    if (!isCustom) onTabClick('Custom');
  }

  // Preset tabs show their computed date range; Custom shows the selected dates.
  const presetDateRange = getPresetDateRange(activeDateTab);
  const pillStart = presetDateRange?.[0] ?? ddmmyyyyToIso(startDate);
  const pillEnd = presetDateRange?.[1] ?? ddmmyyyyToIso(endDate);

  return (
    <div
      id="date-filter-bar"
      className="w-full bg-white rounded-xl shadow-sm border border-slate-200/90"
    >
      {/* ── Row 1: period tabs + optional developer filter ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 px-4 pt-3 pb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {DATE_TABS.map((tab) => {
            const isActive = activeDateTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabClick(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-none cursor-pointer whitespace-nowrap ${
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

        {showDeveloperFilter && (
          <div className="flex items-center gap-2 w-full lg:w-72 shrink-0">
            <Building2 className="w-4 h-4 text-[#8b181b] shrink-0" />
            <div className="flex-1">
              <CustomSelect
                placeholder="All Developers"
                value={selectedDeveloper}
                onChange={(dev: any) => onDeveloperChange?.(dev)}
                options={developerOptions || []}
                loadMore={onDeveloperLoadMore}
                isClearable
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100" />

      {/* ── Row 2: date inputs + active-period pill & active developer pill ── */}
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
              onClick={handleDateInputClick}
              onChange={(e) => {
                if (onCustomDateChange) {
                  onCustomDateChange(isoToDdmmyyyy(e.target.value), endDate);
                }
              }}
              className="text-xs font-semibold rounded-md border px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b181b]/30 focus:border-[#8b181b] bg-white border-slate-300 text-slate-800 cursor-pointer"
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
              onClick={handleDateInputClick}
              onChange={(e) => {
                if (onCustomDateChange) {
                  onCustomDateChange(startDate, isoToDdmmyyyy(e.target.value));
                }
              }}
              className="text-xs font-semibold rounded-md border px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b181b]/30 focus:border-[#8b181b] bg-white border-slate-300 text-slate-800 cursor-pointer"
            />
          </div>

          {/* Custom helper text */}
          {isCustom && (
            <span className="text-[10px] text-[#8b181b] font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Select your date range
            </span>
          )}
        </div>

        {/* Right: active period pill + active developer pill */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {showDeveloperFilter && (
            selectedDeveloper?.value ? (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#8b181b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8b181b] shrink-0" />
                <span className="max-w-[180px] truncate" title={selectedDeveloper.label}>
                  Developer: {selectedDeveloper.label}
                </span>
                <button
                  type="button"
                  onClick={() => onDeveloperChange?.(null)}
                  className="ml-1 rounded-full p-0.5 hover:bg-red-200 text-[#8b181b] cursor-pointer"
                  title="Clear developer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>All Developers (Platform View)</span>
              </div>
            )
          )}

          <div className="flex items-center gap-1.5 shrink-0 bg-red-100 px-2 py-0.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-[#8b181b] shrink-0" />
            <span className="text-[11px] font-bold text-[#8b181b]">{activeDateTab}:</span>
            <span className="text-[11px] font-semibold text-black">
              {pillStart} → {pillEnd}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
