import React from 'react';
import { Filter } from 'lucide-react';

const COLORS = ['#8b181b', '#d97706', '#2563eb', '#9333ea' , '#074e21', ];

export default function ConversionFunnel({ dashboardData }: { dashboardData?: any }) {
  // API shape: lead_funnel: [{ name: string, count: number }]
  const steps: any[] = dashboardData?.charts?.lead_funnel ?? [];
  const total    = steps.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const hasData  = total > 0;
  const maxCount = Math.max(...steps.map((item) => Number(item.count || 0)), 1);
  const wonCount = steps.find((item) => item.name === 'Deal Won')?.count ?? 0;

  return (
    <div
      id="chart-conversion-funnel"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">8. Full Lead Conversion Funnel</h4>
          <p className="mt-0.5 text-xs text-slate-600">Step-by-step pipeline velocity and retention rate</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Deal Won</div>
          <div className="text-sm font-extrabold text-emerald-600">{wonCount}</div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-[180px] flex-col items-center justify-center gap-2 text-slate-400">
          <Filter className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No funnel data for the selected period</span>
        </div>
      ) : (
        <div className="my-2 space-y-3">
          {steps.map((step, index) => (
            <div key={step.name} className="group">
              <div className="mb-1 flex items-start justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {index + 1}
                  </span>
                  <span className="font-bold leading-tight text-slate-900">{step.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">
                  {Number(step.count || 0).toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(Number(step.count || 0) / maxCount) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span>{hasData ? 'Lead funnel data for selected period' : 'No data available'}</span>
        <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          {wonCount} Closures Verified
        </span>
      </div>
    </div>
  );
}
