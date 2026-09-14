import { createClient } from '@supabase/supabase-js';
import type { ResearchAsset, GeneratedContent } from '../types/domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Operating with fallback client.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const MOCK_RESEARCH_ASSETS: ResearchAsset[] = [
  {
    id: 'ast-001',
    title: 'Indian Antarctic Expedition XXXXII: Glaciology & Ice Core Analysis',
    description: 'High-resolution climate record extracted from 150m ice core drilled at Himadri Station, Antarctica.',
    asset_type: 'report',
    file_path: 'antarctic_glaciology_2025.pdf',
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    uploaded_by: 'dr_sharma',
  },
  {
    id: 'ast-002',
    title: 'Arctic Ocean Microplastic Accumulation Study 2024-2025',
    description: 'Multi-seasonal sampling of sea surface microplastics in Svalbard fjords.',
    asset_type: 'dataset',
    file_path: 'arctic_microplastics.csv',
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    uploaded_by: 'dr_divya',
  },
  {
    id: 'ast-003',
    title: 'Southern Ocean Biogeochemical Cycling and Phytoplankton Dynamics',
    description: 'Satellite remote sensing combined with autonomous biogeochemical Argo float observations.',
    asset_type: 'report',
    file_path: 'southern_ocean_biogeochem.pdf',
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    uploaded_by: 'dr_nikhil',
  },
];

export const MOCK_GENERATED_CONTENT: GeneratedContent[] = [
  {
    id: 'gc-001',
    asset_id: 'ast-001',
    content_type: 'summary',
    title: 'Outreach Summary: Antarctic Glaciology Ice Core Discoveries',
    body: '• Deep ice core sampling reveals 10,000-year atmospheric composition history.\n• Isotope ratios indicate accelerated warming trends in Queen Maud Land over the past 50 years.\n• Microscopic dust particles trace ancient atmospheric circulation patterns.',
    tags: ['Antarctica', 'Glaciology', 'Climate', 'Ice Core', 'NCPOR'],
    status: 'draft',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'gc-002',
    asset_id: 'ast-002',
    content_type: 'article',
    title: 'Unveiling Arctic Microplastic Contamination in Svalbard Fjords',
    body: 'Polar scientists at NCPOR have uncovered surprising concentrations of microplastic particles in remote Arctic fjords. Using automated water sampling instruments during the 2024 Svalbard Expedition, researchers tracked ocean current transport mechanisms bringing synthetic polymers into fragile polar food webs.',
    tags: ['Arctic', 'Microplastics', 'Oceanography', 'Environment'],
    status: 'peer_review',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];
