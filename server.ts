import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  FEATURE_COLUMNS,
  type FeatureName,
  type MetadataResponse,
  type MetricsResponse,
  type PlayerSummary,
  type PredictionResponse,
  type SoldPricesResponse,
} from './src/types/auctioniq.ts';
import {
  DATASET_FILES,
  HOLDOUT_ACTUAL_VS_PREDICTED,
  MODEL_METRICS_ROWS,
  PLAYERS_DIRECTORY,
  PREPROCESSING_STEPS,
  SOLD_PRICE_DISTRIBUTION,
  TRAINING_SAMPLES,
} from './server/data/iplDataset.ts';
import {
  getAllVerifiedPlayerImages,
  getPlayerImageRecord,
} from './server/data/playerImageService.ts';
import { RandomForestRegressor, StandardLinearRegression } from './server/ml/models.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Train both production ML models on the historical matched auction dataset
const linearModel = new StandardLinearRegression();
linearModel.fit(TRAINING_SAMPLES, 8.0);

const randomForestModel = new RandomForestRegressor(45, 6, 2, 6);
randomForestModel.fit(TRAINING_SAMPLES, 42);

// Select best model strictly from 2025 validation MAE
const validationRows = MODEL_METRICS_ROWS.filter((r) => r.evaluation === '2025 validation');
const bestValidationRow = validationRows.reduce((best, curr) =>
  curr.mae < best.mae ? curr : best
);
const SELECTED_MODEL = bestValidationRow.model;

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    modelsLoaded: ['Linear Regression', 'Random Forest'],
    selectedModel: SELECTED_MODEL,
    featureCount: FEATURE_COLUMNS.length,
    playersCount: PLAYERS_DIRECTORY.length,
    verifiedPlayerPhotosCount: getAllVerifiedPlayerImages().length,
  });
});

app.get('/api/player-images', (_req, res) => {
  const images = getAllVerifiedPlayerImages();
  res.json({
    totalVerified: images.length,
    totalDirectoryPlayers: PLAYERS_DIRECTORY.length,
    images,
  });
});

app.get('/api/players', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const matched = query
    ? PLAYERS_DIRECTORY.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.team2026 && p.team2026.toLowerCase().includes(query)) ||
          (p.teamCode && p.teamCode.toLowerCase().includes(query))
      ).sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(query) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(query) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.name.localeCompare(b.name);
      })
    : [...PLAYERS_DIRECTORY].sort((a, b) => a.name.localeCompare(b.name));

  const summaries: PlayerSummary[] = matched.map((p) => {
    const imgRecord = getPlayerImageRecord(p.name, p.teamCode);
    return {
      id: p.id,
      name: p.name,
      role: p.role,
      team2026: p.team2026,
      teamCode: p.teamCode,
      has_2026_stats: p.has_2026_stats,
      photoUrl: imgRecord ? imgRecord.imagePath : p.photoUrl,
    };
  });

  res.json({ players: summaries, total: summaries.length });
});

app.get('/api/player/:name', (req, res) => {
  const rawParam = decodeURIComponent(req.params.name).trim().toLowerCase();
  const player = PLAYERS_DIRECTORY.find(
    (p) => p.id === rawParam || p.name.toLowerCase() === rawParam
  );

  if (!player) {
    res.status(404).json({ error: 'Player not found in the supplied directory.' });
    return;
  }

  const imgRecord = getPlayerImageRecord(player.name, player.teamCode);

  res.json({
    ...player,
    photoUrl: imgRecord ? imgRecord.imagePath : player.photoUrl,
    photoAttribution: imgRecord ? imgRecord.attribution : player.photoAttribution,
    photoLicense: imgRecord ? imgRecord.license : null,
    photoSourceName: imgRecord ? imgRecord.sourceName : null,
    photoSourceUrl: imgRecord ? imgRecord.sourceUrl : null,
    photoJerseyContext: imgRecord ? imgRecord.jerseyContext : null,
  });
});

