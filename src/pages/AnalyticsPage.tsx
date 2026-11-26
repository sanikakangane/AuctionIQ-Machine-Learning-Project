import React, { useState } from 'react';
import { BrandStarIcon } from '../components/Sidebar';
import type {
  HoldoutComparisonPoint,
  MetricsResponse,
  PriceBin,
  SoldPricesResponse,
} from '../types/auctioniq';

interface AnalyticsPageProps {
  soldPrices: SoldPricesResponse | null;
  metrics: MetricsResponse | null;
}

const BIN_COLORS = ['#22D3EE', '#3B82F6', '#00E59B', '#FFB800', '#FF3B5C', '#A78BFA'];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ soldPrices, metrics }) => {
  const [hoveredBin, setHoveredBin] = useState<PriceBin | null>(null);
  const [selectedBin, setSelectedBin] = useState<PriceBin | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HoldoutComparisonPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<HoldoutComparisonPoint | null>(null);
  const [metricSplit, setMetricSplit] = useState<'2025 validation' | '2026 holdout'>(
    '2025 validation'
  );
  const [hoveredBar, setHoveredBar] = useState<{
    model: string;
    metric: string;
    value: number;
  } | null>(null);

  const activeBin = hoveredBin ?? selectedBin;
  const activePoint = hoveredPoint ?? selectedPoint;

  const bins = soldPrices?.distribution ?? [];
  const totalRecords = soldPrices?.totalRecords ?? 381;
  const maxBinCount = Math.max(...bins.map((b) => b.count), 1);

  const holdoutPoints = soldPrices?.holdoutActualVsPredicted ?? [];

  const activeMetricRows = (metrics?.rows ?? []).filter(
    (r) => r.evaluation === metricSplit
  );
  const lrRow = activeMetricRows.find((r) => r.model === 'Linear Regression');
  const rfRow = activeMetricRows.find((r) => r.model === 'Random Forest');
  const maxMetricVal = Math.max(
    lrRow?.mae ?? 0,
    lrRow?.rmse ?? 0,
    rfRow?.mae ?? 0,
    rfRow?.rmse ?? 0,
    1
  );

  const scatterMin = 0;
  const scatterMax = 20;
  const svgW = 460;
  const svgH = 310;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 42;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const toX = (val: number) =>
    padL +
    ((Math.min(Math.max(val, scatterMin), scatterMax) - scatterMin) /
      (scatterMax - scatterMin)) *
      plotW;
  const toY = (val: number) =>
    padT +
    plotH -
    ((Math.min(Math.max(val, scatterMin), scatterMax) - scatterMin) /
      (scatterMax - scatterMin)) *
      plotH;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#22D3EE]">
          <BrandStarIcon className="h-3.5 w-3.5" />
          <span>Model &amp; Auction Data</span>
        </div>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
          ANALYTICS <span className="text-[#C6FF00]">&amp; CHARTS.</span>
        </h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          Historical auction selling price distribution, interactive holdout scatter plots, and model error comparison. Click any bar or data point to pin inspection.
        </p>
      </div>

      {/* GRAPH 1: Auction Price Distribution Histogram */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              1. Auction Price Distribution
            </h2>
            <p className="mt-1 text-xs text-[#A3A3A3]">
              Distribution of historical IPL sold auction prices across ₹ Crore brackets (n ={' '}
              {totalRecords} matched sold records).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#A3A3A3]">
            <span>
              Median:{' '}
              <strong className="font-mono-num text-[#22D3EE]">
                ₹ {soldPrices?.medianPriceCr.toFixed(2) ?? '2.80'} Cr
              </strong>
            </span>
            <span>
              Mean:{' '}
              <strong className="font-mono-num text-[#FFB800]">
                ₹ {soldPrices?.meanPriceCr.toFixed(2) ?? '4.92'} Cr
              </strong>
            </span>
            <span>
              Max:{' '}
              <strong className="font-mono-num text-[#FF3B5C]">
                ₹ {soldPrices?.maxPriceCr.toFixed(2) ?? '27.00'} Cr
              </strong>
            </span>
          </div>
        </div>

        <div className="mt-5 relative">
          <div className="min-h-[24px] mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num">
            {activeBin ? (
              <span className="text-[#C6FF00]">
                Bracket ₹ {activeBin.rangeLabel} Cr: {activeBin.count} players (
                {((activeBin.count / Math.max(totalRecords, 1)) * 100).toFixed(1)}% of pool)
                {selectedBin?.rangeLabel === activeBin.rangeLabel ? ' · Pinned' : ''}
              </span>
            ) : (
              <span className="text-[#737373]">
                Hover or click any bracket bar to inspect player count
              </span>
            )}
            {selectedBin && (
              <button
                type="button"
                onClick={() => setSelectedBin(null)}
                className="text-xs font-sans font-semibold text-[#22D3EE] hover:underline"
              >
                Clear Pin
              </button>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 760 280"
              className="w-full min-w-[540px] h-auto"
              role="img"
              aria-label="Histogram of IPL auction selling prices in Crore"
            >
              {[0, 40, 80, 120, 160].map((tick) => {
                const y = 225 - (tick / Math.max(maxBinCount, 160)) * 185;
                return (
                  <g key={tick}>
                    <line
                      x1={56}
                      y1={y}
                      x2={735}
                      y2={y}
                      stroke="#2E2E2E"
                      strokeDasharray={tick === 0 ? undefined : '4 4'}
                    />
                    <text
                      x={46}
                      y={y + 4}
                      textAnchor="end"
                      fill="#A3A3A3"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {bins.map((bin, idx) => {
                const slotW = (735 - 66) / Math.max(bins.length, 1);
                const barW = slotW * 0.68;
                const x = 66 + idx * slotW + (slotW - barW) / 2;
                const h = (bin.count / Math.max(maxBinCount, 160)) * 185;
                const y = 225 - h;
                const baseColor = BIN_COLORS[idx % BIN_COLORS.length];
                const isPinned = selectedBin?.rangeLabel === bin.rangeLabel;
                const isHovered = hoveredBin?.rangeLabel === bin.rangeLabel;
                const isActive = isPinned || isHovered;

                return (
                  <g
                    key={bin.rangeLabel}
                    onMouseEnter={() => setHoveredBin(bin)}
                    onMouseLeave={() => setHoveredBin(null)}
                    onClick={() =>
                      setSelectedBin((prev) =>
                        prev?.rangeLabel === bin.rangeLabel ? null : bin
                      )
                    }
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      rx={4}
                      fill={isActive ? '#C6FF00' : baseColor}
                      stroke={isPinned ? '#FFFFFF' : 'none'}
                      strokeWidth={isPinned ? 2 : 0}
                      className="transition-colors duration-150"
                    />
                    <text
                      x={x + barW / 2}
                      y={y - 6}
                      textAnchor="middle"
                      fill={isActive ? '#C6FF00' : '#FFFFFF'}
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {bin.count}
                    </text>
                    <text
                      x={x + barW / 2}
                      y={246}
                      textAnchor="middle"
                      fill={isActive ? '#FFFFFF' : '#A3A3A3'}
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      ₹{bin.rangeLabel}
                    </text>
                  </g>
                );
              })}

              <text x={400} y={270} textAnchor="middle" fill="#A3A3A3" fontSize="11">
                Auction Selling Price Bracket (₹ Crore)
              </text>
              <text
                x={16}
                y={132}
                textAnchor="middle"
                fill="#A3A3A3"
                fontSize="11"
                transform="rotate(-90 16 132)"
              >
                Player Count
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* GRAPH 2: Actual vs Predicted Scatter Plots */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              2. Actual vs Predicted Auction Prices (2026 Holdout)
            </h2>
            <p className="mt-1 text-xs text-[#A3A3A3]">
              Hover or click any player dot to cross-highlight their actual vs predicted price across both models. Dashed diagonal marks y = x.
            </p>
          </div>

          {selectedPoint && (
            <button
              type="button"
              onClick={() => setSelectedPoint(null)}
              className="rounded-lg border border-[#383838] bg-[#141414] px-3 py-1.5 text-xs font-semibold text-[#22D3EE] hover:border-[#22D3EE] whitespace-nowrap"
            >
              Unpin {selectedPoint.playerName}
            </button>
          )}
        </div>

        {/* Synchronized Player Inspection Strip */}
        <div className="mt-4 rounded-xl border border-[#2E2E2E] bg-[#141414] px-4 py-3 text-xs">
          {activePoint ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-semibold text-white">
                {activePoint.playerName}{' '}
                <span className="font-mono-num text-[#FFB800]">
                  ({activePoint.teamCode})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 font-mono-num">
                <span className="text-white">
                  Actual: <strong>₹{activePoint.actualPriceCr.toFixed(2)} Cr</strong>
                </span>
                <span className="text-[#22D3EE]">
                  LR: <strong>₹{activePoint.linearRegressionPredCr.toFixed(2)} Cr</strong>
                </span>
                <span className="text-[#00E59B]">
                  RF: <strong>₹{activePoint.randomForestPredCr.toFixed(2)} Cr</strong>
                </span>
              </div>
            </div>
          ) : (
            <span className="text-[#737373]">
              Hover or click any point on either chart to compare Linear Regression vs Random Forest side by side.
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Linear Regression Scatter */}
          <div className="rounded-xl border border-[#22D3EE]/30 bg-[#141414] p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold uppercase text-white">
                Linear Regression
              </h3>
              <span className="font-mono-num text-xs font-semibold text-[#22D3EE]">
                Holdout MAE: 3.467 Cr
              </span>
            </div>

            <div className="h-5 mt-1 text-xs font-mono-num text-[#22D3EE]">
              {activePoint ? (
                <span>
                  {activePoint.playerName} ({activePoint.teamCode}) — Actual: ₹
                  {activePoint.actualPriceCr.toFixed(2)} Cr | Pred: ₹
                  {activePoint.linearRegressionPredCr.toFixed(2)} Cr
                </span>
              ) : (
                <span className="text-[#737373]">Click dot to pin player</span>
              )}
            </div>

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="mt-2 w-full h-auto"
              role="img"
              aria-label="Actual vs Predicted scatter plot for Linear Regression"
            >
              {[0, 5, 10, 15, 20].map((tick) => (
                <g key={tick}>
                  <line
                    x1={padL}
                    y1={toY(tick)}
                    x2={svgW - padR}
                    y2={toY(tick)}
                    stroke="#2A2A2A"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={toX(tick)}
                    y1={padT}
                    x2={toX(tick)}
                    y2={svgH - padB}
                    stroke="#2A2A2A"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padL - 8}
                    y={toY(tick) + 4}
                    textAnchor="end"
                    fill="#A3A3A3"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {tick}
                  </text>
                  <text
                    x={toX(tick)}
                    y={svgH - padB + 16}
                    textAnchor="middle"
                    fill="#A3A3A3"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {tick}
                  </text>
                </g>
              ))}

              <line
                x1={toX(0)}
                y1={toY(0)}
                x2={toX(20)}
                y2={toY(20)}
                stroke="#FFFFFF"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />

              {holdoutPoints.map((pt) => {
                const cx = toX(pt.actualPriceCr);
                const cy = toY(pt.linearRegressionPredCr);
                const active = activePoint?.playerName === pt.playerName;
                return (
                  <circle
                    key={pt.playerName}
                    cx={cx}
                    cy={cy}
                    r={active ? 7.2 : 5}
                    fill={active ? '#FFB800' : '#22D3EE'}
                    stroke="#141414"
                    strokeWidth={active ? '2' : '1.25'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() =>
                      setSelectedPoint((prev) =>
                        prev?.playerName === pt.playerName ? null : pt
                      )
                    }
                  />
                );
              })}

              <text
                x={padL + plotW / 2}
                y={svgH - 6}
                textAnchor="middle"
                fill="#A3A3A3"
                fontSize="11"
              >
                Actual Selling Price (₹ Crore)
              </text>
              <text
                x={14}
                y={padT + plotH / 2}
                textAnchor="middle"
                fill="#A3A3A3"
                fontSize="11"
                transform={`rotate(-90 14 ${padT + plotH / 2})`}
              >
                Predicted (₹ Crore)
              </text>
            </svg>
          </div>

          {/* Random Forest Scatter */}
          <div className="rounded-xl border border-[#00E59B]/30 bg-[#141414] p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold uppercase text-white">
                Random Forest
              </h3>
              <span className="font-mono-num text-xs font-semibold text-[#00E59B]">
                Holdout MAE: 3.552 Cr
              </span>
            </div>

            <div className="h-5 mt-1 text-xs font-mono-num text-[#00E59B]">
              {activePoint ? (
                <span>
                  {activePoint.playerName} ({activePoint.teamCode}) — Actual: ₹
                  {activePoint.actualPriceCr.toFixed(2)} Cr | Pred: ₹
                  {activePoint.randomForestPredCr.toFixed(2)} Cr
                </span>
              ) : (
                <span className="text-[#737373]">Click dot to pin player</span>
              )}
            </div>

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="mt-2 w-full h-auto"
              role="img"
              aria-label="Actual vs Predicted scatter plot for Random Forest"
            >
              {[0, 5, 10, 15, 20].map((tick) => (
                <g key={tick}>
                  <line
                    x1={padL}
                    y1={toY(tick)}
                    x2={svgW - padR}
                    y2={toY(tick)}
                    stroke="#2A2A2A"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={toX(tick)}
                    y1={padT}
                    x2={toX(tick)}
                    y2={svgH - padB}
                    stroke="#2A2A2A"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padL - 8}
                    y={toY(tick) + 4}
                    textAnchor="end"
                    fill="#A3A3A3"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {tick}
                  </text>
                  <text
                    x={toX(tick)}
                    y={svgH - padB + 16}
                    textAnchor="middle"
                    fill="#A3A3A3"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {tick}
                  </text>
                </g>
              ))}

              <line
                x1={toX(0)}
                y1={toY(0)}
                x2={toX(20)}
                y2={toY(20)}
                stroke="#FFFFFF"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />

              {holdoutPoints.map((pt) => {
                const cx = toX(pt.actualPriceCr);
                const cy = toY(pt.randomForestPredCr);
                const active = activePoint?.playerName === pt.playerName;
                return (
                  <circle
                    key={pt.playerName}
                    cx={cx}
                    cy={cy}
                    r={active ? 7.2 : 5}
                    fill={active ? '#C6FF00' : '#00E59B'}
                    stroke="#141414"
                    strokeWidth={active ? '2' : '1.5'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() =>
                      setSelectedPoint((prev) =>
                        prev?.playerName === pt.playerName ? null : pt
                      )
                    }
                  />
                );
              })}

              <text
                x={padL + plotW / 2}
                y={svgH - 6}
                textAnchor="middle"
                fill="#A3A3A3"
                fontSize="11"
              >
                Actual Selling Price (₹ Crore)
              </text>
              <text
                x={14}
                y={padT + plotH / 2}
                textAnchor="middle"
                fill="#A3A3A3"
                fontSize="11"
                transform={`rotate(-90 14 ${padT + plotH / 2})`}
              >
                Predicted (₹ Crore)
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* GRAPH 3: Model Performance Comparison Bar Chart (MAE & RMSE) */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              3. Model Performance Comparison (MAE &amp; RMSE)
            </h2>
            <p className="mt-1 text-xs text-[#A3A3A3]">
              Lower error bars indicate closer auction price predictions in ₹ Crore.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-[#2E2E2E] bg-[#141414] p-1">
            <button
              type="button"
              onClick={() => setMetricSplit('2025 validation')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                metricSplit === '2025 validation'
                  ? 'bg-[#0B39E8] text-white'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              2025 Validation (n=140)
            </button>
            <button
              type="button"
              onClick={() => setMetricSplit('2026 holdout')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                metricSplit === '2026 holdout'
                  ? 'bg-[#047857] text-white'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              2026 Holdout (n=20)
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2 text-[#D4D4D4]">
              <span className="h-3 w-3 rounded-sm bg-[#FF3B5C]" />
              Linear Regression
            </span>
            <span className="inline-flex items-center gap-2 text-[#D4D4D4]">
              <span className="h-3 w-3 rounded-sm bg-[#00E59B]" />
              Random Forest
            </span>
          </div>

          <div className="font-mono-num text-[#FFB800]">
            {hoveredBar
              ? `${hoveredBar.model} · ${hoveredBar.metric}: ${hoveredBar.value.toFixed(3)} ₹ Cr`
              : 'Hover bars to compare MAE and RMSE'}
          </div>
        </div>

        <div className="mt-4 w-full overflow-x-auto">
          <svg
            viewBox="0 0 680 260"
            className="w-full min-w-[480px] h-auto"
            role="img"
            aria-label="Bar chart comparing MAE and RMSE for Linear Regression and Random Forest"
          >
            {[0, 2, 4, 6, 8, 10].map((tick) => {
              const scaleMax = Math.max(Math.ceil(maxMetricVal + 1), 10);
              const y = 210 - (tick / scaleMax) * 170;
              if (y < 25) return null;
              return (
                <g key={tick}>
                  <line
                    x1={60}
                    y1={y}
                    x2={640}
                    y2={y}
                    stroke="#2E2E2E"
                    strokeDasharray={tick === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={50}
                    y={y + 4}
                    textAnchor="end"
                    fill="#A3A3A3"
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {(['MAE', 'RMSE'] as const).map((metricName, groupIdx) => {
              const scaleMax = Math.max(Math.ceil(maxMetricVal + 1), 10);
              const groupCenter = groupIdx === 0 ? 225 : 475;
              const lrVal =
                metricName === 'MAE' ? lrRow?.mae ?? 0 : lrRow?.rmse ?? 0;
              const rfVal =
                metricName === 'MAE' ? rfRow?.mae ?? 0 : rfRow?.rmse ?? 0;
              const lrH = (lrVal / scaleMax) * 170;
              const rfH = (rfVal / scaleMax) * 170;

              return (
                <g key={metricName}>
                  <rect
                    x={groupCenter - 66}
                    y={210 - lrH}
                    width={54}
                    height={lrH}
                    rx={4}
                    fill="#FF3B5C"
                    className="cursor-pointer transition-opacity hover:opacity-85"
                    onMouseEnter={() =>
                      setHoveredBar({
                        model: 'Linear Regression',
                        metric: metricName,
                        value: lrVal,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <text
                    x={groupCenter - 39}
                    y={202 - lrH}
                    textAnchor="middle"
                    fill="#FF3B5C"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {lrVal.toFixed(3)}
                  </text>

                  <rect
                    x={groupCenter + 12}
                    y={210 - rfH}
                    width={54}
                    height={rfH}
                    rx={4}
                    fill="#00E59B"
                    className="cursor-pointer transition-opacity hover:opacity-85"
                    onMouseEnter={() =>
                      setHoveredBar({
                        model: 'Random Forest',
                        metric: metricName,
                        value: rfVal,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <text
                    x={groupCenter + 39}
                    y={202 - rfH}
                    textAnchor="middle"
                    fill="#00E59B"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {rfVal.toFixed(3)}
                  </text>

                  <text
                    x={groupCenter}
                    y={236}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {metricName} (₹ Crore)
                  </text>
                </g>
              );
            })}

            <text
              x={18}
              y={125}
              textAnchor="middle"
              fill="#A3A3A3"
              fontSize="11"
              transform="rotate(-90 18 125)"
            >
              Error (₹ Crore)
            </text>
          </svg>
        </div>
      </section>
    </div>
  );
};
