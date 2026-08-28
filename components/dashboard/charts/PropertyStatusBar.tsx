import React from 'react';
import DashboardApexChart from './DashboardApexChart';
import { BarChart2 } from 'lucide-react';

const COLORS = ['#074e21', '#f59e0b', '#2563eb', '#8b181b', '#475569', '#9333ea'];

export default function PropertyStatusBar({ dashboardData }: { dashboardData?: any }) {
  const statuses: any[] = dashboardData?.charts?.property_status ?? [];
  const total   = statuses.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const hasData = total > 0;

  const categories = statuses.map((item) =>
    String(item.status).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  );
  const values = statuses.map((item) => Number(item.count || 0));

  const options = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: '55%', distributed: true },
    },
    colors: COLORS,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => (val > 0 ? val : ''),
      style: { fontSize: '11px', fontWeight: 600, colors: ['#fff'] },
    },
    xaxis: {
      categories,
      title: {
        text: 'Number of Units',
        offsetY: 20,
        style: { color: '#000', fontSize: '12px', fontWeight: 600 , },
      },
      labels: { style: { colors: '#000', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: 'Property Status',
        offsetX: 5,
        style: { color: '#000', fontSize: '12px', fontWeight: 600},
      },
      labels: { style: { colors: '#000', fontSize: '11px', fontWeight: 600 } },
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (val: number) => `${val} units` } },
  };

  return (
    <div
      id="chart-property-status"
      className="flex w-full flex-col  rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">2. Count for Property Status</h4>
          <p className="mt-0.5 text-xs text-slate-600">Compliance and operational readiness distribution</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
          {total} Total
        </span>
      </div>

      {!hasData ? (
        <div className="flex h-[330px] flex-col items-center justify-center gap-2 text-slate-400">
          <BarChart2 className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No property status data for the selected period</span>
        </div>
      ) : (
        <div className="my-2 h-[330px] w-full">
          <DashboardApexChart
            type="bar"
            series={[{ name: 'Units', data: values }]}
            options={options}
            height={330}
          />
        </div>
      )}

      {/* <div className="mt-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
        {hasData ? 'Property status data for selected period' : 'No data available'}
      </div> */}
    </div>
  );
}
