import React, { useState } from 'react';
import type { ResearchAsset } from '../types/domain';
import { AssetDetailModal } from './AssetDetailModal';
import {
  FileText,
  Database,
  Image,
  Video,
  Download,
  Lock,
  Calendar,
} from 'lucide-react';

interface Props {
  asset: ResearchAsset;
}

export const AssetCard: React.FC<Props> = ({ asset }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const downloadUrl = asset.file_path?.startsWith('http')
    ? asset.file_path
    : supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/research-media/${asset.file_path}`
    : '#';

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAssetBadge = (type: string) => {
    switch (type) {
      case 'report':
        return {
          icon: FileText,
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          label: 'Report',
        };
      case 'dataset':
        return {
          icon: Database,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Dataset',
        };
      case 'publication':
        return {
          icon: FileText,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Publication',
        };
      case 'photo':
        return {
          icon: Image,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Photo',
        };
      case 'video':
        return {
          icon: Video,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Video',
        };
      default:
        return {
          icon: FileText,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: type,
        };
    }
  };

  const badge = getAssetBadge(asset.asset_type);
  const Icon = badge.icon;

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 group">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {badge.label}
            </span>

            <div className="flex items-center gap-1.5">
              {asset.is_immutable && (
                <span
                  title="Immutable Official Publication"
                  className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px]"
                >
                  <Lock className="w-3 h-3" />
                </span>
              )}
              <span className="text-[11px] font-mono text-slate-400">
                {formatBytes(asset.file_size_bytes)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => setModalOpen(true)}
            className="text-base font-bold text-slate-900 group-hover:text-cyan-600 cursor-pointer line-clamp-2 mb-2 leading-snug transition-colors"
          >
            {asset.title || 'Untitled Research Asset'}
          </h3>

          {/* Description Excerpt */}
          <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            {asset.description || 'No detailed abstract recorded for this dataset.'}
          </p>
        </div>

        {/* Footer info & action links */}
        <div className="pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}
            </span>
            <span className="font-mono text-[11px] truncate max-w-[110px]">
              {asset.mime_type?.split('/')[1] || 'binary'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-center transition-colors cursor-pointer"
            >
              Details & AI Summary
            </button>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              download
              title="Direct Download"
              className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {modalOpen && <AssetDetailModal asset={asset} onClose={() => setModalOpen(false)} />}
    </>
  );
};
