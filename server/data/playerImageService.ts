import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.resolve(__dirname, 'playerImages.json');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

export interface PlayerImageRecord {
  playerId: string;
  playerName: string;
  team2026: string | null;
  teamCode: string | null;
  imagePath: string;
  jerseyContext: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  attribution: string;
  description?: string;
  verified: boolean;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadRegistryFromDisk(): Record<string, PlayerImageRecord> {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) return {};
    const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, PlayerImageRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function assetExists(imagePath: string): boolean {
  if (!imagePath) return false;
  const rel = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullPath = path.resolve(PUBLIC_DIR, rel);
  return fullPath.startsWith(PUBLIC_DIR) && fs.existsSync(fullPath);
}

export function getPlayerImageRecord(
  playerNameOrId: string,
  expectedTeamCode?: string | null
): PlayerImageRecord | null {
  const registry = loadRegistryFromDisk();
  const slug = toSlug(playerNameOrId);
  const direct = registry[slug];

  const candidate =
    direct ||
    Object.values(registry).find(
      (entry) =>
        entry.playerName.toLowerCase() === playerNameOrId.trim().toLowerCase() ||
        entry.playerId === slug
    );

  if (!candidate || !candidate.verified) return null;

  // Enforce team-jersey safety: if the registry entry specifies an IPL jersey for a different team, reject it
  if (
    expectedTeamCode &&
    candidate.teamCode &&
    candidate.jerseyContext.toLowerCase().includes('ipl jersey') &&
    candidate.teamCode !== expectedTeamCode
  ) {
    return null;
  }

  if (!assetExists(candidate.imagePath)) {
    return null;
  }

  return candidate;
}

export function getAllVerifiedPlayerImages(): PlayerImageRecord[] {
  const registry = loadRegistryFromDisk();
  return Object.values(registry).filter(
    (entry) => entry.verified && assetExists(entry.imagePath)
  );
}
