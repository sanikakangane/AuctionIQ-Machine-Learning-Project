import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BookmarkCheck,
  BookmarkPlus,
  CheckCircle2,
  Eraser,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { BrandStarIcon, type PageId } from '../components/Sidebar';
import {
  FEATURE_COLUMNS,
  type FeatureName,
  type PlayerRecord,
  type PlayerSummary,
  type PredictionHistoryEntry,
  type PredictionResponse,
} from '../types/auctioniq';

interface PredictPricePageProps {
  onSaveToHistory: (entry: PredictionHistoryEntry) => void;
  onNavigate: (page: PageId) => void;
}

type FormInputState = Record<FeatureName, string>;

const EMPTY_FORM: FormInputState = FEATURE_COLUMNS.reduce((acc, col) => {
  acc[col] = '';
  return acc;
}, {} as FormInputState);

const FIELD_META: Array<{
  key: FeatureName;
  label: string;
  group: 'Batting' | 'Bowling' | 'Match';
  step?: string;
}> = [
  { key: 'runs', label: 'Runs', group: 'Batting', step: '1' },
  { key: 'balls_faced', label: 'Balls Faced', group: 'Batting', step: '1' },
  { key: 'fours', label: 'Fours', group: 'Batting', step: '1' },
  { key: 'sixes', label: 'Sixes', group: 'Batting', step: '1' },
  { key: 'batting_matches', label: 'Batting Matches', group: 'Batting', step: '1' },
  { key: 'strike_rate', label: 'Strike Rate', group: 'Batting', step: '0.01' },
  { key: 'batting_average', label: 'Batting Average', group: 'Batting', step: '0.01' },
  { key: 'dismissals', label: 'Dismissals', group: 'Batting', step: '1' },
  { key: 'balls_bowled', label: 'Balls Bowled', group: 'Bowling', step: '1' },
  { key: 'wickets', label: 'Wickets', group: 'Bowling', step: '1' },
  { key: 'runs_conceded', label: 'Runs Conceded', group: 'Bowling', step: '1' },
  { key: 'overs_bowled', label: 'Overs Bowled', group: 'Bowling', step: '0.1' },
  { key: 'economy', label: 'Economy', group: 'Bowling', step: '0.01' },
  { key: 'bowling_matches', label: 'Bowling Matches', group: 'Bowling', step: '1' },
  { key: 'matches', label: 'Total Matches', group: 'Match', step: '1' },
  { key: 'runs_per_match', label: 'Runs Per Match', group: 'Match', step: '0.01' },
];

type FeatureGroupFilter = 'All' | 'Batting' | 'Bowling' | 'Match';

const MARQUEE_QUICK_PICKS: Array<{
  name: string;
  teamCode: string;
  accentText: string;
  activeBorder: string;
}> = [
  {
    name: 'Virat Kohli',
    teamCode: 'RCB',
    accentText: 'text-[#FF3B5C]',
    activeBorder: 'border-[#FF3B5C] bg-[#FF3B5C]/15',
  },
  {
    name: 'MS Dhoni',
    teamCode: 'CSK',
    accentText: 'text-[#FFB800]',
    activeBorder: 'border-[#FFB800] bg-[#FFB800]/15',
  },
  {
    name: 'Hardik Pandya',
    teamCode: 'MI',
    accentText: 'text-[#22D3EE]',
    activeBorder: 'border-[#22D3EE] bg-[#22D3EE]/15',
  },
  {
    name: 'Rohit Sharma',
    teamCode: 'MI',
    accentText: 'text-[#3B82F6]',
    activeBorder: 'border-[#3B82F6] bg-[#3B82F6]/15',
  },
  {
    name: 'Sanju Samson',
    teamCode: 'RR',
    accentText: 'text-[#EC4899]',
    activeBorder: 'border-[#EC4899] bg-[#EC4899]/15',
  },
  {
    name: 'Sunil Narine',
    teamCode: 'KKR',
    accentText: 'text-[#A78BFA]',
    activeBorder: 'border-[#A78BFA] bg-[#A78BFA]/15',
  },
  {
    name: 'Jasprit Bumrah',
    teamCode: 'MI',
    accentText: 'text-[#22D3EE]',
    activeBorder: 'border-[#22D3EE] bg-[#22D3EE]/15',
  },
  {
    name: 'Rashid Khan',
    teamCode: 'GT',
    accentText: 'text-[#00E59B]',
    activeBorder: 'border-[#00E59B] bg-[#00E59B]/15',
  },
];

