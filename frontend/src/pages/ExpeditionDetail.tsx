import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import type { Expedition, ResearchAsset, GeneratedContent } from '../types/domain';
import { AssetCard } from '../components/AssetCard';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Compass,
  Database,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export const ExpeditionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [assets, setAssets] = useState<ResearchAsset[]>([]);
  const [articles, setArticles] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiService.getExpeditionById(id),
      apiService.getAssets({ expeditionId: id, onlyPublic: true }),
      apiService.getArticles(),
    ])
      .then(([exp, assetList, artList]) => {
        setExpedition(exp);
        setAssets(assetList);
        // Filter stories associated with these assets
        const assetIds = new Set(assetList.map((a) => a.id));
        setArticles(artList.filter((a) => assetIds.has(a.asset_id)));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mb-3"></div>
        <p className="text-xs text-slate-500">Retrieving expedition dossier…</p>
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Expedition Not Found</h2>
        <p className="text-xs text-slate-500">The requested polar expedition log does not exist.</p>
        <Link
          to="/expeditions"
          className="inline-block px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold"
        >
          ← Return to Expeditions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/expeditions')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Expeditions
        </button>
      </div>

      {/* Header Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-700">
            {expedition.region}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              expedition.status === 'Ongoing'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {expedition.status === 'Ongoing' ? (
              <Clock className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {expedition.status || 'Completed'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          {expedition.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            {expedition.start_date} {expedition.end_date ? `to ${expedition.end_date}` : '(Ongoing)'}
          </span>
          {expedition.station && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Base: {expedition.station}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-cyan-400" />
            {assets.length} Assets Registered
          </span>
        </div>
      </header>

      {/* Mission Objectives Brief */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-600" /> Mission Briefing & Scientific Scope
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-200/80">
          {expedition.description ||
            'Detailed scientific objectives and logbook entries are archived under the NCPOR expedition repository.'}
        </p>
      </section>

      {/* Primary Research Assets from this Expedition */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-600" /> Expedition Research Assets & Data ({assets.length})
          </h2>
          <Link
            to="/upload"
            className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold"
          >
            + Ingest New Data for this Mission
          </Link>
        </div>

        {assets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No public scientific assets or datasets logged under this mission yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </section>

      {/* Published Outreach Stories linked to this expedition */}
      {articles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-600" /> Published Outreach Articles ({articles.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-cyan-400 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{article.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{article.body}</p>
                </div>
                <Link
                  to={`/articles/${article.id}`}
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 self-start"
                >
                  Read full outreach story →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
