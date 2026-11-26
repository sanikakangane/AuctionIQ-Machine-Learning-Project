import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Search,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { AuctionIQLogo, BrandStarIcon, type PageId } from '../components/Sidebar';
import type { MetadataResponse, MetricsResponse } from '../types/auctioniq';

interface DashboardPageProps {
  metadata: MetadataResponse | null;
  metrics: MetricsResponse | null;
  onNavigate: (page: PageId) => void;
}

const JOURNEY_STEPS: Array<{
  step: string;
  title: string;
  detail: string;
  actionLabel: string;
  targetPage: PageId;
  accent: string;
  stepColor: string;
  iconColor: string;
}> = [
  {
    step: '01',
    title: 'Search Player',
    detail: 'Pick an IPL player from autocomplete or enter verified stats.',
    actionLabel: 'Open Player Search',
    targetPage: 'predict',
    accent: 'bg-[#0B39E8] text-white border-[#3B63FF]',
    stepColor: 'text-[#C6FF00]',
    iconColor: 'text-[#C6FF00]',
  },
  {
    step: '02',
    title: 'Review Profile & Stats',
    detail: 'Inspect verified team info, role, and 2026 batting/bowling stats.',
    actionLabel: 'Inspect 2026 Dataset',
    targetPage: 'dataset',
    accent: 'bg-[#0F766E] text-white border-[#14B8A6]/60',
    stepColor: 'text-[#99F6E4]',
    iconColor: 'text-[#00E59B]',
  },
  {
    step: '03',
    title: 'Estimate Auction Price',
    detail: 'Run Linear Regression and Random Forest on the 16-feature vector.',
    actionLabel: 'Launch Predictor',
    targetPage: 'predict',
    accent: 'bg-[#9F1239] text-white border-[#FB7185]/50',
    stepColor: 'text-[#FECDD3]',
    iconColor: 'text-[#FFB800]',
  },
  {
    step: '04',
    title: 'Compare & Save',
    detail: 'Compare ₹ Crore estimates side by side and save to history.',
    actionLabel: 'View Saved History',
    targetPage: 'history',
    accent: 'bg-[#141414] text-white border-[#333333]',
    stepColor: 'text-[#FFB800]',
    iconColor: 'text-[#22D3EE]',
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metadata,
  metrics,
  onNavigate,
}) => {
  const [evalSplit, setEvalSplit] = useState<'2025 validation' | '2026 holdout'>(
    '2025 validation'
  );
  const [activeJourneyStep, setActiveJourneyStep] = useState<string>('01');

  const seasonsCount = metadata?.coverage.auctionSeasonsCount ?? 4;
  const playersCount = metadata?.coverage.uniquePlayersDirectory ?? 731;
  const statsPlayersCount = metadata?.coverage.playersWith2026Stats ?? 174;
  const modelsCount = metadata?.coverage.modelsCount ?? 2;
  const bestModel = metrics?.selectedModel ?? metadata?.selectedBestModel ?? 'Random Forest';

  const splitRows = (metrics?.rows ?? []).filter((r) => r.evaluation === evalSplit);
  const rfMetrics = splitRows.find((r) => r.model === 'Random Forest');
  const lrMetrics = splitRows.find((r) => r.model === 'Linear Regression');

  const rfMae =
    rfMetrics?.mae ?? (evalSplit === '2025 validation' ? 4.304 : 3.552);
  const lrMae =
    lrMetrics?.mae ?? (evalSplit === '2025 validation' ? 6.075 : 3.467);
  const rfRmse =
    rfMetrics?.rmse ?? (evalSplit === '2025 validation' ? 5.662 : 4.397);
  const lrRmse =
    lrMetrics?.rmse ?? (evalSplit === '2025 validation' ? 7.813 : 4.217);
  const sampleCount =
    rfMetrics?.records ?? (evalSplit === '2025 validation' ? 140 : 20);

  const maxMae = Math.max(rfMae, lrMae, 1);
  const rfBarPct = Math.round((rfMae / (maxMae * 1.15)) * 100);
  const lrBarPct = Math.round((lrMae / (maxMae * 1.15)) * 100);

  return (
    <div className="space-y-8">
      {/* HERO STAGE: Bold Electric Royal Blue + IPL Auction Trophy & Gavel Backdrop */}
      <section className="relative overflow-hidden rounded-2xl border border-[#223B9E] bg-[#061C75] text-white shadow-xl">
        <div className="relative">
          {/* Background Image Behind Top Hero Box */}
          <img
            src="/assets/aistudio/IPL_Auction__Gavel__Trophy_and_Glory_8928f0b9.png"
            alt="IPL Auction golden trophy, gavel, and illuminated stadium backdrop"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none"
          />

          {/* Measured Royal Blue & Deep Navy Contrast Overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#05165E]/82 via-[#0929AD]/64 to-[#041145]/82 pointer-events-none"
          />

          {/* Decorative Corner Brand Emblem */}
          <button
            type="button"
            onClick={() => onNavigate('about')}
            aria-label="About AuctionIQ"
            className="absolute right-6 top-6 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#061C75]/55 backdrop-blur-sm text-white transition-all duration-200 hover:scale-105 hover:border-[#FFB800] hover:text-[#FFB800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00]"
          >
            <AuctionIQLogo className="h-6 w-6" />
          </button>

          <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12">
            {/* Top Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white drop-shadow-sm">
              <AuctionIQLogo className="h-4 w-4 text-white shrink-0" />
              <span>AuctionIQ</span>
              <span aria-hidden="true" className="text-white/50">
                ·
              </span>
              <span className="text-[#C6FF00]">Predict.</span>
              <span className="text-[#22D3EE]">Compare.</span>
              <span className="text-[#FFB800]">Discover.</span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
              {/* Interactive Multi-Color Left Metric Column */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-3 lg:grid-cols-1 lg:gap-4 border-b border-white/25 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                <button
                  type="button"
                  onClick={() => onNavigate('dataset')}
                  className="group rounded-xl p-2 -m-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
                >
                  <div className="font-display tabular-nums text-4xl font-extrabold leading-none text-[#22D3EE] drop-shadow-sm transition-transform duration-150 group-hover:translate-x-0.5">
                    {seasonsCount}
                  </div>
                  <div className="mt-1 text-xs font-medium text-white/95 group-hover:text-[#22D3EE]">
                    Auction Seasons
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('dataset')}
                  className="group rounded-xl p-2 -m-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800]"
                >
                  <div className="font-display tabular-nums text-4xl font-extrabold leading-none text-[#FFB800] drop-shadow-sm transition-transform duration-150 group-hover:translate-x-0.5">
                    {playersCount}
                  </div>
                  <div className="mt-1 text-xs font-medium text-white/95 group-hover:text-[#FFB800]">
                    Player Records
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('predict')}
                  className="group rounded-xl p-2 -m-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00]"
                >
                  <div className="font-display tabular-nums text-4xl font-extrabold leading-none text-[#C6FF00] drop-shadow-sm transition-transform duration-150 group-hover:translate-x-0.5">
                    {statsPlayersCount}
                  </div>
                  <div className="mt-1 text-xs font-medium text-white/95 group-hover:text-[#C6FF00]">
                    2026 Performance Profiles
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('comparison')}
                  className="group rounded-xl p-2 -m-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E59B]"
                >
                  <div className="font-display tabular-nums text-4xl font-extrabold leading-none text-[#00E59B] drop-shadow-sm transition-transform duration-150 group-hover:translate-x-0.5">
                    {modelsCount}
                  </div>
                  <div className="mt-1 text-xs font-medium text-white/95 group-hover:text-[#00E59B]">
                    ML Models ({bestModel})
                  </div>
                </button>
              </div>

              {/* Center Oversized Headline */}
              <div className="lg:col-span-5">
                <h1
                  className="font-display text-5xl font-extrabold uppercase leading-[0.88] tracking-tight sm:text-6xl xl:text-[4.35rem] drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
                  style={{ textWrap: 'balance' }}
                >
                  <span className="block text-[#C6FF00]">IPL AUCTION</span>
                  <span className="block text-white">PRICE</span>
                  <span className="block text-[#FFB800]">PREDICTION.</span>
                </h1>
              </div>

              {/* Right Intro & Primary CTA */}
              <div className="lg:col-span-4 space-y-5">
                <p className="text-sm leading-relaxed text-white/95 sm:text-base drop-shadow-sm">
                  Explore verified IPL player statistics from the 2026 performance extract
                  and estimate player auction selling prices in ₹ Crore using trained
                  Linear Regression and Random Forest models.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('predict')}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#C6FF00] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#141414] shadow-lg transition-all duration-200 hover:scale-[1.03] hover:bg-[#D4FF33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap shrink-0"
                  >
                    <span>Start Predicting</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('analytics')}
                    className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/60 bg-[#061C75]/65 backdrop-blur-sm px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:border-[#22D3EE] hover:bg-[#0E7490]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] whitespace-nowrap shrink-0"
                  >
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Neon Lime Marquee Ribbon with Multi-Color Star Accents */}
        <div className="relative z-10 border-t border-[#141414]/15 bg-[#C6FF00] px-6 py-3 text-[#141414]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-display text-base font-extrabold uppercase tracking-wider sm:text-lg">
            <span>LINEAR REGRESSION</span>
            <span aria-hidden="true" className="text-[#0B39E8]">✦</span>
            <span>RANDOM FOREST</span>
            <span aria-hidden="true" className="text-[#BE123C]">✦</span>
            <span>16-FEATURE PIPELINE</span>
            <span aria-hidden="true" className="text-[#047857]">✦</span>
            <span>₹ CRORE VALUATION</span>
            <span aria-hidden="true" className="text-[#0B39E8]">✦</span>
            <span>2026 EXTRACT</span>
          </div>
        </div>
      </section>

      {/* CHARCOAL BLACK SHOWCASE BAND (Multi-Color Interactive Capability Cards) */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#22D3EE]">
              <BrandStarIcon className="h-3.5 w-3.5" />
              <span>Core Capabilities</span>
            </div>
            <h2
              className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.95] text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              BUILT FOR CRICKET ANALYTICS &amp; VALUATION.
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('comparison')}
            className="inline-flex items-center gap-2 rounded-full border border-[#00E59B]/50 bg-[#141414] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:border-[#00E59B] hover:bg-[#00E59B] hover:text-[#141414] whitespace-nowrap shrink-0"
          >
            <span>Model Comparison</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Electric Cyan Accent Theme */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('predict')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('predict');
              }
            }}
            className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-[#2F2F2F] bg-gradient-to-br from-[#222222] to-[#162229] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#22D3EE] hover:shadow-[0_14px_34px_rgba(34,211,238,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#22D3EE]">
                    01 · Player Directory
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white">
                    Smart Player Search
                  </h3>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22D3EE] text-[#141414] transition-transform duration-200 group-hover:scale-110"
                >
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
              <p className="mt-3.5 text-sm leading-relaxed text-[#CCCCCC]">
                Instant autocomplete over the IPL player directory with verified 2026
                franchise assignments, role profiles, and automatic stat loading.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-[#333333] pt-4 text-xs">
              <span className="inline-flex items-center gap-2 font-semibold text-white">
                <Search className="h-4 w-4 text-[#22D3EE]" />
                <span className="tabular-nums">{playersCount} Directory Players</span>
              </span>
              <span className="font-mono-num font-semibold text-[#22D3EE]">Auto-Fill</span>
            </div>
          </div>

          {/* Card 2: Spotlight Electric Royal Blue + Amber Gold Accent */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('predict')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('predict');
              }
            }}
            className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-[#3B63FF] bg-gradient-to-br from-[#0B39E8] to-[#1D4ED8] p-7 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-[#FFB800] hover:shadow-[0_18px_38px_rgba(11,57,232,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800]"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#FFB800]">
                    02 · Price Engine
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white">
                    Dual-Model Valuation
                  </h3>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFB800] text-[#141414] transition-transform duration-200 group-hover:scale-110"
                >
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
              <p className="mt-3.5 text-sm leading-relaxed text-white/95">
                Compare predictions from Linear Regression and Random Forest side by
                side using the exact 16-feature seasonal batting and bowling vector.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/25 pt-4 text-xs">
              <span className="inline-flex items-center gap-2 font-semibold text-white">
                <BrainCircuit className="h-4 w-4 text-[#C6FF00]" />
                <span>Primary: {bestModel}</span>
              </span>
              <span className="font-mono-num font-semibold text-[#FFB800]">₹ Crore</span>
            </div>
          </div>

          {/* Card 3: Turf Emerald Accent Theme */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('analytics')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('analytics');
              }
            }}
            className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-[#2F2F2F] bg-gradient-to-br from-[#222222] to-[#132620] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#00E59B] hover:shadow-[0_14px_34px_rgba(0,229,155,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E59B]"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#00E59B]">
                    03 · Season Insights
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white">
                    Historical Analytics
                  </h3>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00E59B] text-[#141414] transition-transform duration-200 group-hover:scale-110"
                >
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
              <p className="mt-3.5 text-sm leading-relaxed text-[#CCCCCC]">
                Explore auction selling price distributions, holdout actual-vs-predicted
                scatter plots, and temporal MAE / RMSE error comparisons.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-[#333333] pt-4 text-xs">
              <span className="inline-flex items-center gap-2 font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-[#00E59B]" />
                <span>3 Core Visuals</span>
              </span>
              <span className="font-mono-num font-semibold text-[#00E59B]">2023–2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* CRISP OFF-WHITE CONTRAST SECTION (Interactive Model Split + Multi-Color Workflow) */}
      <section className="rounded-2xl bg-[#F4F4F2] p-6 text-[#141414] sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Bold Headline & Interactive Validation / Holdout Error Bars */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B39E8]">
              <BrandStarIcon className="h-3.5 w-3.5 text-[#E11D48]" />
              <span>Model &amp; Workflow</span>
            </div>

            <h2
              className="font-display text-4xl font-extrabold uppercase leading-[0.92] text-[#141414] sm:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              PERFORMANCE MEETS MACHINE LEARNING.
            </h2>

            <p className="text-sm leading-relaxed text-[#404040]">
              Every prediction is grounded in real historical IPL season-to-auction
              mappings. Missing 2026 observations are never disguised as zeros—only
              verified inputs enter the model pipeline.
            </p>

            {/* Interactive Split Switcher + Real MAE & RMSE Bars */}
            <div className="space-y-4 rounded-xl border border-[#D4D4D0] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-lg bg-[#EFEFEA] p-1">
                  <button
                    type="button"
                    onClick={() => setEvalSplit('2025 validation')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap ${
                      evalSplit === '2025 validation'
                        ? 'bg-[#0B39E8] text-white shadow-sm'
                        : 'text-[#525252] hover:text-[#141414]'
                    }`}
                  >
                    2025 Validation
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalSplit('2026 holdout')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap ${
                      evalSplit === '2026 holdout'
                        ? 'bg-[#0F766E] text-white shadow-sm'
                        : 'text-[#525252] hover:text-[#141414]'
                    }`}
                  >
                    2026 Holdout
                  </button>
                </div>
                <span className="font-mono-num text-xs font-bold text-[#0B39E8]">
                  n = {sampleCount}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#141414]">
                  <span>Random Forest (Selected)</span>
                  <span className="font-mono-num font-bold text-[#0B39E8]">
                    {rfMae.toFixed(3)} Cr MAE · {rfRmse.toFixed(3)} RMSE
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E5E0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0B39E8] to-[#0EA5E9] transition-all duration-300"
                    style={{ width: `${rfBarPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#262626]">
                  <span>Linear Regression</span>
                  <span className="font-mono-num font-bold text-[#BE123C]">
                    {lrMae.toFixed(3)} Cr MAE · {lrRmse.toFixed(3)} RMSE
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E5E0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E11D48] to-[#F59E0B] transition-all duration-300"
                    style={{ width: `${lrBarPct}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('dataset')}
              className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#0B39E8] hover:scale-[1.02] whitespace-nowrap"
            >
              <span>Dataset Information</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#C6FF00]" />
            </button>
          </div>

          {/* Right: Interactive Multi-Color 4-Step Player-to-Prediction Journey */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl font-bold uppercase text-[#141414]">
                Player-to-Prediction Journey
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('predict')}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B39E8] hover:underline whitespace-nowrap"
              >
                <span>Launch Predictor</span>
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {JOURNEY_STEPS.map((item) => {
                const isSelected = activeJourneyStep === item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onNavigate(item.targetPage);
                      } else {
                        setActiveJourneyStep(item.step);
                      }
                    }}
                    className={`group flex flex-col justify-between rounded-xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B39E8] ${
                      item.accent
                    } ${isSelected ? 'ring-2 ring-[#C6FF00] shadow-lg' : 'opacity-95 hover:opacity-100'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono-num text-xs font-bold ${item.stepColor}`}
                        >
                          STEP {item.step}
                        </span>
                        <Trophy
                          className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${item.iconColor}`}
                        />
                      </div>
                      <h4 className="mt-3 font-display text-xl font-bold uppercase tracking-tight">
                        {item.title}
                      </h4>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/95">
                        {item.detail}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-[11px] font-bold uppercase tracking-wider">
                      <span className={item.stepColor}>{item.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