const GROUP_THEME: Record<
  'Batting' | 'Bowling' | 'Match',
  {
    headingColor: string;
    focusBorder: string;
    tabActive: string;
    count: number;
  }
> = {
  Batting: {
    headingColor: 'text-[#FFB800]',
    focusBorder: 'focus:border-[#FFB800]',
    tabActive: 'bg-[#BE123C] text-white',
    count: 8,
  },
  Bowling: {
    headingColor: 'text-[#00E59B]',
    focusBorder: 'focus:border-[#00E59B]',
    tabActive: 'bg-[#047857] text-white',
    count: 6,
  },
  Match: {
    headingColor: 'text-[#22D3EE]',
    focusBorder: 'focus:border-[#22D3EE]',
    tabActive: 'bg-[#0E7490] text-white',
    count: 2,
  },
};

export const PredictPricePage: React.FC<PredictPricePageProps> = ({
  onSaveToHistory,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerSummary[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRecord | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [customPlayerName, setCustomPlayerName] = useState('');
  const [formValues, setFormValues] = useState<FormInputState>(EMPTY_FORM);
  const [groupFilter, setGroupFilter] = useState<FeatureGroupFilter>('All');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [savedCurrentResult, setSavedCurrentResult] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `/api/players?q=${encodeURIComponent(searchQuery.trim())}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { players: PlayerSummary[] };
        if (!cancelled) {
          setSuggestions(data.players.slice(0, 14));
        }
      } catch {
        // Ignore transient errors
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const loadPlayerProfile = async (playerIdentifier: string) => {
    setLoadingProfile(true);
    setFormError(null);
    setPredictionResult(null);
    setSavedCurrentResult(false);

    try {
      const res = await fetch(`/api/player/${encodeURIComponent(playerIdentifier)}`);
      if (!res.ok) {
        setFormError('Could not load player profile.');
        return;
      }
      const profile = (await res.json()) as PlayerRecord;
      setSelectedPlayer(profile);
      setCustomPlayerName(profile.name);
      setSearchQuery(profile.name);
      setDropdownOpen(false);

      const nextForm: FormInputState = { ...EMPTY_FORM };
      for (const col of FEATURE_COLUMNS) {
        const val = profile.features[col];
        nextForm[col] = val !== null && val !== undefined ? String(val) : '';
      }
      setFormValues(nextForm);
    } catch {
      setFormError('Network error while loading player profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleClearAll = () => {
    setSelectedPlayer(null);
    setSearchQuery('');
    setCustomPlayerName('');
    setFormValues(EMPTY_FORM);
    setFormError(null);
    setPredictionResult(null);
    setSavedCurrentResult(false);
  };

  const handleFillSample = () => {
    void loadPlayerProfile('Virat Kohli');
  };

  const handleFieldChange = (key: FeatureName, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (formError) setFormError(null);
  };

  const missingFields = useMemo(
    () => FEATURE_COLUMNS.filter((col) => formValues[col].trim() === ''),
    [formValues]
  );

  const filledCount = FEATURE_COLUMNS.length - missingFields.length;
  const readinessPct = Math.round((filledCount / FEATURE_COLUMNS.length) * 100);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (missingFields.length > 0) {
      setFormError(
        `Cannot estimate price from incomplete inputs. Missing ${missingFields.length} field(s): ${missingFields
          .slice(0, 4)
          .join(', ')}${missingFields.length > 4 ? '...' : ''}. Enter verified statistics or load a player with available 2026 data.`
      );
      return;
    }

    const numericFeatures = {} as Record<FeatureName, number>;
    for (const col of FEATURE_COLUMNS) {
      const parsed = Number(formValues[col]);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setFormError(`Feature "${col}" must be a valid non-negative number.`);
        return;
      }
      numericFeatures[col] = parsed;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: selectedPlayer?.name || customPlayerName || 'Custom Player Profile',
          features: numericFeatures,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Prediction failed.');
        return;
      }
      setPredictionResult(data as PredictionResponse);
      setSavedCurrentResult(false);
    } catch {
      setFormError('Failed to reach the prediction backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveResult = () => {
    if (!predictionResult || savedCurrentResult) return;
    const entry: PredictionHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playerName: predictionResult.playerName,
      role: predictionResult.role,
      team2026: predictionResult.team2026,
      teamCode: predictionResult.teamCode,
      photoUrl: predictionResult.photoUrl,
      estimatedPriceCr: predictionResult.estimatedPriceCr,
      linearRegressionPriceCr: predictionResult.linearRegressionPriceCr,
      randomForestPriceCr: predictionResult.randomForestPriceCr,
      selectedModel: predictionResult.selectedModel,
      savedAt: new Date().toISOString(),
      features: predictionResult.featuresUsed,
    };
    onSaveToHistory(entry);
    setSavedCurrentResult(true);
  };

  const handlePredictAnother = () => {
    setPredictionResult(null);
    setSavedCurrentResult(false);
    setFormError(null);
  };

  // PREDICTION RESULT STATE
  if (predictionResult) {
    const isRFSelected = predictionResult.selectedModel === 'Random Forest';
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFB800]">
              <BrandStarIcon className="h-3.5 w-3.5" />
              <span>Valuation Output</span>
            </div>
            <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
              ESTIMATED <span className="text-[#C6FF00]">AUCTION PRICE.</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={handlePredictAnother}
            className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/50 bg-[#1C1C1C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#22D3EE] hover:text-[#22D3EE] whitespace-nowrap"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Predict Another Player</span>
          </button>
        </div>

        {/* Hero Result Card in Electric Royal Blue */}
        <section className="rounded-2xl bg-gradient-to-br from-[#0B39E8] via-[#0B39E8] to-[#08269C] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <PlayerAvatar
                name={predictionResult.playerName}
                teamCode={predictionResult.teamCode}
                photoUrl={predictionResult.photoUrl}
                size="xl"
              />
              <div>
                <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
                  {predictionResult.playerName}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/90">
                  <span>
                    {predictionResult.team2026 ?? 'Team information unavailable'}
                  </span>
                  {predictionResult.role !== 'Unknown' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#FFB800]">
                        {predictionResult.role}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] px-6 py-5 lg:text-right border border-[#FFB800]/40">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#22D3EE]">
                Estimated Price ({predictionResult.selectedModel})
              </div>
              <div className="mt-1 font-mono-num text-4xl font-bold text-[#C6FF00] sm:text-5xl">
                ₹ {predictionResult.estimatedPriceCr.toFixed(2)} Cr
              </div>
            </div>
          </div>

          {/* Model Outputs Side by Side */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              className={`rounded-xl border p-5 ${
                !isRFSelected
                  ? 'border-[#22D3EE] bg-[#141414]'
                  : 'border-[#22D3EE]/35 bg-[#141414]/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#22D3EE]">
                  Linear Regression
                </span>
                <span className="text-[#A3A3A3]">Linear Baseline</span>
              </div>
              <div className="mt-2 font-mono-num text-3xl font-bold text-white">
                ₹ {predictionResult.linearRegressionPriceCr.toFixed(2)} Cr
              </div>
            </div>

            <div
              className={`rounded-xl border p-5 ${
                isRFSelected
                  ? 'border-[#00E59B] bg-[#141414]'
                  : 'border-white/20 bg-[#141414]/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#00E59B]">
                  Random Forest
                </span>
                {isRFSelected && (
                  <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[#C6FF00]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Selected Model
                  </span>
                )}
              </div>
              <div className="mt-2 font-mono-num text-3xl font-bold text-[#C6FF00]">
                ₹ {predictionResult.randomForestPriceCr.toFixed(2)} Cr
              </div>
            </div>
          </div>

          {/* Result Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/20 pt-5">
            <button
              type="button"
              onClick={handleSaveResult}
              disabled={savedCurrentResult}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider transition-transform whitespace-nowrap ${
                savedCurrentResult
                  ? 'bg-white text-[#141414] cursor-default'
                  : 'bg-[#FFB800] text-[#141414] hover:scale-[1.02] hover:bg-[#FFC933]'
              }`}
            >
              {savedCurrentResult ? (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  <span>Saved to History</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" />
                  <span>Save to History</span>
                </>
              )}
            </button>

            {savedCurrentResult && (
              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="inline-flex items-center gap-2 rounded-full border border-[#00E59B]/60 bg-[#047857]/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#047857] whitespace-nowrap"
              >
                <span>Open Prediction History</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePredictAnother}
              className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 whitespace-nowrap"
            >
              Edit Inputs
            </button>
          </div>
        </section>

        {/* Player Statistics Summary Used */}
        <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
          <h3 className="font-display text-xl font-bold uppercase text-white">
            Player Statistics Summary Used
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Matches</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-[#22D3EE]">
                {predictionResult.featuresUsed.matches}
              </div>
            </div>
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Runs</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-[#FFB800]">
                {predictionResult.featuresUsed.runs}
              </div>
            </div>
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Strike Rate</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-white">
                {predictionResult.featuresUsed.strike_rate}
              </div>
            </div>
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Batting Average</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-white">
                {predictionResult.featuresUsed.batting_average}
              </div>
            </div>
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Fours / Sixes</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-[#FF3B5C]">
                {predictionResult.featuresUsed.fours} / {predictionResult.featuresUsed.sixes}
              </div>
            </div>
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Wickets</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-[#00E59B]">
                {predictionResult.featuresUsed.wickets}
              </div>
            </div>
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Economy</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-white">
                {predictionResult.featuresUsed.economy}
              </div>
            </div>
            <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5">
              <div className="text-xs text-[#A3A3A3]">Runs / Match</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-[#A78BFA]">
                {predictionResult.featuresUsed.runs_per_match}
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-[#A3A3A3]">{predictionResult.disclaimer}</p>
        </section>
      </div>
    );
  }

  const formatStatDisplay = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'Unavailable';
    return String(val);
  };

  const visibleGroups: Array<'Batting' | 'Bowling' | 'Match'> =
    groupFilter === 'All' ? ['Batting', 'Bowling', 'Match'] : [groupFilter];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFB800]">
            <BrandStarIcon className="h-3.5 w-3.5" />
            <span>Player Valuation Engine</span>
          </div>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
            PREDICT <span className="text-[#22D3EE]">PLAYER</span>{' '}
            <span className="text-[#C6FF00]">AUCTION PRICE.</span>
          </h1>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Search an IPL player or pick a marquee profile below to auto-fill verified 2026 statistics before running both models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleFillSample}
            className="inline-flex items-center gap-2 rounded-full border border-[#FFB800]/50 bg-[#1C1C1C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#FFB800] hover:bg-[#FFB800]/15 hover:text-[#FFB800] whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FFB800]" />
            <span>Fill Sample Data</span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-full border border-[#383838] bg-[#1C1C1C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B3B3B3] transition-colors hover:border-[#FF3B5C] hover:text-[#FF3B5C] whitespace-nowrap"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Smart Player Search Input + Interactive Marquee Quick-Pick Strip */}
      <section ref={searchContainerRef} className="relative z-20 space-y-3">
        <div>
          <label htmlFor="player-search" className="sr-only">
            Search IPL Player
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#22D3EE]" />
            <input
              id="player-search"
              type="text"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCustomPlayerName(e.target.value);
                setDropdownOpen(true);
              }}
              placeholder="Search IPL player by name or team (e.g. Virat Kohli, Jasprit Bumrah, Rashid Khan)..."
              className="w-full rounded-xl border border-[#383838] bg-[#1C1C1C] py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#737373] transition-colors focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#383838] bg-[#1C1C1C] shadow-2xl">
              {loadingSuggestions ? (
                <div className="px-4 py-3 text-xs text-[#A3A3A3]">
                  Searching player directory...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-[#A3A3A3]">
                  No matching players found in the directory. You can still enter verified
                  statistics manually below.
                </div>
              ) : (
                <ul role="listbox" className="divide-y divide-[#2B2B2B]">
                  {suggestions.map((player) => (
                    <li key={player.id}>
                      <button
                        type="button"
                        onClick={() => void loadPlayerProfile(player.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#0B39E8]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar
                            name={player.name}
                            teamCode={player.teamCode}
                            photoUrl={player.photoUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {player.name}
                            </div>
                            <div className="text-xs text-white/75 truncate">
                              {player.team2026 ?? 'Team information unavailable'} ·{' '}
                              {player.role}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold whitespace-nowrap ${
                            player.has_2026_stats ? 'text-[#00E59B]' : 'text-[#A3A3A3]'
                          }`}
                        >
                          {player.has_2026_stats ? '2026 Stats Ready' : 'Stats Unavailable'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Interactive Marquee Quick-Pick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#A3A3A3] mr-1">
            Quick Load Stars:
          </span>
          {MARQUEE_QUICK_PICKS.map((star) => {
            const isLoaded = selectedPlayer?.name === star.name;
            return (
              <button
                key={star.name}
                type="button"
                onClick={() => void loadPlayerProfile(star.name)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap ${
                  isLoaded
                    ? `${star.activeBorder} text-white`
                    : 'border-[#2E2E2E] bg-[#1C1C1C] text-[#D4D4D4] hover:border-[#525252] hover:text-white'
                }`}
              >
                <span>{star.name}</span>
                <span className={`font-mono-num text-[11px] font-bold ${star.accentText}`}>
                  {star.teamCode}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Two-Column Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Selected Player Profile */}
        <section className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#262626] bg-[#1C1C1C] overflow-hidden">
            {loadingProfile ? (
              <div className="py-12 text-center text-sm text-[#A3A3A3]">
                Loading player profile...
              </div>
            ) : selectedPlayer ? (
              <div>
                {/* Bold Electric Royal Blue Player Header */}
                <div className="bg-gradient-to-br from-[#0B39E8] to-[#08269C] p-6 text-white">
                  <div className="flex items-center gap-4">
                    <PlayerAvatar
                      name={selectedPlayer.name}
                      teamCode={selectedPlayer.teamCode}
                      photoUrl={selectedPlayer.photoUrl}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-3xl font-extrabold uppercase leading-none text-white truncate">
                        {selectedPlayer.name}
                      </h2>
                      <div className="mt-1.5 text-xs font-bold uppercase tracking-wider text-[#FFB800]">
                        {selectedPlayer.role}
                      </div>
                      <div className="mt-1 text-xs text-white/90">
                        {selectedPlayer.team2026
                          ? `2026 Franchise: ${selectedPlayer.team2026}`
                          : 'Team information unavailable'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {selectedPlayer.previousTeams.length > 0 && (
                    <div className="text-xs">
                      <div className="font-semibold uppercase tracking-wider text-[#22D3EE]">
                        Historical Franchises
                      </div>
                      <div className="mt-1 text-white">
                        {selectedPlayer.previousTeams.join(' · ')}
                      </div>
                    </div>
                  )}

                  {selectedPlayer.photoUrl && selectedPlayer.photoAttribution && (
                    <div className="text-[11px] text-[#A3A3A3] border-t border-[#2E2E2E] pt-3">
                      <span>
                        Photo: {selectedPlayer.photoSourceName || 'Wikimedia Commons'} ·{' '}
                        {selectedPlayer.photoAttribution}
                      </span>
                    </div>
                  )}

                  {!selectedPlayer.has_2026_stats && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-[#FFB800]/50 bg-[#141414] p-3.5 text-xs leading-relaxed text-[#D4D4D4]">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB800]" />
                      <div>
                        <div className="font-bold uppercase tracking-wide text-[#FFB800]">
                          2026 Statistics Unavailable
                        </div>
                        <p className="mt-1">
                          {selectedPlayer.statsAvailabilityNote ||
                            'No 2026 delivery records exist for this player in the partial 43-match extract. Enter verified figures manually before running a prediction.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2026 Performance Summary */}
                  <div className="border-t border-[#2E2E2E] pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold uppercase text-white">
                        IPL 2026 Performance
                      </h3>
                      <span
                        className={`text-xs font-semibold ${
                          selectedPlayer.has_2026_stats
                            ? 'text-[#00E59B]'
                            : 'text-[#A3A3A3]'
                        }`}
                      >
                        {selectedPlayer.has_2026_stats ? 'Extract Verified' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#FFB800]">
                        Batting
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2.5 text-xs">
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Matches</div>
                          <div className="mt-0.5 font-mono-num font-bold text-[#22D3EE]">
                            {formatStatDisplay(selectedPlayer.features.matches)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Runs</div>
                          <div className="mt-0.5 font-mono-num font-bold text-[#FFB800]">
                            {formatStatDisplay(selectedPlayer.features.runs)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Average</div>
                          <div className="mt-0.5 font-mono-num font-bold text-white">
                            {formatStatDisplay(selectedPlayer.features.batting_average)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Strike Rate</div>
                          <div className="mt-0.5 font-mono-num font-bold text-[#C6FF00]">
                            {formatStatDisplay(selectedPlayer.features.strike_rate)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Fours</div>
                          <div className="mt-0.5 font-mono-num font-bold text-white">
                            {formatStatDisplay(selectedPlayer.features.fours)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Sixes</div>
                          <div className="mt-0.5 font-mono-num font-bold text-[#FF3B5C]">
                            {formatStatDisplay(selectedPlayer.features.sixes)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#00E59B]">
                        Bowling
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2.5 text-xs">
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Wickets</div>
                          <div className="mt-0.5 font-mono-num font-bold text-[#00E59B]">
                            {formatStatDisplay(selectedPlayer.features.wickets)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Economy</div>
                          <div className="mt-0.5 font-mono-num font-bold text-white">
                            {formatStatDisplay(selectedPlayer.features.economy)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#2E2E2E] bg-[#141414] p-2.5">
                          <div className="text-[#A3A3A3]">Bowl Avg</div>
                          <div className="mt-0.5 font-mono-num font-bold text-white">
                            {selectedPlayer.bowlingAverage !== null
                              ? selectedPlayer.bowlingAverage
                              : 'Unavailable'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0B39E8] to-[#0E7490] text-[#FFB800]">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold uppercase text-white">
                  SELECT A PLAYER PROFILE.
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#A3A3A3]">
                  Use the search bar or quick-load star shortcuts above to auto-fill a
                  player&apos;s verified 2026 franchise, role, and seasonal statistics.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#262626] bg-[#1C1C1C] p-4 text-xs leading-relaxed text-[#A3A3A3]">
            The 2026 extract covers 43 matches (174 players). Genuine zero bowling stats
            for pure batters remain <span className="font-mono-num text-[#00E59B]">0</span>,
            while missing player observations stay{' '}
            <span className="text-[#FFB800]">Unavailable</span>.
          </div>
        </section>

        {/* Right Column: Editable 16-Feature ML Input Form */}
        <section className="lg:col-span-7 rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2E2E2E] pb-4">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase text-white">
                MODEL INPUT FEATURES (16 INPUTS)
              </h2>
              <p className="mt-0.5 text-xs text-[#A3A3A3]">
                Filter by category or edit the exact 16 features passed to Linear Regression and Random Forest.
              </p>
            </div>

            {/* Interactive Feature Group Filter Tabs */}
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#2E2E2E] bg-[#141414] p-1">
              <button
                type="button"
                onClick={() => setGroupFilter('All')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  groupFilter === 'All'
                    ? 'bg-[#0B39E8] text-white'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                All (16)
              </button>
              {(['Batting', 'Bowling', 'Match'] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setGroupFilter(group)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    groupFilter === group
                      ? GROUP_THEME[group].tabActive
                      : 'text-[#A3A3A3] hover:text-white'
                  }`}
                >
                  {group} ({GROUP_THEME[group].count})
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePredict} className="mt-5 space-y-6">
            {visibleGroups.map((group) => {
              const groupFields = FIELD_META.filter((f) => f.group === group);
              const theme = GROUP_THEME[group];
              return (
                <div key={group} className="space-y-3">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${theme.headingColor}`}
                  >
                    {group} Statistics
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {groupFields.map((field) => {
                      const val = formValues[field.key];
                      const isMissing = val.trim() === '';
                      return (
                        <div key={field.key}>
                          <label
                            htmlFor={`field-${field.key}`}
                            className="block text-xs font-medium text-[#B3B3B3]"
                          >
                            {field.label}
                          </label>
                          <input
                            id={`field-${field.key}`}
                            type="number"
                            min="0"
                            step={field.step ?? 'any'}
                            value={val}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder="Unavailable"
                            className={`mt-1 w-full rounded-lg border bg-[#141414] px-3 py-2 font-mono-num text-sm text-white placeholder-[#737373] transition-colors focus:outline-none ${
                              isMissing && formError
                                ? 'border-red-400/80 focus:border-red-400'
                                : `border-[#2E2E2E] ${theme.focusBorder}`
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-500/50 bg-red-500/10 p-3.5 text-xs leading-relaxed text-red-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#2E2E2E] pt-5">
              <div className="min-w-[200px] flex-1 max-w-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A3A3A3]">
                    {missingFields.length === 0
                      ? 'All 16 model features ready.'
                      : `${missingFields.length} feature(s) currently empty.`}
                  </span>
                  <span
                    className={`font-mono-num font-bold ${
                      filledCount === FEATURE_COLUMNS.length
                        ? 'text-[#00E59B]'
                        : filledCount > 0
                        ? 'text-[#FFB800]'
                        : 'text-[#737373]'
                    }`}
                  >
                    {filledCount}/16
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#141414]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      filledCount === FEATURE_COLUMNS.length
                        ? 'bg-gradient-to-r from-[#22D3EE] to-[#00E59B]'
                        : 'bg-gradient-to-r from-[#FF3B5C] to-[#FFB800]'
                    }`}
                    style={{ width: `${readinessPct}%` }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#C6FF00] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-[#141414] transition-all duration-200 hover:scale-[1.02] hover:bg-[#D4FF33] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
              >
                <Trophy className="h-4 w-4" />
                <span>{submitting ? 'Calculating...' : 'Reveal Auction Value'}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
