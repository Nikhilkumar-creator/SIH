import React, { useState } from 'react';
import { ingestPDFDocument, IngestResponse } from '../lib/api';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: IngestResponse) => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResponse | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF documents (.pdf) are supported.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleIngest = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const response = await ingestPDFDocument(file);
      setResult(response);
      if (onSuccess) onSuccess(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to ingest PDF document. Ensure backend service is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {result ? 'AI Outreach Content Generated' : 'Ingest Polar Research PDF'}
          </h3>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 12px' }}>
            ✕
          </button>
        </div>

        {!result ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
              Upload a scientific report or expedition PDF. Local Ollama LLM will extract text and automatically generate an executive summary, outreach article draft, and scientific tags.
            </p>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 20px',
                border: '2px dashed var(--border-glow)',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.5)',
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: '2.5rem', marginBottom: 10 }}>📄</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-ice)' }}>
                {file ? file.name : 'Click to select or drag PDF file here'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Max file size: 50MB (.pdf)
              </span>
              <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose)',
                  marginBottom: 20,
                  fontSize: '0.9rem',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleIngest} disabled={!file || loading}>
                {loading ? (
                  <>
                    <div className="spinner" /> Processing PDF with Ollama...
                  </>
                ) : (
                  '⚡ Process & Generate Outreach'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: 'var(--accent-emerald)',
                marginBottom: 20,
                fontSize: '0.9rem',
              }}
            >
              ✓ Document <strong>{result.filename}</strong> successfully processed!
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8 }}>📌 Executive Summary</h4>
              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                }}
              >
                {result.summary}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: 'var(--accent-ice)', marginBottom: 8 }}>🏷️ Suggested Tags</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.suggested_tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-cyan">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8 }}>📰 Draft Outreach Article</h4>
              <div
                style={{
                  fontSize: '0.9rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  lineHeight: 1.6,
                }}
              >
                {result.generated_article}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button className="btn-secondary" onClick={handleReset}>
                🔄 Ingest Another PDF
              </button>
              <button className="btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
