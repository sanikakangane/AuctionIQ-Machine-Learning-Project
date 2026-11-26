import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { BrandStarIcon } from '../components/Sidebar';
import type { MetadataResponse } from '../types/auctioniq';

interface DatasetInfoPageProps {
  metadata: MetadataResponse | null;
}

export const DatasetInfoPage: React.FC<DatasetInfoPageProps> = ({ metadata }) => {
  const coverage = metadata?.coverage;
  const rawFiles = metadata?.datasets.filter((d) => d.category === 'Raw Dataset') ?? [];
  const processedFiles =
    metadata?.datasets.filter((d) => d.category === 'Processed Output') ?? [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C6FF00]">
          <BrandStarIcon className="h-3.5 w-3.5" />
          <span>Data Architecture</span>
        </div>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
          DATASET INFORMATION.
        </h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          Source datasets, historical season mapping, 16-feature model schema, and 2026 extract coverage details.
        </p>
      </div>

      {/* Coverage Counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-5">
          <div className="text-xs font-medium text-[#A3A3A3]">2026 Delivery Records</div>
          <div className="mt-2 font-mono-num text-3xl font-bold text-white">
            {(coverage?.deliveryRecords2026 ?? 10021).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#A3A3A3]">Ball-by-ball extract rows</div>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-5">
          <div className="text-xs font-medium text-[#A3A3A3]">2026 Matches Covered</div>
          <div className="mt-2 font-mono-num text-3xl font-bold text-white">
            {coverage?.matches2026 ?? 43}
          </div>
          <div className="mt-1 text-xs text-[#A3A3A3]">Partial season match extract</div>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-5">
          <div className="text-xs font-medium text-[#A3A3A3]">Unique Player Directory</div>
          <div className="mt-2 font-mono-num text-3xl font-bold text-white">
            {coverage?.uniquePlayersDirectory ?? 731}
          </div>
          <div className="mt-1 text-xs text-[#A3A3A3]">
            {coverage?.searchableProfilesLoaded ?? 62} searchable profiles loaded
          </div>
        </div>

        <div className="rounded-2xl bg-[#0B39E8] p-5 text-white">
          <div className="text-xs font-medium text-white/85">Players With 2026 Stats</div>
          <div className="mt-2 font-mono-num text-3xl font-bold text-[#C6FF00]">
            {coverage?.playersWith2026Stats ?? 174}
          </div>
          <div className="mt-1 text-xs text-white/85">Verified via has_2026_stats</div>
        </div>
      </div>

      {/* Coverage Limitation Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-[#C6FF00]/45 bg-[#1C1C1C] p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#C6FF00]" />
        <div className="text-sm leading-relaxed text-[#B3B3B3]">
          <span className="font-semibold text-white">Data Coverage Limitations: </span>
          {coverage?.coverageNote ??
            'The supplied 2026 raw performance extract contains 10,021 delivery records across 43 matches (174 players with available 2026 statistics out of 731 directory records). Missing player statistics are marked Unavailable rather than filled with arbitrary zeros.'}
        </div>
      </div>

      {/* Season Mapping & Model Features */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 rounded-2xl border border-[#262626] bg-[#1C1C1C] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#2E2E2E] bg-[#141414] px-5 py-4">
            <Calendar className="h-4 w-4 text-[#C6FF00]" />
            <h2 className="font-display text-xl font-bold uppercase text-white">
              Historical Season Mapping
            </h2>
          </div>
          <div className="p-5">
            <p className="text-xs leading-relaxed text-[#A3A3A3]">
              Each auction label is paired strictly with the player&apos;s immediately
              preceding IPL performance season to prevent future data leakage.
            </p>
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2E2E2E] text-xs text-[#A3A3A3]">
                  <th className="py-2.5 font-medium">Auction Season</th>
                  <th className="py-2.5 font-medium text-right">
                    Previous Performance Season
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {(metadata?.seasonMapping ?? []).map((row) => (
                  <tr key={row.auctionSeason}>
                    <td className="py-2.5 font-mono-num font-bold text-white">
                      {row.auctionSeason}
                    </td>
                    <td className="py-2.5 text-right font-mono-num font-bold text-[#C6FF00]">
                      {row.performanceSeason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-7 rounded-2xl border border-[#262626] bg-[#1C1C1C] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#2E2E2E] bg-[#141414] px-5 py-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4C73FF]" />
              <h2 className="font-display text-xl font-bold uppercase text-white">
                Exact 16-Feature Model Schema
              </h2>
            </div>
            <span className="font-mono-num text-xs text-[#A3A3A3]">Ordered Vector</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(metadata?.featureColumns ?? []).map((col, idx) => (
                <div
                  key={col}
                  className="flex items-center justify-between rounded-lg border border-[#2E2E2E] bg-[#141414] px-3 py-2 text-xs"
                >
                  <span className="font-mono-num text-white">{col}</span>
                  <span className="font-mono-num text-[#C6FF00]">#{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Preprocessing Steps */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#C6FF00]" />
          <h2 className="font-display text-xl font-bold uppercase text-white">
            Basic Preprocessing Pipeline
          </h2>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {(metadata?.preprocessingSteps ?? []).map((step) => (
            <li
              key={step}
              className="rounded-xl border border-[#2E2E2E] bg-[#141414] px-4 py-3 text-xs leading-relaxed text-[#B3B3B3]"
            >
              {step}
            </li>
          ))}
        </ul>
      </section>

      {/* Supplied Datasets & Generated Outputs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#4C73FF]" />
            <h2 className="font-display text-xl font-bold uppercase text-white">
              Original Source Datasets
            </h2>
          </div>
          <div className="mt-4 space-y-2.5">
            {rawFiles.map((file) => (
              <div
                key={file.name}
                className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5"
              >
                <div className="font-mono-num text-xs font-bold text-white">
                  {file.name}
                </div>
                <p className="mt-1 text-xs text-[#A3A3A3]">{file.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#C6FF00]" />
            <h2 className="font-display text-xl font-bold uppercase text-white">
              Processed Pipeline Outputs
            </h2>
          </div>
          <div className="mt-4 space-y-2.5">
            {processedFiles.map((file) => (
              <div
                key={file.name}
                className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-3.5"
              >
                <div className="font-mono-num text-xs font-bold text-white">
                  {file.name}
                </div>
                <p className="mt-1 text-xs text-[#A3A3A3]">{file.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
