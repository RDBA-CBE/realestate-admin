import React from "react";
import DashboardApexChart from "./DashboardApexChart";
export default function PropertyMatrix({
  dashboardData,
}: {
  dashboardData?: any;
}) {
  const items = dashboardData?.charts?.project_stats ?? [];
  const highest = items.reduce(
    (max: any, item: any) =>
      Number(item.inquiry_count || 0) > Number(max?.inquiry_count || 0)
        ? item
        : max,
    null,
  );
  const options = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#8b181b", "#d97706", "#2563eb"],
    stroke: { curve: "smooth", width: [2.5, 2.5, 2] },
    markers: {
      size: 3,
      colors: ["#fff"],
      strokeColors: ["#8b181b", "#d97706", "#2563eb"],
      strokeWidth: 2,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: items.map((item: any) => item.name),
      title: {
        text: "Project",
        style: { color: "#000", fontSize: "12px", fontWeight: 600 },
      },
      labels: { style: { colors: "#000", fontSize: "9px" }, rotate: -35 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: {
        text: "Count",
        style: { color: "#000", fontSize: "12px", fontWeight: 600 },
      },
      labels: { style: { colors: "#000", fontSize: "10px" } },
    },
    grid: { borderColor: "#e2e8f0", strokeDashArray: 3 },
    legend: { show: false },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.32, opacityTo: 0.02 },
    },
    noData: { text: "No project statistics" },
    tooltip: { shared: true, intersect: false },
  };
  return (
    <div
      id="chart-property-matrix"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">
            12. Property, Inquiry &amp; Callbacks Matrix
          </h4>
          <p className="mt-0.5 text-xs text-slate-600">
            Side-by-side operations volume for each active project
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {items.length} Master Developments
        </span>
      </div>
      <div className="my-2 h-[250px] w-full">
        <DashboardApexChart
          type="area"
          series={[
            {
              name: "Booking Inquiries",
              data: items.map((item: any) => Number(item.inquiry_count || 0)),
            },
            {
              name: "Callback Inquiries",
              data: items.map((item: any) => Number(item.callback_count || 0)),
            },
            {
              name: "Property Inventory",
              data: items.map((item: any) => Number(item.property_count || 0)),
            },
          ]}
          options={options}
          height={250}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
        <span>
          Highest booking:{" "}
          <strong className="text-slate-800">
            {highest?.name || "-"} ({highest?.inquiry_count ?? 0})
          </strong>
        </span>
        {/* <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800">
          Live API data
        </span> */}
      </div>
    </div>
  );
}
