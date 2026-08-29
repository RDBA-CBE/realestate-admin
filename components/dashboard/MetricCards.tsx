import React from 'react';
import {
  Building2,
  Tag,
  Key,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Calendar,
  PhoneCall,
  Trophy,
  XCircle,
  RefreshCw,
  TrendingUp,
  Flame,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { METRIC_CARDS } from './data';
import type { MetricCardId } from './types';

interface MetricCardsProps {
  selectedMetricId: MetricCardId;
  onSelect: (id: MetricCardId) => void;
  dashboardData?: any;
}

function getMetricIcon(index: number) {
  switch (index) {
    case 1:  return <Building2 className="w-3.5 h-3.5 text-red-700" />;
    case 2:  return <Tag className="w-3.5 h-3.5 text-red-700" />;
    case 3:  return <Key className="w-3.5 h-3.5 text-red-700" />;
    case 4:  return <CheckCircle2 className="w-3.5 h-3.5 text-red-700" />;
    case 5:  return <Clock className="w-3.5 h-3.5 text-red-700" />;
    case 6:  return <Layers className="w-3.5 h-3.5 text-red-700" />;
    case 7:  return <Users className="w-3.5 h-3.5 text-red-700" />;
    case 8:  return <Calendar className="w-3.5 h-3.5 text-red-700" />;
    case 9:  return <PhoneCall className="w-3.5 h-3.5 text-red-700" />;
    case 10: return <Trophy className="w-3.5 h-3.5 text-red-700" />;
    case 11: return <XCircle className="w-3.5 h-3.5 text-red-700" />;
    case 12: return <RefreshCw className="w-3.5 h-3.5 text-red-700" />;
    case 13: return <TrendingUp className="w-3.5 h-3.5 text-red-700" />;
    case 14: return <Flame className="w-3.5 h-3.5 text-red-500" />;
    case 15: return <AlertTriangle className="w-3.5 h-3.5 text-red-700" />;
    default: return <Tag className="w-3.5 h-3.5 text-red-700" />;
  }
}

export default function MetricCards({ selectedMetricId, onSelect, dashboardData }: MetricCardsProps) {
  const apiCardCounts = Object.fromEntries(
    (dashboardData?.cards ?? []).map((item: any) => [item.key, item.count]),
  );
  const cards = METRIC_CARDS.map((card) => {
    const apiKey = card.id === 'pending_properties' ? 'unapproved_properties'
      : card.id === 'total_lead_list' ? 'total_leads'
      : card.id === 'conversion_rate' ? 'lead_conversion_rate'
      : card.id;
    return { ...card, value: apiCardCounts[apiKey] ?? card.value };
  });
  return (
    <div
      id="operational-metrics-section"
      // className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-dred"></span>
          <h2 className="text-sm sm:text-base font-bold text-[#000] tracking-tight">
            Operational Metrics (15 Core Cards)
          </h2>
        </div>
        <span className="text-xs text-slate-600 hidden sm:inline">
          Click any card to inspect active drill-down records
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  xl:grid-cols-6 gap-3">
        {cards.map((card) => {
          const isSelected = selectedMetricId === card.id;
          const isHighlightCard = card.highlight;

          return (
            <div
              key={card.id}
              id={`metric-card-${card.id}`}
              onClick={() => onSelect(card.id)}
              className={`relative rounded-xl border-2 p-3.5 transition-none cursor-pointer flex flex-col justify-between select-none ${
                isSelected
                  ? 'bg-red-50/40 border-[#8b181b] shadow-md ring-2 ring-red-600/20'
                  : isHighlightCard
                  ? 'bg-white border-red-300 hover:border-red-500 hover:shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm'
              }`}
            >
              {/* Category & Icon */}
              <div className="flex items-center justify-between gap-1 text-[12px] font-bold text-black uppercase tracking-wider mb-1">
                <span className={isSelected || isHighlightCard ? 'text-red-700' : ''}>
                  {/* {card.index} {card.category} */} {card.label}
                </span>
                <span className='p-2 bg-red-100 rounded-md'>{getMetricIcon(card.index)}</span>
              </div>

              {/* Title */}
              {/* <div
                className="text-xs font-bold text-slate-800 line-clamp-1 mb-1.5"
                title={card.label}
              >
                {card.label}
              </div> */}



              {/* Value */}
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-2xl font-black text-[#000] tracking-tight">
                  {card.value}{card.id === 'conversion_rate' ? '%' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 ">

              {/* Subtitle */}
              <div className="text-[11px] text-slate-600 truncate mb-2" title={card.sub}>
                {card.sub}
              </div>

              {isSelected && (
                  <span className="-mt-3 bg-[#8b181b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                    Active Table ↓
                  </span>
                )}
             </div>

              {/* Footer */}
              {/* <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 mt-auto">
                <div
                  className={`flex items-center text-[11px] font-bold ${
                    card.isPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {card.isPositive ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                  )}
                  <span>{card.change}</span>
                </div>

                {isSelected && (
                  <span className="bg-[#8b181b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                    Active Table ↓
                  </span>
                )}
              </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
