import React from 'react';
import DashboardApexChart from './DashboardApexChart';
import { Activity } from 'lucide-react';

const COLORS = ['#8b181b', '#2563eb', '#d97706', '#16a34a', '#9333ea', '#0d9488'];

export default function RegionalRadar({ dashboardData }: { dashboardData?: any }) {
  const items: any[] = dashboardData?.charts?.project_locations ?? [];
  const total   = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const hasData = total > 0;

  const options = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: COLORS,
    stroke: { curve: 'smooth' as const, width: 2.5 },
    markers: {
      size: 5,
      colors: ['#fff'],
      strokeColors: COLORS,
      strokeWidth: 2.5,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: items.map((item) => item.location__name),
      title: {
        text: 'Location',
        style: { color: '#000', fontSize: '12px', fontWeight: 600 },
      },
      labels: { style: { colors: '#000', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: {
        text: 'Project Count',
        style: { color: '#000', fontSize: '12px', fontWeight: 600 },
      },
      labels: { style: { colors: '#000', fontSize: '10px' } },
    },
    grid: { borderColor: '#000', strokeDashArray: 3 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.25, opacityTo: 0.01 } },
    legend: { show: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val: number) => `${val} projects` },
    },
  };

  // One series per location — each gets its own wave colour
  const series = items.map((item, idx) => ({
    name: item.location__name,
    data: items.map((_, i) => (i === idx ? Number(item.count || 0) : 0)),
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div
      id="chart-regional-radar"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">5. Regional Market Wave</h4>
          <p className="mt-0.5 text-xs text-slate-600">Project count across key geographic locations</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {items.length} Key Regions
        </span>
      </div>

      {!hasData ? (
        <div className="flex h-[350px] flex-col items-center justify-center gap-2 text-slate-400">
          <Activity className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No regional location data for the selected period</span>
        </div>
      ) : (
        <div className="my-1 h-[350px] w-full">
          <DashboardApexChart type="area" series={series} options={options} height={350} />
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {items.map((item, idx) => (
            <div key={item.location__name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="font-medium text-slate-700">{item.location__name}</span>
            </div>
          ))}
        </div>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800">
          {total} Total Projects
        </span>
      </div>
    </div>
  );
}
