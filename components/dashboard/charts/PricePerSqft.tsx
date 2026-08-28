import React from 'react';
import DashboardApexChart from './DashboardApexChart';
import { BarChart3 } from 'lucide-react';

const SERIES_COLORS = ['#8b181b', '#2563eb', '#d97706', '#16a34a', '#9333ea', '#0284c7', '#0d9488'];

export default function PricePerSqft({ dashboardData }: { dashboardData?: any }) {
  const items: any[] = dashboardData?.charts?.price_per_sqft_over_time ?? [];

  const locationKeys: string[] = items.length > 0
    ? Object.keys(items[0]).filter((k) => k !== 'date')
    : [];

  const dates  = items.map((item) => item.date);
  const series = locationKeys.map((location, idx) => ({
    name:  location,
    data:  items.map((item) => Number(item[location] ?? 0)),
    color: SERIES_COLORS[idx % SERIES_COLORS.length],
  }));

  const hasData = series.some((s) => s.data.some((v) => v > 0));

  const options = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: series.map((s) => s.color),
    stroke: { curve: 'straight' as const, width: 2.5 },
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: series.map((s) => s.color),
      strokeWidth: 2,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: dates,
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
        text: 'Price ($ / sq.ft)',
        style: { color: '#000', fontSize: '12px', fontWeight: 600 },
      },
      labels: {
        formatter: (value: number) => `$${value}`,
        style: { colors: '#000', fontSize: '10px' },
      },
    },
    grid: { borderColor: '#e2e8f0', strokeDashArray: 3 },
    legend: { show: false },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.2, opacityTo: 0.01 } },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (value: number) => `$${value.toLocaleString()} / sq.ft` },
    },
  };

  return (
    <div
      id="chart-price-sqft"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">4. Price per Sq.Ft by Location</h4>
          <p className="mt-0.5 text-xs text-slate-600">Temporal valuation trends across key geographic micro-markets</p>
        </div>
        {locationKeys.length > 0 && (
          <span className="self-start rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 sm:self-auto">
            {locationKeys.length} Locations
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-slate-400">
          <BarChart3 className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No price per sq.ft data available for the selected period</span>
        </div>
      ) : (
        <div className="my-2 h-[250px] w-full">
          <DashboardApexChart
            type="area"
            series={series.map((s) => ({ name: s.name, data: s.data }))}
            options={options}
            height={240}
          />
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {locationKeys.map((loc, idx) => (
            <div key={loc} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }} />
              <span className="font-medium text-slate-700">{loc}</span>
            </div>
          ))}
        </div>
        <span className="text-slate-500">{hasData ? 'Price / sq.ft for selected period' : 'No price data available'}</span>
      </div>
    </div>
  );
}
