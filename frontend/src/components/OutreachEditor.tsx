import React, { useState } from 'react';
import type { GeneratedContent, ContentStatus } from '../types/domain';

interface OutreachEditorProps {
  item: GeneratedContent;
  nextLabel?: ContentStatus;
  onAdvance: () => void;
  onReject: () => void;
}

export const OutreachEditor: React.FC<OutreachEditorProps> = ({ item, nextLabel, onAdvance, onReject }) => {
  const [activeTab, setActiveTab] = useState<'article' | 'tags'>('article');

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return <span className="badge badge-cyan">Draft</span>;
      case 'peer_review':
        return <span className="badge badge-amber">Peer Review</span>;
      case 'admin_approved':
        return <span className="badge badge-emerald">Admin Approved</span>;
      case 'published':
        return <span className="badge badge-emerald">Published</span>;
      case 'rejected':
        return <span className="badge badge-rose">Rejected</span>;
      default:
        return <span className="badge badge-cyan">{status}</span>;
    }
  };

  return (
    <article className="glass-card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {getStatusBadge(item.status)}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Type: {item.content_type.toUpperCase()} • ID: {item.id}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
        </span>
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, color: '#ffffff' }}>
        {item.title || 'Outreach Draft Article'}
      </h3>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-light)', marginBottom: 14 }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'article' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            color: activeTab === 'article' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            padding: '6px 12px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onClick={() => setActiveTab('article')}
        >
          📄 Article Body
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'tags' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            color: activeTab === 'tags' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            padding: '6px 12px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onClick={() => setActiveTab('tags')}
        >
          🏷️ Tags ({item.tags.length})
        </button>
      </div>

      {activeTab === 'article' ? (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: 16,
            borderRadius: 8,
            border: '1px solid var(--border-light)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            marginBottom: 16,
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {item.body}
        </div>
      ) : (
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {item.tags.map((tag, idx) => (
            <span key={idx} className="badge badge-cyan">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Workflow Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
        <button className="btn-danger" onClick={onReject}>
          ✕ Reject Content
        </button>
        {nextLabel && (
          <button className="btn-primary" onClick={onAdvance}>
            ➡️ Advance to {nextLabel.replace('_', ' ')}
          </button>
        )}
      </div>
    </article>
  );
};
