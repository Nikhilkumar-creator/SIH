import React from 'react';
import type { GeneratedContent, ContentStatus } from '../types/domain';

interface Props {
  item: GeneratedContent;
  nextLabel?: ContentStatus;
  onAdvance: () => void;
  onReject: () => void;
}

export const OutreachEditor: React.FC<Props> = ({ item, nextLabel, onAdvance, onReject }) => (
  <article style={{ border: '1px solid #ddd', borderRadius: 6, padding: 15, marginBottom: 12 }}>
    <header style={{ display: 'flex', justifyContent: 'space-between' }}>
      <strong>{item.title ?? item.content_type}</strong>
      <span style={{ fontSize: 12, background: '#f0f0f0', padding: '2px 8px', borderRadius: 4 }}>
        {item.status.replace('_', ' ')}
      </span>
    </header>
    <p style={{ whiteSpace: 'pre-wrap' }}>{item.body}</p>
    {item.tags.length > 0 && (
      <p style={{ fontSize: 12, color: '#666' }}>Tags: {item.tags.join(', ')}</p>
    )}
    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
      {nextLabel && (
        <button onClick={onAdvance}>Move to {nextLabel.replace('_', ' ')}</button>
      )}
      <button onClick={onReject} style={{ color: 'crimson' }}>
        Reject
      </button>
    </div>
  </article>
);
