import React, { useEffect, useState } from 'react';
import { supabase, MOCK_GENERATED_CONTENT } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthProvider';
import type { ContentStatus, GeneratedContent } from '../types/domain';
import { OutreachEditor } from '../components/OutreachEditor';

const NEXT_STATUS: Record<ContentStatus, ContentStatus | null> = {
  draft: 'peer_review',
  peer_review: 'admin_approved',
  admin_approved: 'published',
  published: null,
  rejected: null,
};

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [items, setItems] = useState<GeneratedContent[]>(MOCK_GENERATED_CONTENT);
  const [activeStage, setActiveStage] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('generated_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (!err && data && data.length > 0) {
        setItems(data as GeneratedContent[]);
      } else {
        setItems(MOCK_GENERATED_CONTENT);
      }
    } catch (err) {
      console.warn('Using fallback workflow data.');
      setItems(MOCK_GENERATED_CONTENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (item: GeneratedContent) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    if (next === 'published' && profile?.role !== 'admin') {
      setError('Only an administrator can publish articles to the public site.');
      return;
    }

    try {
      const { error: err } = await supabase
        .from('generated_content')
        .update({
          status: next,
          reviewed_by: profile?.id,
          published_at: next === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', item.id);

      if (err) {
        // Optimistic update fallback for demo mode
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: next } : i))
        );
      } else {
        load();
      }
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: next } : i))
      );
    }
  };

  const reject = async (item: GeneratedContent) => {
    try {
      const { error: err } = await supabase
        .from('generated_content')
        .update({ status: 'rejected', reviewed_by: profile?.id })
        .eq('id', item.id);

      if (err) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'rejected' } : i))
        );
      } else {
        load();
      }
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'rejected' } : i))
      );
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeStage === 'all') return true;
    return item.status === activeStage;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Dashboard Title & Metrics */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
          Editorial Workflow Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Review, edit, and approve AI-generated outreach articles from Draft to Publication.
        </p>
      </div>

      {/* Stage Counter Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DRAFTS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {items.filter((i) => i.status === 'draft').length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PEER REVIEW</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            {items.filter((i) => i.status === 'peer_review').length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ADMIN APPROVED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {items.filter((i) => i.status === 'admin_approved').length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PUBLISHED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-ice)' }}>
            {items.filter((i) => i.status === 'published').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'draft', 'peer_review', 'admin_approved', 'published', 'rejected'].map((stage) => (
          <button
            key={stage}
            className="btn-secondary"
            onClick={() => setActiveStage(stage)}
            style={{
              padding: '6px 14px',
              fontSize: '0.85rem',
              borderColor: activeStage === stage ? 'var(--accent-cyan)' : 'var(--border-light)',
              background: activeStage === stage ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeStage === stage ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            }}
          >
            {stage.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            fontSize: '0.9rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Workflow Queue Items */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} /> Loading editorial review queue...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎉</div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>Queue Empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No articles currently matching stage: <strong>{activeStage.replace('_', ' ')}</strong>.
          </p>
        </div>
      ) : (
        filteredItems.map((item) => (
          <OutreachEditor
            key={item.id}
            item={item}
            nextLabel={NEXT_STATUS[item.status] ?? undefined}
            onAdvance={() => advance(item)}
            onReject={() => reject(item)}
          />
        ))
      )}
    </div>
  );
};
