import React from 'react';
import DashboardApexChart from './DashboardApexChart';
import { Users } from 'lucide-react';

const COLORS = [
  '#8b6318', '#074e21', '#d97706', '#0134a1',
  '#9333ea', '#0d9488', '#0284c7', '#8b181b',
];

export default function LeadSourcesDonut({ dashboardData }: { dashboardData?: any }) {
  const items: any[] = dashboardData?.charts?.lead_sources ?? [];
  const total   = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const hasData = total > 0;

  const top = items.reduce(
    (current, item) =>
      Number(item.count || 0) > Number(current?.count || 0) ? item : current,
    null,
  );

  const options = {
    labels: items.map((item) => item.lead_source__name),
    colors: COLORS,
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { colors: ['#fff'], width: 5 },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Sources',
              formatter: () => total.toLocaleString(),
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString()} leads` },
    },
  };

  return (
    <div
      id="chart-lead-sources"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">7. Count for Each Lead Source</h4>
          <p className="mt-0.5 text-xs text-slate-600">Acquisition channel share &amp; conversion efficiency</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {items.length} Channels
        </span>
      </div>

      {!hasData ? (
        <div className="flex h-[210px] flex-col items-center justify-center gap-2 text-slate-400">
          <Users className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No lead source data for the selected period</span>
        </div>
      ) : (
        <div className="my-2 flex flex-col items-center justify-center gap-6 py-2 sm:flex-row">
          <div className="h-[210px] w-[210px] shrink-0">
            <DashboardApexChart
              type="donut"
              series={items.map((item) => Number(item.count || 0))}
              options={options}
              height={210}
            />
          </div>
          <div className="grid w-full max-w-xs grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {items.map((item, index) => (
              <div key={item.lead_source__name} className="flex items-center justify-between rounded-md p-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate font-medium text-slate-700">{item.lead_source__name}</span>
                </div>
                <span className="ml-2 font-bold text-slate-900">{Number(item.count || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span>
          Top Volume:{' '}
          <strong className="text-slate-800">{top?.lead_source__name || '—'}</strong>
        </span>
        <span className="font-bold text-emerald-700">{total.toLocaleString()} Leads</span>
      </div>
    </div>
  );
}
