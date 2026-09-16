export type UserRole = 'admin' | 'editor' | 'researcher' | 'visitor';

export type PolarRegion = 'Arctic' | 'Antarctic' | 'Himalayas' | 'Southern Ocean';

export type AssetType = 'report' | 'dataset' | 'publication' | 'photo' | 'video';

export type ContentStatus = 'draft' | 'peer_review' | 'admin_approved' | 'published' | 'rejected';

export type ContentType = 'summary' | 'article' | 'social_x' | 'social_linkedin' | 'social_instagram';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  department?: string;
  created_at?: string;
}

export interface Expedition {
  id: string;
  title: string;
  region: PolarRegion;
  start_date: string;
  end_date?: string | null;
  description?: string;
  created_by?: string;
  created_at?: string;
  // UI helper fields
  asset_count?: number;
  station?: string;
  status?: 'Ongoing' | 'Completed' | 'Upcoming';
}

export interface ResearchAsset {
  id: string;
  title: string;
  description?: string;
  asset_type: AssetType;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  expedition_id?: string | null;
  uploaded_by?: string;
  is_public: boolean;
  is_immutable: boolean;
  created_at: string;
  updated_at?: string;
  // UI joins / enriched fields
  expedition?: Expedition;
  uploader?: Profile;
  generated_summaries?: GeneratedContent[];
}

export interface GeneratedContent {
  id: string;
  asset_id: string;
  content_type: ContentType;
  title?: string;
  body: string;
  tags: string[];
  status: ContentStatus;
  reviewed_by?: string;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // UI helper fields
  reviewer?: Profile;
  asset?: ResearchAsset;
}

export interface AuditLog {
  id: number;
  actor_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  actor_name?: string;
}

export interface PolarStation {
  id: string;
  name: string;
  region: PolarRegion;
  established: number;
  coordinates: string;
  location_name: string;
  operational_status: 'Active' | 'Seasonal' | 'Decommissioned';
  description: string;
  imageUrl?: string;
}

export interface DocumentProcessingResult {
  asset_id: string;
  status: 'success' | 'failed';
  summary: string;
  suggested_tags: string[];
  generated_article: string;
  social_x?: string;
  social_linkedin?: string;
}
