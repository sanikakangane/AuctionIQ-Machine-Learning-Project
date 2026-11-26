import React, { useState } from 'react';
import { Calculator, Eye, History, Trash2, X } from 'lucide-react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { BrandStarIcon, type PageId } from '../components/Sidebar';
import { FEATURE_COLUMNS, type PredictionHistoryEntry } from '../types/auctioniq';

interface PredictionHistoryPageProps {
  history: PredictionHistoryEntry[];
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (page: PageId) => void;
}

function formatSavedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const PredictionHistoryPage: React.FC<PredictionHistoryPageProps> = ({
  history,
  onDeleteEntry,
  onClearAll,
  onNavigate,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<PredictionHistoryEntry | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C6FF00]">
            <BrandStarIcon className="h-3.5 w-3.5" />
            <span>Saved Valuations</span>
          </div>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
            PREDICTION HISTORY.
          </h1>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Saved player auction price estimates stored locally in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {confirmClear ? (
              <div className="flex items-center gap-2 rounded-full border border-red-500/50 bg-[#1C1C1C] px-4 py-2">
                <span className="text-xs text-white">Clear all saved predictions?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                    setSelectedEntry(null);
                  }}
                  className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white hover:bg-red-600 transition-colors whitespace-nowrap"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-full border border-[#383838] px-3 py-1 text-xs text-[#A3A3A3] hover:text-white transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#383838] bg-[#1C1C1C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B3B3B3] transition-colors hover:border-red-400/70 hover:text-red-300 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#262626] bg-[#1C1C1C] px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B39E8] text-[#C6FF00]">
            <History className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase text-white">
            NO SAVED PREDICTIONS YET.
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-[#A3A3A3]">
            Run a player valuation on the Predict Price page and save the result to
            compare estimates across players over time.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('predict')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C6FF00] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#141414] transition-transform hover:scale-[1.02] whitespace-nowrap"
          >
            <Calculator className="h-4 w-4" />
            <span>Predict Player Price</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#262626] bg-[#1C1C1C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2E2E2E] bg-[#141414] text-xs text-[#A3A3A3]">
                  <th className="px-5 py-3.5 font-medium">Player</th>
                  <th className="px-5 py-3.5 font-medium text-right">Estimated Price</th>
                  <th className="px-5 py-3.5 font-medium">Model Used</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition-colors hover:bg-[#141414]/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          name={entry.playerName}
                          teamCode={entry.teamCode}
                          photoUrl={entry.photoUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">
                            {entry.playerName}
                          </div>
                          <div className="text-xs text-[#A3A3A3] truncate">
                            {entry.team2026 ?? 'Team information unavailable'}
                            {entry.role !== 'Unknown' ? ` · ${entry.role}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono-num font-bold text-[#C6FF00] whitespace-nowrap">
                      ₹ {entry.estimatedPriceCr.toFixed(2)} Cr
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white whitespace-nowrap">
                      {entry.selectedModel}
                    </td>
                    <td className="px-5 py-3.5 font-mono-num text-xs text-[#A3A3A3] whitespace-nowrap">
                      {formatSavedDate(entry.savedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEntry(entry)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#383838] bg-[#141414] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#C6FF00] hover:text-[#C6FF00]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteEntry(entry.id);
                            if (selectedEntry?.id === entry.id) {
                              setSelectedEntry(null);
                            }
                          }}
                          aria-label={`Delete ${entry.playerName} prediction`}
                          className="inline-flex items-center justify-center rounded-full border border-[#383838] bg-[#141414] p-1.5 text-[#A3A3A3] transition-colors hover:border-red-400/70 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Saved prediction for ${selectedEntry.playerName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#383838] bg-[#1C1C1C] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <PlayerAvatar
                  name={selectedEntry.playerName}
                  teamCode={selectedEntry.teamCode}
                  photoUrl={selectedEntry.photoUrl}
                  size="lg"
                />
                <div>
                  <h2 className="font-display text-2xl font-extrabold uppercase text-white">
                    {selectedEntry.playerName}
                  </h2>
                  <p className="text-xs text-[#A3A3A3]">
                    {selectedEntry.team2026 ?? 'Team information unavailable'} · Saved{' '}
                    {formatSavedDate(selectedEntry.savedAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                aria-label="Close detail dialog"
                className="rounded-full border border-[#383838] bg-[#141414] p-2 text-[#A3A3A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#0B39E8] p-4 text-white">
                <div className="text-xs text-white/80">Estimated Price</div>
                <div className="mt-1 font-mono-num text-2xl font-bold text-[#C6FF00]">
                  ₹ {selectedEntry.estimatedPriceCr.toFixed(2)} Cr
                </div>
                <div className="mt-0.5 text-xs text-white/80">
                  {selectedEntry.selectedModel}
                </div>
              </div>
              <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-4">
                <div className="text-xs text-[#A3A3A3]">Linear Regression</div>
                <div className="mt-1 font-mono-num text-2xl font-bold text-white">
                  ₹ {selectedEntry.linearRegressionPriceCr.toFixed(2)} Cr
                </div>
              </div>
              <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-4">
                <div className="text-xs text-[#A3A3A3]">Random Forest</div>
                <div className="mt-1 font-mono-num text-2xl font-bold text-white">
                  ₹ {selectedEntry.randomForestPriceCr.toFixed(2)} Cr
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
                16 Input Features Used
              </h3>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FEATURE_COLUMNS.map((col) => (
                  <div
                    key={col}
                    className="rounded-lg border border-[#2E2E2E] bg-[#141414] px-3 py-2"
                  >
                    <div className="text-[11px] text-[#A3A3A3] truncate">{col}</div>
                    <div className="mt-0.5 font-mono-num text-sm font-semibold text-white">
                      {selectedEntry.features[col]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
