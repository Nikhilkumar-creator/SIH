import React, { useState } from 'react';
import type { ResearchAsset } from '../types/domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

export const AssetCard: React.FC<{ asset: ResearchAsset }> = ({ asset }) => {
  const [showDetail, setShowDetail] = useState(false);

  const getBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'report':
        return 'badge-cyan';
      case 'dataset':
        return 'badge-emerald';
      case 'media':
        return 'badge-amber';
      default:
        return 'badge-cyan';
    }
  };

  return (
    <>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className={`badge ${getBadgeClass(asset.asset_type)}`}>
            {asset.asset_type.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'Recent'}
          </span>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>
          {asset.title}
        </h3>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: 16,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {asset.description || 'No detailed description provided for this scientific research asset.'}
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
          <button
            className="btn-secondary"
            onClick={() => setShowDetail(true)}
            style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            🔍 View Details
          </button>

          {asset.file_path && (
            <a
              href={supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/research-media/${asset.file_path}` : '#'}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              📥 PDF
            </a>
          )}
        </div>
      </div>

      {/* Asset Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className={`badge ${getBadgeClass(asset.asset_type)}`}>
                {asset.asset_type.toUpperCase()}
              </span>
              <button className="btn-secondary" onClick={() => setShowDetail(false)} style={{ padding: '4px 10px' }}>
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>{asset.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 20, lineHeight: 1.6 }}>
              {asset.description || 'No extended description available.'}
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 14, borderRadius: 8, marginBottom: 20, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Asset Metadata</div>
              <div style={{ fontSize: '0.85rem' }}><strong>Asset ID:</strong> {asset.id}</div>
              <div style={{ fontSize: '0.85rem' }}><strong>Uploaded By:</strong> {asset.uploaded_by || 'NCPOR Scientist'}</div>
              <div style={{ fontSize: '0.85rem' }}><strong>Public Access:</strong> {asset.is_public ? 'Yes (Public)' : 'Restricted'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setShowDetail(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
