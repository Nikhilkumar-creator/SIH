import { describe, it, expect } from 'vitest';
import { apiService } from '../lib/apiService';

describe('API Service Layer (Resilient Store)', () => {
  it('should fetch public research assets', async () => {
    const assets = await apiService.getAssets({ onlyPublic: true });
    expect(assets.length).toBeGreaterThan(0);
    assets.forEach((a) => {
      expect(a.is_public).toBe(true);
    });
  });

  it('should filter assets by polar region', async () => {
    const antarcticAssets = await apiService.getAssets({ region: 'Antarctic' });
    expect(antarcticAssets.length).toBeGreaterThan(0);
  });

  it('should filter assets by classification type', async () => {
    const reports = await apiService.getAssets({ assetType: 'report' });
    expect(reports.length).toBeGreaterThan(0);
    reports.forEach((r) => expect(r.asset_type).toBe('report'));
  });

  it('should filter assets by search keyword', async () => {
    const searchResults = await apiService.getAssets({ query: 'ice' });
    expect(searchResults.length).toBeGreaterThan(0);
  });

  it('should fetch published outreach articles', async () => {
    const articles = await apiService.getArticles();
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach((art) => {
      expect(art.status).toBe('published');
      expect(['article', 'summary']).toContain(art.content_type);
    });
  });

  it('should manage editorial queue status transitions', async () => {
    const queue = await apiService.getContentQueue('all');
    expect(queue.length).toBeGreaterThan(0);
    const firstItem = queue[0];

    const success = await apiService.updateContentStatus(firstItem.id, 'peer_review', 'test-user');
    expect(success).toBe(true);

    const updated = await apiService.getArticleById(firstItem.id);
    expect(updated?.status).toBe('peer_review');
  });

  it('should create new research assets and log an audit entry', async () => {
    const initialAssets = await apiService.getAssets();
    const newAsset = await apiService.createAsset({
      title: 'Automated Test Core Sample',
      description: 'Ice core from East Antarctic Ice Sheet',
      asset_type: 'report',
      file_path: 'uploads/test_core.pdf',
      file_size_bytes: 10240,
      mime_type: 'application/pdf',
      is_public: true,
      is_immutable: false,
    });

    expect(newAsset.id).toBeDefined();
    expect(newAsset.title).toBe('Automated Test Core Sample');

    const updatedAssets = await apiService.getAssets();
    expect(updatedAssets.length).toBe(initialAssets.length + 1);

    const auditLogs = await apiService.getAuditLogs();
    const createdLog = auditLogs.find((l) => l.entity_id === newAsset.id);
    expect(createdLog).toBeDefined();
    expect(createdLog?.action).toBe('create_asset');
  });

  it('should create new expeditions and verify status', async () => {
    const exp = await apiService.createExpedition({
      title: 'Test Arctic Winter Expedition',
      region: 'Arctic',
      start_date: '2025-01-01',
      end_date: null,
      station: 'Himadri',
      description: 'Winter aerosol measurements in Svalbard',
    });

    expect(exp.id).toBeDefined();
    expect(exp.status).toBe('Ongoing');

    const found = await apiService.getExpeditionById(exp.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Test Arctic Winter Expedition');
  });
});
