import React from 'react';
import type { ResearchAsset } from '../types/domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

export const AssetCard: React.FC<{ asset: ResearchAsset }> = ({ asset }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 15 }}>
    <span style={{ fontSize: 12, background: '#eee', padding: '3px 8px', borderRadius: 4 }}>
      {asset.asset_type.toUpperCase()}
    </span>
    <h3 style={{ margin: '10px 0 5px' }}>{asset.title}</h3>
    {asset.description && <p style={{ color: '#555', fontSize: 14 }}>{asset.description}</p>}
    <p style={{ color: '#888', fontSize: 12 }}>
      Uploaded: {new Date(asset.created_at).toLocaleDateString()}
    </p>
    <a
      href={`${supabaseUrl}/storage/v1/object/public/research-media/${asset.file_path}`}
      target="_blank"
      rel="noreferrer"
    >
      Download / View Asset →
    </a>
  </div>
);
