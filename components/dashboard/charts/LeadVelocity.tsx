import React from 'react';
import DashboardApexChart from './DashboardApexChart';
import { TrendingUp } from 'lucide-react';

export default function LeadVelocity({ dashboardData }: { dashboardData?: any }) {
  const items: any[] = dashboardData?.charts?.leads_over_time ?? [];
  const total   = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const hasData = total > 0;

  const peak = items.reduce(
    (max, item) => Number(item.count || 0) > Number(max?.count || 0) ? item : max,
    null,
  );

  const options = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#8b181b'],
    stroke: { curve: 'straight' as const, width: 2.5 },
    markers: { size: 4, colors: ['#fff'], strokeColors: ['#8b181b'], strokeWidth: 2 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: items.map((item) => item.date),
      title: {
        text: 'Period',
        style: { color: '#000', fontSize: '12px', fontWeight: 600 },
      },
      labels: { style: { colors: '#000', fontSize: '10px' }, rotate: -35 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: {
        text: 'Lead Count',
        style: { color: '#000', fontSize: '12px', fontWeight: 600 },
      },
      labels: { style: { colors: '#000', fontSize: '10px' } },
    },
    grid: { borderColor: '#000', strokeDashArray: 3 },
    legend: { show: false },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
    tooltip: { y: { formatter: (value: number) => `${value} leads` } },
  };

  return (
    <div
      id="chart-lead-velocity"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">9. Lead Count Velocity</h4>
          <p className="mt-0.5 text-xs text-slate-600">Temporal volume tracking based on weeks</p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-slate-400">
          <TrendingUp className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No lead velocity data for the selected period</span>
        </div>
      ) : (
        <div className="my-2 h-[250px] w-full">
          <DashboardApexChart
            type="area"
            series={[{ name: 'Leads', data: items.map((item) => Number(item.count || 0)) }]}
            options={options}
            height={250}
          />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span>
          Peak period:{' '}
          <strong className="text-slate-800">
            {peak ? `${peak.date} (${peak.count} Leads)` : '—'}
          </strong>
        </span>
        <span className="font-bold text-emerald-700">{hasData ? `${total} Total Leads` : 'No data'}</span>
      </div>
    </div>
  );
}
