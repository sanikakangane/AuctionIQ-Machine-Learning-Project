import React from 'react';
import { BrainCircuit, Code2, Compass, Layers, Target } from 'lucide-react';
import { BrandStarIcon } from '../components/Sidebar';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C6FF00]">
          <BrandStarIcon className="h-3.5 w-3.5" />
          <span>Project Documentation</span>
        </div>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
          ABOUT AUCTIONIQ.
        </h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          IPL Player Auction Price Prediction Using Machine Learning
        </p>
      </div>

      {/* Project Overview & Objective */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="rounded-2xl bg-[#0B39E8] p-6 text-white">
          <div className="flex items-center gap-2.5 text-[#C6FF00]">
            <Layers className="h-5 w-5" />
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              Project Overview
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            AuctionIQ is a sports analytics college mini-project that connects historical
            IPL ball-by-ball match performance with franchise auction selling prices. By
            mapping each player&apos;s preceding season performance to their subsequent
            auction outcome, the application turns raw cricket telemetry into an
            interactive ₹ Crore valuation tool.
          </p>
        </section>

        <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
          <div className="flex items-center gap-2.5 text-[#C6FF00]">
            <Target className="h-5 w-5" />
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              Objective
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#B3B3B3]">
            Provide an honest, transparent interface where users can search IPL players,
            inspect verified 2026 performance statistics without fabricated missing
            values, edit inputs cleanly, and compare auction price estimates produced by
            two classical regression algorithms.
          </p>
        </section>
      </div>

      {/* Algorithms */}
      <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
        <div className="flex items-center gap-2.5 text-[#C6FF00]">
          <BrainCircuit className="h-5 w-5" />
          <h2 className="font-display text-2xl font-bold uppercase text-white">
            Machine Learning Algorithms
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-[#2E2E2E] bg-[#141414] p-5">
            <h3 className="font-display text-xl font-bold uppercase text-white">
              Linear Regression
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#B3B3B3]">
              A standardized linear baseline that fits additive weights across the 16
              batting, bowling, and match-involvement features. It offers clear linear
              interpretability, though extreme auction bidding spikes can reduce fit
              accuracy on validation records.
            </p>
          </div>

          <div className="rounded-xl border border-[#C6FF00]/50 bg-[#141414] p-5">
            <h3 className="font-display text-xl font-bold uppercase text-[#C6FF00]">
              Random Forest Regressor
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#B3B3B3]">
              An ensemble of bootstrap-sampled decision trees capable of capturing
              non-linear interactions (such as high strike-rate power hitters or
              low-economy wicket-takers). Selected as the primary model based on lower
              2025 temporal validation MAE.
            </p>
          </div>
        </div>
      </section>

      {/* Technologies & Future Scope */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="rounded-2xl bg-[#F4F4F2] p-6 text-[#141414]">
          <div className="flex items-center gap-2.5 text-[#0B39E8]">
            <Code2 className="h-5 w-5" />
            <h2 className="font-display text-2xl font-bold uppercase">
              Technologies Used
            </h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-[#404040]">
            <li>Frontend: React, TypeScript, Tailwind CSS, Lucide Icons</li>
            <li>Backend API: Node.js, Express, REST JSON endpoints</li>
            <li>
              ML Pipeline: 16-feature StandardScaler + Linear Regression &amp; Random
              Forest
            </li>
            <li>
              Data Sources: IPL ball-by-ball deliveries, match sheets &amp; 2023–2026
              auction CSVs
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[#262626] bg-[#1C1C1C] p-6">
          <div className="flex items-center gap-2.5 text-[#C6FF00]">
            <Compass className="h-5 w-5" />
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              Brief Future Scope
            </h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-[#B3B3B3]">
            <li>Incorporate full-season completion once all IPL 2026 matches conclude.</li>
            <li>
              Model franchise purse constraints, retention rules, and overseas slot
              scarcity.
            </li>
            <li>
              Include recent international T20I form and death-overs / powerplay splits.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
