export interface IngestResponse {
  status: string;
  filename: string;
  summary: string;
  suggested_tags: string[];
  generated_article: string;
}

export interface HealthResponse {
  status: string;
  supabase_reachable: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
    if (!res.ok) throw new Error(`Backend returned status ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', supabase_reachable: false };
  }
}

export async function ingestPDFDocument(file: File): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BACKEND_URL}/api/ingest`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = 'Failed to ingest PDF document';
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return await res.json();
}
