import React from 'react';

interface HeroBannerProps {
  // Raw dashboard API response (called WITHOUT any date filter)
  bannerData?: any;
}

export default function HeroBanner({ bannerData }: HeroBannerProps) {
  // Pull values from cards array — no date filter applied so these are all-time
  const cards: any[] = bannerData?.cards ?? [];

  const getCount = (key: string) =>
    cards.find((c: any) => c.key === key)?.count ?? '—';

  const highDemand    = getCount('high_demand_projects') !== '—'
    ? getCount('high_demand_projects')
    : getCount('high_demand');
  const conversionRaw = getCount('conversion_rate') !== '—'
    ? getCount('conversion_rate')
    : getCount('lead_conversion_rate');

  // Format conversion rate — append % only when it's a real number
  const conversionDisplay = conversionRaw === '—'
    ? '—'
    : typeof conversionRaw === 'string' && conversionRaw.includes('%')
      ? conversionRaw
      : `${Number(conversionRaw).toFixed(2)}%`;

  return (
    <div
      id="hero-banner"
      className="w-full bg-[#0f172a] rounded-2xl px-6 py-5 sm:px-8 sm:py-6 relative overflow-hidden"
    >
      {/* Subtle background grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(255,255,255,0.5) 31px,rgba(255,255,255,0.5) 32px),repeating-linear-gradient(90deg,transparent,transparent 31px,rgba(255,255,255,0.5) 31px,rgba(255,255,255,0.5) 32px)',
        }}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* ── Left: title block ── */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center flex-wrap gap-3">
            <span className="bg-[#8b181b] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded">
              BOOMREALTYS EXECUTIVE DASHBOARD
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live Data Synchronized
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug">
            Boomrealtys Intelligence &amp; Operations Matrix
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Unified control center tracking property inventory, lead acquisition funnels, demand
            forecasting, and revenue pipeline.
          </p>
        </div>

        {/* ── Right: KPI tiles ── */}
        <div className="grid grid-cols-2 gap-3 shrink-0 justify-end">

          {/* High Demand Index */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 text-center hover:bg-amber-500/15 transition-colors">
            <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-1">
              HIGH DEMAND INDEX
            </div>
            <div className="text-xl font-black text-amber-400 tracking-tight leading-none">
              {highDemand}
            </div>
            <div className="text-[10px] text-amber-400/80 font-semibold mt-0.5">Projects</div>
          </div>

          {/* Avg Conversion */}
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 text-center hover:bg-emerald-500/15 transition-colors">
            <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
              AVG CONVERSION
            </div>
            <div className="text-xl font-black text-emerald-400 tracking-tight leading-none">
              {conversionDisplay}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-semibold mt-0.5">Rate</div>
          </div>

        </div>
      </div>
    </div>
  );
}
