import { describe, it, expect } from 'vitest';
import {
  MOCK_STATIONS,
  MOCK_EXPEDITIONS,
  MOCK_ASSETS,
  MOCK_GENERATED_CONTENT,
  MOCK_AUDIT_LOGS,
} from '../lib/mockData';

describe('Domain Models & Data Integrity', () => {
  it('should have 4 permanent Indian polar research stations', () => {
    expect(MOCK_STATIONS).toHaveLength(4);
    const stationIds = MOCK_STATIONS.map((s) => s.id);
    expect(stationIds).toContain('maitri');
    expect(stationIds).toContain('bharati');
    expect(stationIds).toContain('himadri');
    expect(stationIds).toContain('himansh');
  });

  it('should cover all four operational polar regions', () => {
    const regions = new Set(MOCK_EXPEDITIONS.map((e) => e.region));
    expect(regions.has('Antarctic')).toBe(true);
    expect(regions.has('Arctic')).toBe(true);
    expect(regions.has('Himalayas')).toBe(true);
    expect(regions.has('Southern Ocean')).toBe(true);
  });

  it('should contain valid research asset metadata with types and file sizes', () => {
    expect(MOCK_ASSETS.length).toBeGreaterThan(0);
    MOCK_ASSETS.forEach((asset) => {
      expect(asset.id).toBeDefined();
      expect(asset.title).toBeTruthy();
      expect(['report', 'dataset', 'publication', 'photo', 'video']).toContain(asset.asset_type);
      expect(asset.file_size_bytes).toBeGreaterThan(0);
      expect(asset.file_path).toBeTruthy();
      expect(typeof asset.is_public).toBe('boolean');
      expect(typeof asset.is_immutable).toBe('boolean');
    });
  });

  it('should contain editorial generated content with valid statuses', () => {
    expect(MOCK_GENERATED_CONTENT.length).toBeGreaterThan(0);
    const validStatuses = ['draft', 'peer_review', 'admin_approved', 'published', 'rejected'];
    MOCK_GENERATED_CONTENT.forEach((content) => {
      expect(validStatuses).toContain(content.status);
      expect(content.body).toBeTruthy();
      expect(Array.isArray(content.tags)).toBe(true);
    });
  });

  it('should maintain an audit trail for critical system actions', () => {
    expect(MOCK_AUDIT_LOGS.length).toBeGreaterThan(0);
    MOCK_AUDIT_LOGS.forEach((log) => {
      expect(log.id).toBeDefined();
      expect(log.action).toBeTruthy();
      expect(log.entity).toBeTruthy();
      expect(log.created_at).toBeTruthy();
    });
  });
});
