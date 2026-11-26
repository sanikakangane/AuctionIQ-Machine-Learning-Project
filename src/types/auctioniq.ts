export const FEATURE_COLUMNS = [
  'runs',
  'balls_faced',
  'fours',
  'sixes',
  'batting_matches',
  'strike_rate',
  'batting_average',
  'dismissals',
  'balls_bowled',
  'wickets',
  'runs_conceded',
  'overs_bowled',
  'economy',
  'bowling_matches',
  'matches',
  'runs_per_match',
] as const;

export type FeatureName = (typeof FEATURE_COLUMNS)[number];

export type PlayerRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper' | 'Unknown';

export type FeatureVector = Record<FeatureName, number | null>;

export interface PlayerRecord {
  id: string;
  name: string;
  role: PlayerRole;
  team2026: string | null;
  teamCode: string | null;
  previousTeams: string[];
  has_2026_stats: boolean;
  statsAvailabilityNote?: string;
  features: FeatureVector;
  bowlingAverage: number | null;
  photoUrl: string | null;
  photoAttribution: string | null;
  photoLicense?: string | null;
  photoSourceName?: string | null;
  photoSourceUrl?: string | null;
  photoJerseyContext?: string | null;
}

export interface PlayerSummary {
  id: string;
  name: string;
  role: PlayerRole;
  team2026: string | null;
  teamCode: string | null;
  has_2026_stats: boolean;
  photoUrl: string | null;
}

export interface PredictionRequest {
  playerName: string;
  features: Record<FeatureName, number>;
}

export interface PredictionResponse {
  playerName: string;
  role: PlayerRole;
  team2026: string | null;
  teamCode: string | null;
  photoUrl: string | null;
  photoAttribution?: string | null;
  selectedModel: 'Random Forest' | 'Linear Regression';
  estimatedPriceCr: number;
  linearRegressionPriceCr: number;
  randomForestPriceCr: number;
  featureOrderVerified: boolean;
  featuresUsed: Record<FeatureName, number>;
  disclaimer: string;
}

export interface MetricRow {
  evaluation: '2025 validation' | '2026 holdout';
  model: 'Linear Regression' | 'Random Forest';
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  records: number;
}

export interface MetricsResponse {
  selectedModel: 'Random Forest' | 'Linear Regression';
  selectionBasis: string;
  rows: MetricRow[];
}

export interface PriceBin {
  rangeLabel: string;
  minCr: number;
  maxCr: number;
  count: number;
}

export interface HoldoutComparisonPoint {
  playerName: string;
  teamCode: string;
  actualPriceCr: number;
  linearRegressionPredCr: number;
  randomForestPredCr: number;
}

export interface SoldPricesResponse {
  totalRecords: number;
  minPriceCr: number;
  maxPriceCr: number;
  medianPriceCr: number;
  meanPriceCr: number;
  distribution: PriceBin[];
  holdoutActualVsPredicted: HoldoutComparisonPoint[];
}

export interface DatasetFileInfo {
  name: string;
  category: 'Raw Dataset' | 'Processed Output';
  description: string;
}

export interface MetadataResponse {
  brand: string;
  tagline: string;
  algorithms: string[];
  selectedBestModel: string;
  seasonMapping: Array<{ auctionSeason: string; performanceSeason: string }>;
  coverage: {
    deliveryRecords2026: number;
    matches2026: number;
    uniquePlayersDirectory: number;
    playersWith2026Stats: number;
    searchableProfilesLoaded: number;
    auctionSeasonsCount: number;
    modelsCount: number;
    coverageNote: string;
  };
  featureColumns: readonly FeatureName[];
  preprocessingSteps: string[];
  datasets: DatasetFileInfo[];
}

export interface PredictionHistoryEntry {
  id: string;
  playerName: string;
  role: PlayerRole;
  team2026: string | null;
  teamCode: string | null;
  photoUrl: string | null;
  estimatedPriceCr: number;
  linearRegressionPriceCr: number;
  randomForestPriceCr: number;
  selectedModel: 'Random Forest' | 'Linear Regression';
  savedAt: string;
  features: Record<FeatureName, number>;
}
