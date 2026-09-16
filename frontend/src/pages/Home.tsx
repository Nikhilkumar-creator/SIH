import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import type { GeneratedContent } from '../types/domain';
import {
  Database,
  BookOpen,
  ArrowRight,
  Cpu,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [stats, setStats] = useState({
    assetsCount: 0,
    expeditionsCount: 0,
    articlesCount: 0,
    stationsCount: 4,
  });
  const [featuredArticles, setFeaturedArticles] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getAssets(),
      apiService.getExpeditions(),
      apiService.getArticles(),
    ])
      .then(([assets, expeditions, articles]) => {
        setStats({
          assetsCount: assets.length,
          expeditionsCount: expeditions.length,
          articlesCount: articles.length,
          stationsCount: 4,
        });
        setFeaturedArticles(articles.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const domains = [
    {
      title: 'Antarctic Programme',
      region: 'Antarctic',
      stations: 'Maitri (1989) & Bharati (2012)',
      description:
        'Pioneering deep ice-core paleoclimatology, polar geomagnetism, subglacial bedrock mapping, and atmospheric boundary layer studies across East Antarctica.',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      icon: '❄️',
    },
    {
      title: 'Arctic Research',
      region: 'Arctic',
      stations: 'Himadri Base (Ny-Ålesund, Svalbard)',
      description:
        'Continuous monitoring of Arctic Amplification, long-range Black Carbon aerosol transport, Atlantification of polar fjords, and cold-adapted microbial genomics.',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: '🧊',
    },
    {
      title: 'Himalayan Cryosphere',
      region: 'Himalayas',
      stations: 'Himansh Station (4,080m, Spiti)',
      description:
        'High-altitude benchmark monitoring of glacier mass balance, discharge telemetry, and Glacial Lake Outburst Flood (GLOF) hazard mapping across the Third Pole.',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: '🏔️',
    },
    {
      title: 'Southern Ocean Dynamics',
      region: 'Southern Ocean',
      stations: 'ORV Sagar Nidhi & Sagar Kanya',
      description:
        'Multi-depth hydrographic profiling investigating planetary carbon drawdown, Subtropical and Polar fronts, ocean acidification, and Antarctic krill bioacoustics.',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: '🌊',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden polar-gradient-hero text-white shadow-2xl p-8 sm:p-12 lg:p-16 border border-slate-700/50">
        <div className="polar-accent-glow absolute inset-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            National Centre for Polar and Ocean Research
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Unlocking Polar Science Through Open Data & AI Outreach
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Bridging India’s polar expeditions with the global scientific community. Explore peer-reviewed
            datasets, reports, and high-resolution media from Antarctica, the Arctic, the Himalayas, and
            the Southern Ocean, paired with automated outreach intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/repository"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-102"
            >
              <Database className="w-4 h-4" />
              Browse Scientific Repository
            </Link>

            <Link
              to="/articles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Read Science Stories
            </Link>

            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-cyan-300 border border-cyan-800/60 font-semibold text-sm transition-colors"
            >
              <Cpu className="w-4 h-4" />
              AI Ingestion Studio
            </Link>
          </div>
        </div>

        {/* Live Impact Counters */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-700/60">
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
              {stats.assetsCount}+
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Research Assets
            </span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-sky-300 font-mono">
              {stats.expeditionsCount}+
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Polar Expeditions
            </span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
              {stats.articlesCount}+
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Outreach Articles
            </span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
              {stats.stationsCount}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Active Stations
            </span>
          </div>
        </div>
      </section>

      {/* Polar Operational Domains */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
              Operational Focus
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              India’s Polar & Oceanic Frontiers
            </h2>
          </div>
          <Link
            to="/expeditions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-800"
          >
            View all expeditions & stations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {domains.map((domain) => (
            <div
              key={domain.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-cyan-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{domain.icon}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${domain.badgeColor}`}
                  >
                    {domain.region}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{domain.title}</h3>
                <p className="text-xs font-mono text-cyan-700 font-medium mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-600" />
                  {domain.stations}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{domain.description}</p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/repository?region=${encodeURIComponent(domain.region)}`}
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
                >
                  Explore {domain.region} Datasets →
                </Link>
                <Link
                  to={`/expeditions?region=${encodeURIComponent(domain.region)}`}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Missions
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Outreach Stories */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
              Public Science Communication
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Featured Polar Outreach Stories
            </h2>
          </div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-800"
          >
            Browse all science stories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading stories…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-cyan-400 transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-700">
                      {article.content_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString()
                        : 'Published'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2 mb-2">
                    {article.title || 'Polar Science Discovery'}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed mb-4">
                    {article.body}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/articles/${article.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 group-hover:text-cyan-800"
                  >
                    Read full story <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Outreach Pipeline Walkthrough */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
            AI-Assisted Outreach Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">
            How Scientific Documents Become Public Knowledge
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            NCPOR's automated pipeline ingests technical PDF expedition reports and extracts structured
            scientific summaries and multi-format public stories using local Ollama models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
              01
            </span>
            <h4 className="text-sm font-bold text-slate-100">PDF Ingestion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Researchers upload peer-reviewed reports to Supabase Storage with cryptographic hashes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
              02
            </span>
            <h4 className="text-sm font-bold text-slate-100">Local AI Extraction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI + local Llama-3 extracts structured abstracts, topics, and layperson outreach drafts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
              03
            </span>
            <h4 className="text-sm font-bold text-slate-100">Editorial Review</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Editors review accuracy, refine tags, and advance through Peer Review and Admin Approval stages.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
              04
            </span>
            <h4 className="text-sm font-bold text-slate-100">Public Dissemination</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Articles are indexed for semantic search and published with social media variants.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
