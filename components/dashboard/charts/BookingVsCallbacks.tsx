import React from 'react';
import DashboardApexChart from './DashboardApexChart';
import { PhoneCall } from 'lucide-react';

export default function BookingVsCallbacks({ dashboardData }: { dashboardData?: any }) {
  const items: any[] = dashboardData?.charts?.inquiries_over_time ?? [];

  const bookingTotal = items.reduce((sum, item) => sum + Number(item.booking_inquiry_count || 0), 0);
  const callTotal    = items.reduce((sum, item) => sum + Number(item.call_inquiry_count    || 0), 0);
  const hasData      = bookingTotal > 0 || callTotal > 0;

  const options = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#d97706', '#0284c7'],
    stroke: { width: [0, 2.5], curve: 'straight' as const },
    plotOptions: { bar: { borderRadius: 3, columnWidth: '28%' } },
    markers: { size: [0, 4], colors: ['#fff'], strokeColors: ['#0284c7'], strokeWidth: 2 },
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
        text: 'Inquiry Count',
        style: { color: '#000', fontSize: '12px', fontWeight: 600 },
      },
      labels: { style: { colors: '#000', fontSize: '10px' } },
    },
    grid: { borderColor: '#e2e8f0', strokeDashArray: 3 },
    legend: { show: false },
    tooltip: { shared: true, intersect: false },
  };

  return (
    <div
      id="chart-booking-vs-callbacks"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">10. Booking Inquiries vs Callbacks</h4>
          <p className="mt-0.5 text-xs text-slate-600">Interaction ratio and appointment scheduling velocity</p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-slate-400">
          <PhoneCall className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">No inquiry data for the selected period</span>
        </div>
      ) : (
        <div className="my-2 h-[250px] w-full">
          <DashboardApexChart
            type="line"
            series={[
              { name: 'Callbacks',             type: 'column', data: items.map((item) => Number(item.call_inquiry_count    || 0)) },
              { name: 'Booking Appointments',  type: 'line',   data: items.map((item) => Number(item.booking_inquiry_count || 0)) },
            ]}
            options={options}
            height={250}
          />
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
            <span className="font-medium text-slate-700">Booking Appointments: {bookingTotal}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#d97706]" />
            <span className="font-medium text-slate-700">Callbacks: {callTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
