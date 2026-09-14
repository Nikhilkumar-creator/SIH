export type UserRole = 'admin' | 'editor' | 'researcher' | 'public';

export interface Profile {
  id: string;
  full_name?: string;
  role: UserRole;
  department?: string;
  created_at?: string;
}

export interface ResearchAsset {
  id: string;
  title: string;
  description?: string;
  asset_type: string;
  file_path: string;
  is_public: boolean;
  created_at: string;
  uploaded_by?: string;
}

export type ContentStatus = 'draft' | 'peer_review' | 'admin_approved' | 'published' | 'rejected';

export interface GeneratedContent {
  id: string;
  asset_id: string;
  content_type: string;
  title?: string;
  body: string;
  tags: string[];
  status: ContentStatus;
  reviewed_by?: string;
  published_at?: string | null;
  created_at?: string;
}
