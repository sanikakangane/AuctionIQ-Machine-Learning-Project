import { useEffect, useState } from 'react';
import { Sidebar, type PageId } from './components/Sidebar';
import { AboutPage } from './pages/AboutPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DatasetInfoPage } from './pages/DatasetInfoPage';
import { ModelComparisonPage } from './pages/ModelComparisonPage';
import { PredictPricePage } from './pages/PredictPricePage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';
import type {
  MetadataResponse,
  MetricsResponse,
  PredictionHistoryEntry,
  SoldPricesResponse,
} from './types/auctioniq';

const HISTORY_STORAGE_KEY = 'auctioniq_prediction_history_v1';

function readStoredHistory(): PredictionHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PredictionHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [soldPrices, setSoldPrices] = useState<SoldPricesResponse | null>(null);
  const [history, setHistory] = useState<PredictionHistoryEntry[]>(() =>
    readStoredHistory()
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [metaRes, metricsRes, pricesRes] = await Promise.all([
          fetch('/api/metadata'),
          fetch('/api/metrics'),
          fetch('/api/sold-prices'),
        ]);
        if (metaRes.ok) setMetadata((await metaRes.json()) as MetadataResponse);
        if (metricsRes.ok) setMetrics((await metricsRes.json()) as MetricsResponse);
        if (pricesRes.ok) setSoldPrices((await pricesRes.json()) as SoldPricesResponse);
      } catch {
        // Fallback defaults handle transient fetch issues gracefully
      }
    };
    void loadInitialData();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToHistory = (entry: PredictionHistoryEntry) => {
    setHistory((prev) => [entry, ...prev]);
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white lg:flex">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        historyCount={history.length}
        mobileOpen={mobileOpen}
        onToggleMobile={setMobileOpen}
      />

      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {activePage === 'dashboard' && (
            <DashboardPage
              metadata={metadata}
              metrics={metrics}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'predict' && (
            <PredictPricePage
              onSaveToHistory={handleSaveToHistory}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage soldPrices={soldPrices} metrics={metrics} />
          )}

          {activePage === 'comparison' && <ModelComparisonPage metrics={metrics} />}

          {activePage === 'history' && (
            <PredictionHistoryPage
              history={history}
              onDeleteEntry={handleDeleteHistoryEntry}
              onClearAll={handleClearHistory}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'dataset' && <DatasetInfoPage metadata={metadata} />}

          {activePage === 'about' && <AboutPage />}
        </div>
      </main>
    </div>
  );
}
