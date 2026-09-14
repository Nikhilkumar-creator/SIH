import React, { useEffect, useState } from 'react';
import { supabase, MOCK_RESEARCH_ASSETS } from '../lib/supabaseClient';
import type { ResearchAsset } from '../types/domain';
import { AssetCard } from '../components/AssetCard';
import { IngestModal } from '../components/IngestModal';

export const Repository: React.FC = () => {
  const [assets, setAssets] = useState<ResearchAsset[]>(MOCK_RESEARCH_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  const fetchAssets = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      let request = supabase
        .from('research_assets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (query.trim()) {
        request = request.textSearch('fts_vector', query, { type: 'websearch', config: 'english' });
      }

      const { data, error: err } = await request;
      if (!err && data && data.length > 0) {
        setAssets(data as ResearchAsset[]);
      } else {
        // Fallback to mock data if database is empty or offline
        let filtered = MOCK_RESEARCH_ASSETS;
        if (query.trim()) {
          const q = query.toLowerCase();
          filtered = filtered.filter(
            (a) => a.title.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q))
          );
        }
        setAssets(filtered);
      }
    } catch (err) {
      console.warn('Using fallback repository data due to database error.');
      setAssets(MOCK_RESEARCH_ASSETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets('');
  }, []);

  const filteredAssets = assets.filter((asset) => {
    if (selectedType === 'all') return true;
    return asset.asset_type.toLowerCase() === selectedType.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>NCPOR Scientific Repository</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Open access polar research reports, expedition datasets, and satellite observations.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsIngestOpen(true)}>
          ⚡ Ingest PDF Report
        </button>
      </div>

      {/* Search Bar & Filters */}
      <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAssets(searchQuery);
          }}
          style={{ display: 'flex', gap: 12 }}
        >
          <input
            type="text"
            className="input-field"
            aria-label="Search research reports, datasets, media"
            placeholder="Search expedition reports, ice core datasets, glaciology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        {/* Category Filter Tabs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['all', 'report', 'dataset', 'media'].map((type) => (
            <button
              key={type}
              className="btn-secondary"
              onClick={() => setSelectedType(type)}
              style={{
                padding: '6px 14px',
                fontSize: '0.85rem',
                borderColor: selectedType === type ? 'var(--accent-cyan)' : 'var(--border-light)',
                background: selectedType === type ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedType === type ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} /> Loading scientific repository...
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>No Assets Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No research assets match your search criteria. Try clearing filters or ingesting a new PDF report.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Ingest Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSuccess={() => fetchAssets('')}
      />
    </div>
  );
};
