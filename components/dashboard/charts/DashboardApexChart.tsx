import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DashboardApexChartProps {
  type: 'area' | 'bar' | 'donut' | 'line' | 'radar' | 'rangeBar';
  series: any;
  options: any;
  height: number;
}

export default function DashboardApexChart({ type, series, options, height }: DashboardApexChartProps) {
  return <ReactApexChart type={type} series={series} options={options} height={height} width="100%" />;
}