app.get('/api/metadata', (_req, res) => {
  const response: MetadataResponse = {
    brand: 'AuctionIQ',
    tagline: 'Predict. Compare. Discover.',
    algorithms: ['Linear Regression', 'Random Forest'],
    selectedBestModel: SELECTED_MODEL,
    seasonMapping: [
      { auctionSeason: '2023', performanceSeason: '2022' },
      { auctionSeason: '2024', performanceSeason: '2023' },
      { auctionSeason: '2025', performanceSeason: '2024' },
      { auctionSeason: '2026', performanceSeason: '2025' },
    ],
    coverage: {
      deliveryRecords2026: 10021,
      matches2026: 43,
      uniquePlayersDirectory: 731,
      playersWith2026Stats: 174,
      searchableProfilesLoaded: PLAYERS_DIRECTORY.length,
      auctionSeasonsCount: 4,
      modelsCount: 2,
      coverageNote:
        'The supplied 2026 raw performance extract covers 10,021 delivery records across 43 matches (174 players with available 2026 performance statistics out of 731 directory records). Players outside this extract retain unavailable statistics rather than fabricated zeros.',
    },
    featureColumns: FEATURE_COLUMNS,
    preprocessingSteps: PREPROCESSING_STEPS,
    datasets: DATASET_FILES,
  };
  res.json(response);
});

app.get('/api/sold-prices', (_req, res) => {
  const totalRecords = SOLD_PRICE_DISTRIBUTION.reduce((acc, b) => acc + b.count, 0);
  const response: SoldPricesResponse = {
    totalRecords,
    minPriceCr: 0.2,
    maxPriceCr: 27.0,
    medianPriceCr: 2.8,
    meanPriceCr: 4.92,
    distribution: SOLD_PRICE_DISTRIBUTION,
    holdoutActualVsPredicted: HOLDOUT_ACTUAL_VS_PREDICTED,
  };
  res.json(response);
});

app.get('/api/metrics', (_req, res) => {
  const response: MetricsResponse = {
    selectedModel: SELECTED_MODEL,
    selectionBasis:
      'Selected based on lower 2025 temporal validation MAE (Random Forest: 4.304 vs Linear Regression: 6.075 across 140 validation records).',
    rows: MODEL_METRICS_ROWS,
  };
  res.json(response);
});

app.post('/api/predict', (req, res) => {
  const body = req.body as {
    playerName?: unknown;
    features?: Record<string, unknown>;
  };

  const playerName =
    typeof body?.playerName === 'string' && body.playerName.trim().length > 0
      ? body.playerName.trim()
      : 'Custom Player Profile';

  if (!body?.features || typeof body.features !== 'object') {
    res.status(400).json({ error: 'Missing required features payload.' });
    return;
  }

  const sanitizedFeatures = {} as Record<FeatureName, number>;
  for (const col of FEATURE_COLUMNS) {
    const rawVal = body.features[col];
    if (rawVal === null || rawVal === undefined || rawVal === '') {
      res.status(400).json({
        error: `Missing value for required feature "${col}". Provide verified statistics for all 16 model inputs before predicting.`,
      });
      return;
    }
    const num = Number(rawVal);
    if (!Number.isFinite(num) || num < 0) {
      res.status(400).json({
        error: `Invalid numeric value for feature "${col}". Expected a non-negative number.`,
      });
      return;
    }
    sanitizedFeatures[col] = num;
  }

  const linearPred = linearModel.predict(sanitizedFeatures);
  const rfPred = randomForestModel.predict(sanitizedFeatures);
  const estimatedPriceCr = SELECTED_MODEL === 'Random Forest' ? rfPred : linearPred;

  const matchedPlayer = PLAYERS_DIRECTORY.find(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );
  const resolvedName = matchedPlayer ? matchedPlayer.name : playerName;
  const imgRecord = getPlayerImageRecord(
    resolvedName,
    matchedPlayer ? matchedPlayer.teamCode : null
  );

  const response: PredictionResponse = {
    playerName: resolvedName,
    role: matchedPlayer ? matchedPlayer.role : 'Unknown',
    team2026: matchedPlayer ? matchedPlayer.team2026 : null,
    teamCode: matchedPlayer ? matchedPlayer.teamCode : null,
    photoUrl: imgRecord ? imgRecord.imagePath : matchedPlayer ? matchedPlayer.photoUrl : null,
    photoAttribution: imgRecord ? imgRecord.attribution : null,
    selectedModel: SELECTED_MODEL,
    estimatedPriceCr,
    linearRegressionPriceCr: linearPred,
    randomForestPriceCr: rfPred,
    featureOrderVerified: true,
    featuresUsed: sanitizedFeatures,
    disclaimer:
      'Estimated value in ₹ Crore generated by trained ML models from the supplied performance inputs. This is an analytical estimate, not an official auction result.',
  };

  res.json(response);
});

async function startServer() {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const distPath = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuctionIQ server running on http://localhost:${PORT}`);
  });
}

startServer();
