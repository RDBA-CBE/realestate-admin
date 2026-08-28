import React from 'react';
import { Heart } from 'lucide-react';

export default function BuyerWishlist({ dashboardData }: { dashboardData?: any }) {
  // API shape: favorites_by_project: [{ project_name: string, total_count: number }]
  const raw: any[] = dashboardData?.charts?.favorites_by_project ?? [];

  // Normalise — only show project_name and total_count as requested
  const projects = raw.map((item: any) => ({
    project_name: item.project_name ?? item.name ?? '—',
    total_count:  Number(item.total_count ?? item.count ?? item.saves ?? 0),
  }));

  const hasData   = projects.length > 0 && projects.some((p) => p.total_count > 0);
  const maxValue  = Math.max(...projects.map((p) => p.total_count), 1);
  const total     = projects.reduce((sum, p) => sum + p.total_count, 0);
  const topProject = projects.reduce(
    (top, item) => (item.total_count > (top?.total_count ?? -1) ? item : top),
    null as any,
  );

  return (
    <div
      id="chart-buyer-save-list"
      className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-[#000]">
            11. Buyer's Wishlists over Projects
          </h4>
          <p className="mt-0.5 text-xs text-slate-600">
            Direct organic purchase intent per development
          </p>
        </div>
        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-[#8b181b]">
          {total.toLocaleString()} Total Saves
        </span>
      </div>

      {/* No data state */}
      {!hasData ? (
        <div className="flex h-[180px] flex-col items-center justify-center gap-2 text-slate-400">
          <Heart className="h-8 w-8 opacity-40" />
          <span className="text-sm font-semibold text-slate-500">No data found</span>
          <span className="text-xs text-slate-400">
            No wishlist saves recorded for the selected period
          </span>
        </div>
      ) : (
        <div className="my-2 space-y-3">
          {projects.map((item, index) => (
            <div key={item.project_name + index} className="group">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-[10px] font-extrabold text-slate-700">
                    #{index + 1}
                  </span>
                  <span
                    className="truncate font-bold text-slate-900 group-hover:text-[#8b181b] transition-colors"
                    title={item.project_name}
                  >
                    {item.project_name}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-extrabold text-slate-900">
                  {item.total_count.toLocaleString()}{' '}
                  <span className="text-[10px] font-normal text-slate-600">saves</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b181b] to-red-500 transition-all duration-500"
                  style={{ width: `${(item.total_count / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span>
          Most saved:{' '}
          <strong className="text-slate-800">
            {topProject?.project_name || '—'}
          </strong>
        </span>
        <span className="font-bold text-slate-800">
          {hasData ? `${projects.length} Projects` : 'No wishlist data'}
        </span>
      </div>
    </div>
  );
}
