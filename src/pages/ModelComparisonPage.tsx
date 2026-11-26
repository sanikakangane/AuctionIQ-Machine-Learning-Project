import React, { useState } from 'react';
import { Award, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { BrandStarIcon } from '../components/Sidebar';
import type { MetricsResponse } from '../types/auctioniq';

interface ModelComparisonPageProps {
  metrics: MetricsResponse | null;
}

const METRIC_DEFINITIONS = [
  {
    code: 'MAE',
    name: 'Mean Absolute Error',
    unit: '₹ Crore',
    color: 'text-[#22D3EE]',
    activeBorder: 'border-[#22D3EE] bg-[#22D3EE]/10',
    description:
      'Average absolute difference between predicted and actual auction selling prices. Lower values indicate closer average predictions.',
  },
  {
    code: 'MSE',
    name: 'Mean Squared Error',
    unit: '₹ Crore²',
    color: 'text-[#FFB800]',
    activeBorder: 'border-[#FFB800] bg-[#FFB800]/10',
    description:
      'Average of squared prediction errors. Penalizes large misses on high-value marquee signings more heavily.',
  },
  {
    code: 'RMSE',
    name: 'Root Mean Squared Error',
    unit: '₹ Crore',
    color: 'text-[#FF3B5C]',
    activeBorder: 'border-[#FF3B5C] bg-[#FF3B5C]/10',
    description:
      'Square root of MSE expressed back in ₹ Crore units, highlighting sensitivity to outlier auction bids.',
  },
  {
    code: 'R²',
    name: 'Coefficient of Determination',
    unit: 'Score',
    color: 'text-[#00E59B]',
    activeBorder: 'border-[#00E59B] bg-[#00E59B]/10',
    description:
      'Proportion of variance in selling price explained by seasonal statistics alone. Negative values indicate worse fit than predicting the mean.',
  },
];

export const ModelComparisonPage: React.FC<ModelComparisonPageProps> = ({ metrics }) => {
  const [focusedModel, setFocusedModel] = useState<'Random Forest' | 'Linear Regression'>(
    'Random Forest'
  );
  const [selectedMetricCode, setSelectedMetricCode] = useState<string>('MAE');

  const rows = metrics?.rows ?? [];
  const validationRows = rows.filter((r) => r.evaluation === '2025 validation');
  const holdoutRows = rows.filter((r) => r.evaluation === '2026 holdout');
  const selectedModel = metrics?.selectedModel ?? 'Random Forest';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00E59B]">
          <BrandStarIcon className="h-3.5 w-3.5" />
          <span>Algorithm Benchmark</span>
        </div>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
          MODEL <span className="text-[#00E59B]">COMPARISON.</span>
        </h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          Side-by-side historical evaluation of Linear Regression and Random Forest across temporal validation and holdout splits. Click either model card or metric card to inspect.
        </p>
      </div>

      {/* Selected Model Banner in Electric Royal Blue + Gold Accent */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0B39E8] to-[#08269C] p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFB800] text-[#141414]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C6FF00]">
              <span>Selected Primary Model</span>
              <span aria-hidden="true" className="text-white/50">
                ·
              </span>
              <span className="text-[#FFB800]">2025 Validation MAE Winner</span>
            </div>
            <h2 className="mt-1 font-display text-3xl font-extrabold uppercase text-white">
              {selectedModel}
            </h2>
            <p className="mt-1.5 text-sm text-white/90 max-w-3xl">
              {metrics?.selectionBasis ??
                'Selected based on lower 2025 temporal validation MAE (Random Forest: 4.304 vs Linear Regression: 6.075 across 140 validation records).'}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Algorithm Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setFocusedModel('Linear Regression')}
          className={`rounded-2xl border p-6 text-left transition-all duration-200 hover:-translate-y-0.5 ${
            focusedModel === 'Linear Regression'
              ? 'border-[#22D3EE] bg-gradient-to-br from-[#1C1C1C] to-[#13222B] shadow-[0_12px_28px_rgba(34,211,238,0.14)]'
              : 'border-[#262626] bg-[#1C1C1C] hover:border-[#22D3EE]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold uppercase text-white">
              Linear Regression
            </h3>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#22D3EE]">
              Baseline Linear Model
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#B3B3B3]">
            Fits standardized linear coefficients across the 16 seasonal features. Useful
            as an interpretable benchmark, though sensitive to non-linear bidding spikes.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#2E2E2E] pt-4 text-xs">
            <div>
              <div className="text-[#A3A3A3]">2025 Validation MAE</div>
              <div className="mt-0.5 font-mono-num text-lg font-bold text-[#FF3B5C]">
                6.075 Cr
              </div>
            </div>
            <div>
              <div className="text-[#A3A3A3]">2026 Holdout MAE</div>
              <div className="mt-0.5 font-mono-num text-lg font-bold text-[#22D3EE]">
                3.467 Cr
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFocusedModel('Random Forest')}
          className={`rounded-2xl border p-6 text-left transition-all duration-200 hover:-translate-y-0.5 ${
            focusedModel === 'Random Forest'
              ? 'border-[#00E59B] bg-gradient-to-br from-[#1C1C1C] to-[#11241D] shadow-[0_12px_28px_rgba(0,229,155,0.14)]'
              : 'border-[#00E59B]/40 bg-[#1C1C1C] hover:border-[#00E59B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold uppercase text-white">
              Random Forest
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00E59B]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Selected Model
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#B3B3B3]">
            Ensemble of decision trees trained on bootstrapped subsets. Captures
            threshold effects in strike rate, wicket counts, and all-round value.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#2E2E2E] pt-4 text-xs">
            <div>
              <div className="text-[#A3A3A3]">2025 Validation MAE</div>
              <div className="mt-0.5 font-mono-num text-lg font-bold text-[#C6FF00]">
                4.304 Cr
              </div>
            </div>
            <div>
              <div className="text-[#A3A3A3]">2026 Holdout MAE</div>
              <div className="mt-0.5 font-mono-num text-lg font-bold text-[#00E59B]">
                3.552 Cr
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* 2025 Temporal Validation Table */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] overflow-hidden">
        <div className="border-b border-[#2E2E2E] bg-[#141414] px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold uppercase text-white">
              2025 Temporal Validation Results
            </h2>
            <p className="text-xs text-[#A3A3A3]">
              Models trained on 2023–2024 auction records and evaluated on 2025 (used for model selection)
            </p>
          </div>
          <span className="font-mono-num text-xs font-semibold text-[#C6FF00]">
            140 records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2E2E2E] text-xs text-[#A3A3A3]">
                <th className="px-6 py-3 font-medium">Model</th>
                <th className="px-6 py-3 font-medium text-right text-[#22D3EE]">MAE</th>
                <th className="px-6 py-3 font-medium text-right text-[#FFB800]">MSE</th>
                <th className="px-6 py-3 font-medium text-right text-[#FF3B5C]">RMSE</th>
                <th className="px-6 py-3 font-medium text-right text-[#00E59B]">R²</th>
                <th className="px-6 py-3 font-medium text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {validationRows.map((row) => {
                const isSelected = row.model === selectedModel;
                const isFocused = row.model === focusedModel;
                return (
                  <tr
                    key={`${row.evaluation}-${row.model}`}
                    onClick={() => setFocusedModel(row.model)}
                    className={`cursor-pointer transition-colors ${
                      isFocused
                        ? 'bg-[#0B39E8]/25'
                        : isSelected
                        ? 'bg-[#0B39E8]/10 hover:bg-[#0B39E8]/20'
                        : 'hover:bg-[#141414]/60'
                    }`}
                  >
                    <td className="px-6 py-3.5 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{row.model}</span>
                        {isSelected && (
                          <span className="text-xs font-bold uppercase text-[#00E59B]">
                            (Selected)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num font-semibold text-[#22D3EE]">
                      {row.mae.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#FFB800]">
                      {row.mse.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#FF3B5C]">
                      {row.rmse.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#00E59B]">
                      {row.r2.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#B3B3B3]">
                      {row.records}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2026 Holdout Evaluation Table */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] overflow-hidden">
        <div className="border-b border-[#2E2E2E] bg-[#141414] px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold uppercase text-white">
              2026 Final Holdout Results
            </h2>
            <p className="text-xs text-[#A3A3A3]">
              Unseen holdout split kept separate from model selection
            </p>
          </div>
          <span className="font-mono-num text-xs font-semibold text-[#22D3EE]">
            20 records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2E2E2E] text-xs text-[#A3A3A3]">
                <th className="px-6 py-3 font-medium">Model</th>
                <th className="px-6 py-3 font-medium text-right text-[#22D3EE]">MAE</th>
                <th className="px-6 py-3 font-medium text-right text-[#FFB800]">MSE</th>
                <th className="px-6 py-3 font-medium text-right text-[#FF3B5C]">RMSE</th>
                <th className="px-6 py-3 font-medium text-right text-[#00E59B]">R²</th>
                <th className="px-6 py-3 font-medium text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {holdoutRows.map((row) => {
                const isFocused = row.model === focusedModel;
                return (
                  <tr
                    key={`${row.evaluation}-${row.model}`}
                    onClick={() => setFocusedModel(row.model)}
                    className={`cursor-pointer transition-colors ${
                      isFocused ? 'bg-[#0B39E8]/25' : 'hover:bg-[#141414]/60'
                    }`}
                  >
                    <td className="px-6 py-3.5 font-medium text-white whitespace-nowrap">
                      {row.model}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num font-semibold text-[#22D3EE]">
                      {row.mae.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#FFB800]">
                      {row.mse.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#FF3B5C]">
                      {row.rmse.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#00E59B]">
                      {row.r2.toFixed(3)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono-num text-[#B3B3B3]">
                      {row.records}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Evaluation Method Note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#FFB800]/35 bg-[#1C1C1C] p-4 text-xs leading-relaxed text-[#B3B3B3]">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB800]" />
        <p>
          <strong className="text-white">Evaluation Integrity Note:</strong> Model
          selection strictly follows the 140-record 2025 validation MAE comparison,
          selecting Random Forest (4.304 vs 6.075). The slightly lower Linear Regression
          MAE on the 20-record 2026 holdout (3.467 vs 3.552) does not override model
          selection, and historical errors are reported transparently rather than as
          guarantees of future auction prices.
        </p>
      </div>

      {/* Metrics Explanation */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Info className="h-4 w-4 text-[#22D3EE]" />
          <h2 className="font-display text-xl font-bold uppercase">
            Understanding the Evaluation Metrics
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRIC_DEFINITIONS.map((m) => {
            const isSelected = selectedMetricCode === m.code;
            return (
              <button
                key={m.code}
                type="button"
                onClick={() => setSelectedMetricCode(m.code)}
                className={`rounded-xl border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 ${
                  isSelected
                    ? m.activeBorder
                    : 'border-[#262626] bg-[#1C1C1C] hover:border-[#404040]'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className={`font-mono-num text-lg font-bold ${m.color}`}>
                    {m.code}
                  </span>
                  <span className="text-xs text-[#A3A3A3]">{m.unit}</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-white">{m.name}</div>
                <p className="mt-2 text-xs leading-relaxed text-[#A3A3A3]">
                  {m.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
