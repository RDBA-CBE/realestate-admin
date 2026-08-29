import React from 'react';
import DashboardApexChart from './DashboardApexChart';
import { PieChart } from 'lucide-react';

const COLORS = [
   '#0134a1',  '#074e21', '#9333ea','#8b6318',
  '#015985', '#0d9488','#d97706', '#7e033a', '#8b181b',
];

export default function PropertyTypeDonut({ dashboardData }: { dashboardData?: any }) {
  const items: any[] = dashboardData?.charts?.property_types ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const hasData = total > 0;

  const options = {
    labels: items.map((item) => item.property_type__name),
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
              label: 'Total Units',
              formatter: () => total.toLocaleString(),
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString()} units` },
    },
  };

  return (
    <div
      id="chart-property-type"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">1. Count for Each Property Type</h4>
          <p className="mt-0.5 text-xs text-slate-600">Portfolio asset distribution across sectors</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {items.length} Categories
        </span>
      </div>

      {!hasData ? (
        <div className="flex h-[210px] flex-col items-center justify-center gap-2 text-slate-400">
          <PieChart className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No property type data for the selected period</span>
        </div>
      ) : (
        <div className="my-2 flex flex-col items-center justify-center gap-10 py-2 sm:flex-row">
          <div className="h-[210px] w-[250px] shrink-0">
            <DashboardApexChart
              type="donut"
              series={items.map((item) => Number(item.count || 0))}
              options={options}
              height={210}
            />
          </div>
          <div className="grid w-full max-w-xs grid-cols-1 gap-2 text-xs">
            {items.map((item, index) => (
              <div key={item.property_type__name} className="flex items-center justify-between rounded-md p-1.5">
                <div className="flex items-center gap-2 truncate">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate font-medium text-slate-700">{item.property_type__name}</span>
                </div>
                <span className="font-bold text-[#000]">{Number(item.count || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span>{hasData ? 'Property types in selected period' : 'No data available'}</span>
        <span className="font-bold text-emerald-700">{total.toLocaleString()} Units Cataloged</span>
      </div>
    </div>
  );
}
