import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IngestModal } from '../components/IngestModal';
import { MOCK_RESEARCH_ASSETS } from '../lib/supabaseClient';
import { AssetCard } from '../components/AssetCard';

export const Home: React.FC = () => {
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40 }}>
      {/* Hero Section */}
      <section className="glass-panel" style={{ padding: '48px 36px', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 720 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>
            National Centre for Polar and Ocean Research
          </span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            Accelerating Polar Science <br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-ice))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Public Outreach with AI
            </span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            Transforming Indian Antarctic, Arctic, and Southern Ocean expedition reports into accessible public science articles using local, zero-cloud LLM intelligence.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setIsIngestOpen(true)} style={{ padding: '12px 24px', fontSize: '1rem' }}>
              ⚡ Ingest Scientific PDF Document
            </button>
            <Link to="/repository" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Explore Repository →
            </Link>
          </div>
        </div>
      </section>

      {/* Polar Research Stats Counter */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>42+</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            Antarctic Expeditions
          </div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-ice)' }}>1,420+</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            Research Datasets & Reports
          </div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>350+</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            AI Outreach Articles Drafted
          </div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-amber)' }}>100%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            Zero-Cloud Privacy Locked
          </div>
        </div>
      </section>

      {/* Featured Polar Research Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Featured Research Assets</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Latest open access expedition reports from Bharti, Maitri, and Himadri stations.
            </p>
          </div>
          <Link to="/repository" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            View All Assets →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {MOCK_RESEARCH_ASSETS.slice(0, 3).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* Ingest Modal Trigger */}
      <IngestModal isOpen={isIngestOpen} onClose={() => setIsIngestOpen(false)} />
    </div>
  );
};
