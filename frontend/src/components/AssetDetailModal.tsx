import React, { useEffect, useState } from 'react';
import type { ResearchAsset, GeneratedContent, Expedition } from '../types/domain';
import { apiService } from '../lib/apiService';
import { Link } from 'react-router-dom';
import {
  X,
  FileText,
  Database,
  Image,
  Video,
  Download,
  Lock,
  Unlock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface Props {
  asset: ResearchAsset | null;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<Props> = ({ asset, onClose }) => {
  const [articles, setArticles] = useState<GeneratedContent[]>([]);
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setLoading(true);
    Promise.all([
      apiService.getArticlesByAssetId(asset.id),
      asset.expedition_id ? apiService.getExpeditionById(asset.expedition_id) : Promise.resolve(null),
    ])
      .then(([artData, expData]) => {
        setArticles(artData);
        setExpedition(expData);
      })
      .finally(() => setLoading(false));
  }, [asset]);

  if (!asset) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'report':
      case 'publication':
        return <FileText className="w-5 h-5 text-cyan-600" />;
      case 'dataset':
        return <Database className="w-5 h-5 text-emerald-600" />;
      case 'photo':
        return <Image className="w-5 h-5 text-amber-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const downloadUrl = asset.file_path.startsWith('http')
    ? asset.file_path
    : supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/research-media/${asset.file_path}`
    : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
              {getAssetIcon(asset.asset_type)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-slate-100 text-slate-700 tracking-wider">
                  {asset.asset_type}
                </span>
                {asset.is_immutable ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Lock className="w-3 h-3" /> Immutable / Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <Unlock className="w-3 h-3" /> Mutable Draft
                  </span>
                )}
                {expedition && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    {expedition.region}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{asset.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Abstract & Scientific Description
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {asset.description || 'No detailed scientific abstract registered for this asset.'}
            </p>
          </div>

          {/* Technical Metadata Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Asset Metadata & Lineage
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-1">File Size</span>
                <span className="font-semibold text-slate-800">{formatBytes(asset.file_size_bytes)}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-1">MIME Type</span>
                <span className="font-mono text-slate-800 truncate block">{asset.mime_type}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-1">Registered</span>
                <span className="font-semibold text-slate-800">
                  {new Date(asset.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-3">
                <span className="text-slate-400 block mb-1">Expedition Association</span>
                {expedition ? (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-800">{expedition.title}</span>
                    <Link
                      to={`/expeditions/${expedition.id}`}
                      className="text-cyan-600 hover:text-cyan-800 flex items-center gap-1 font-medium"
                    >
                      View Mission <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <span className="text-slate-500">Unassigned / General Polar Research</span>
                )}
              </div>
            </div>
          </div>

          {/* Linked AI Outreach Articles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                Linked AI Outreach Articles ({articles.length})
              </h4>
              <Link
                to="/upload"
                className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
              >
                + Generate Outreach from PDF
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500 py-2">Loading generated stories…</p>
            ) : articles.length === 0 ? (
              <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-100 text-xs text-cyan-800">
                No public outreach articles published for this asset yet. Authenticated researchers
                can generate summaries using the AI Ingestion Studio.
              </div>
            ) : (
              <div className="space-y-2">
                {articles.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-cyan-400 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.content_type}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 capitalize">
                          ● {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {item.title || 'Untitled Outreach Draft'}
                      </h5>
                    </div>
                    <Link
                      to={`/articles/${item.id}`}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-50 text-cyan-700 hover:bg-cyan-100 shrink-0 ml-2"
                    >
                      Read Story →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-400 font-mono">ID: {asset.id}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Close
            </button>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Raw Asset
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
