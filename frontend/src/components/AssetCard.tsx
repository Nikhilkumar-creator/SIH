import React from 'react';
import type { ResearchAsset } from '../types/domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

export const AssetCard: React.FC<{ asset: ResearchAsset }> = ({ asset }) => (
  <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#ffffff' }}>
    <span style={{ fontSize: 12, background: '#e2e8f0', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
      {(asset.asset_type || 'DOCUMENT').toUpperCase()}
    </span>
    <h3 style={{ margin: '10px 0 6px', fontSize: 16 }}>{asset.title || 'Untitled Asset'}</h3>
    {asset.description && <p style={{ color: '#475569', fontSize: 14, marginBottom: 10 }}>{asset.description}</p>}
    <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
      Uploaded: {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}
    </p>
    {asset.file_path && (
      <a
        href={supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/research-media/${asset.file_path}` : '#'}
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: 14, fontWeight: 500 }}
      >
        Download / View Asset →
      </a>
    )}
  </div>
);
