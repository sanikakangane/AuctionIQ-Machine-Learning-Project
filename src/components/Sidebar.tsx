import React from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  Database,
  GitCompare,
  History,
  Info,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'predict'
  | 'analytics'
  | 'comparison'
  | 'history'
  | 'dataset'
  | 'about';

export interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'predict', label: 'Predict Price', icon: Calculator },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'comparison', label: 'Model Comparison', icon: GitCompare },
  { id: 'history', label: 'Prediction History', icon: History },
  { id: 'dataset', label: 'Dataset Information', icon: Database },
  { id: 'about', label: 'About', icon: Info },
];

const NAV_ACCENT_TEXT: Record<PageId, string> = {
  dashboard: 'text-[#C6FF00]',
  predict: 'text-[#FFB800]',
  analytics: 'text-[#22D3EE]',
  comparison: 'text-[#00E59B]',
  history: 'text-[#FF3B5C]',
  dataset: 'text-[#A78BFA]',
  about: 'text-[#F472B6]',
};

const NAV_ACTIVE_BG: Record<PageId, string> = {
  dashboard: 'bg-[#0B39E8] text-white shadow-[0_8px_20px_rgba(11,57,232,0.35)]',
  predict: 'bg-[#0B39E8] text-white shadow-[0_8px_20px_rgba(11,57,232,0.35)]',
  analytics: 'bg-[#0E7490] text-white shadow-[0_8px_20px_rgba(14,116,144,0.35)]',
  comparison: 'bg-[#047857] text-white shadow-[0_8px_20px_rgba(4,120,87,0.35)]',
  history: 'bg-[#BE123C] text-white shadow-[0_8px_20px_rgba(190,18,60,0.35)]',
  dataset: 'bg-[#5B21B6] text-white shadow-[0_8px_20px_rgba(91,33,182,0.35)]',
  about: 'bg-[#9D174D] text-white shadow-[0_8px_20px_rgba(157,23,77,0.35)]',
};

export const BrandStarIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 1L14.8 9.2L23 12L14.8 14.8L12 23L9.2 14.8L1 12L9.2 9.2L12 1Z" />
  </svg>
);

export const AuctionIQLogo: React.FC<{ className?: string }> = ({
  className = 'h-7 w-7',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Crease hairline */}
    <line
      x1="4"
      y1="26.5"
      x2="28"
      y2="26.5"
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Three stepped cricket stumps evoking wicket & rising auction bars */}
    <rect x="6.5" y="13" width="2.8" height="13.5" rx="1.4" fill="currentColor" />
    <rect x="12.5" y="10" width="2.8" height="16.5" rx="1.4" fill="currentColor" />
    <rect x="18.5" y="11.5" width="2.8" height="15" rx="1.4" fill="currentColor" />
    {/* Neon lime bails crowning the stumps */}
    <rect x="6.2" y="8.2" width="6.2" height="2.2" rx="1.1" fill="#C6FF00" />
    <rect x="13.4" y="8.2" width="7.8" height="2.2" rx="1.1" fill="#C6FF00" />
    {/* Rising stitched cricket ball accent */}
    <circle cx="25" cy="7.5" r="3.4" fill="#C6FF00" />
    <path
      d="M23.1 5.8C24.2 6.8 25.1 7.9 25.8 9.2"
      stroke="#0B39E8"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  historyCount: number;
  mobileOpen: boolean;
  onToggleMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  historyCount,
  mobileOpen,
  onToggleMobile,
}) => {
  const handleSelect = (page: PageId) => {
    onNavigate(page);
    onToggleMobile(false);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-[#141414] border-r border-[#262626] px-4 py-6">
      <div>
        {/* Brand Block */}
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-2 text-left transition-colors hover:bg-[#1E1E1E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-[#0B39E8] to-[#06218A] text-white shadow-sm">
            <AuctionIQLogo className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl font-extrabold tracking-tight uppercase text-white leading-none">
              AUCTION<span className="text-[#C6FF00]">IQ</span>
            </div>
            <div className="mt-1 text-[11px] font-medium tracking-[0.01em] text-[#B3B3B3] whitespace-nowrap">
              Predict. Compare. Discover.
            </div>
          </div>
        </button>

        <div className="my-5 h-px bg-gradient-to-r from-[#0B39E8]/60 via-[#C6FF00]/40 to-[#FF3B5C]/40" />

        {/* Primary Navigation */}
        <nav aria-label="Main navigation" className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const iconAccent = NAV_ACCENT_TEXT[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00] ${
                  isActive
                    ? `${NAV_ACTIVE_BG[item.id]} font-semibold`
                    : 'text-[#B3B3B3] hover:translate-x-0.5 hover:bg-[#1E1E1E] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? 'text-[#C6FF00]' : iconAccent
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'history' && historyCount > 0 && (
                  <span
                    className={`font-mono-num text-xs shrink-0 ${
                      isActive ? 'text-[#C6FF00]' : 'text-[#FF3B5C]'
                    }`}
                  >
                    {historyCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Action Callout */}
      <button
        type="button"
        onClick={() => handleSelect('predict')}
        className="group mt-6 w-full rounded-xl border border-[#2C2C2C] bg-gradient-to-br from-[#1C1C1C] to-[#172038] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFB800]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800]"
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold uppercase tracking-wide text-white">
            IPL Valuation
          </span>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFB800] text-[#141414] transition-transform duration-200 group-hover:scale-110"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#B3B3B3]">
          Linear Regression &amp; Random Forest estimates in ₹ Crore.
        </p>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-[268px] lg:shrink-0">
        <div className="fixed inset-y-0 left-0 w-[268px] z-30">{navContent}</div>
      </aside>

      {/* Mobile Compact Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#262626] bg-[#141414]/95 backdrop-blur px-4 lg:hidden">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00] rounded-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0B39E8] text-white">
            <AuctionIQLogo className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-extrabold uppercase tracking-tight text-white whitespace-nowrap">
            AUCTION<span className="text-[#C6FF00]">IQ</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggleMobile(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2B2B2B] bg-[#1E1E1E] text-white hover:border-[#C6FF00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00]"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/75"
            onClick={() => onToggleMobile(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[272px] max-w-[85vw] z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
