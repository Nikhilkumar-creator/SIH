# NCPOR Polar Science Outreach Portal — System Diagrams & Flowcharts

This document provides visual diagrams and flowcharts for the **NCPOR Polar Science Outreach Platform (Icebound)**. All diagrams use standard [Mermaid.js](https://mermaid.js.org/) syntax and render natively in GitHub, GitLab, VS Code, and modern Markdown viewers.

---

## Table of Contents
1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [End-to-End User Flow & Journey Maps](#2-end-to-end-user-flow--journey-maps)
3. [AI Document Ingestion & Transformation Sequence](#3-ai-document-ingestion--transformation-sequence)
4. [Editorial Content Lifecycle State Machine](#4-editorial-content-lifecycle-state-machine)
5. [Role-Based Access Control (RBAC) & Security Architecture](#5-role-based-access-control-rbac--security-architecture)
6. [Database Entity-Relationship (ER) Diagram](#6-database-entity-relationship-er-diagram)
7. [Deployment & Network Infrastructure Topology](#7-deployment--network-infrastructure-topology)

---

## 1. High-Level System Architecture

The NCPOR platform is organized into 4 distinct operational tiers designed for air-gapped security, zero external data leakage, and high performance.

```mermaid
flowchart TB
    subgraph ClientTier["Client Tier (Browser)"]
        UI["React 18 + Vite SPA"]
        Router["React Router v6"]
        Tailwind["Tailwind CSS + Lucide Icons"]
        AuthCtx["AuthProvider (JWT & Role State)"]
        APIService["apiService.ts (Resilient API Client)"]
        UI --> Router
        Router --> Tailwind
        Router --> AuthCtx
        AuthCtx --> APIService
    end

    subgraph APITier["API Gateway & Ingestion Tier (FastAPI)"]
        FastAPIApp["FastAPI Service (:8000)"]
        JWTVerify["Auth Middleware (Supabase JWT Secret)"]
        RateLimit["Rate Limiter (SlowAPI in-memory)"]
        PDFEngine["PDF Extractor (pypdf + chunker)"]
        DocRouter["POST /api/v1/process-document"]
        FastAPIApp --> JWTVerify
        JWTVerify --> RateLimit
        RateLimit --> DocRouter
        DocRouter --> PDFEngine
    end

    subgraph AIEngineTier["Local AI Engine Tier (Ollama)"]
        OllamaApp["Ollama Local Daemon (:11434)"]
        LLM["Llama 3 (JSON Structured Generation)"]
        Embedder["Nomic-Embed-Text (768-dim Embeddings)"]
        OllamaApp --> LLM
        OllamaApp --> Embedder
    end

    subgraph DataStorageTier["Database & Storage Tier (Supabase)"]
        SupaAuth["Supabase Auth (Users & Sessions)"]
        PostgresDB[("PostgreSQL 15 + pgvector")]
        RLSPolicies["Row-Level Security (RLS) Engine"]
        StorageBucket["Supabase Storage (research-media Bucket)"]
        PostgresDB --- RLSPolicies
    end

    %% Interactions
    APIService -->|"1. Direct Public Reads & Auth"| SupaAuth
    APIService -->|"2. RLS-Gated Queries"| PostgresDB
    APIService -->|"3. Binary Upload / Download"| StorageBucket
    APIService -->|"4. Ingestion & AI Trigger"| FastAPIApp

    PDFEngine -->|"5. Text Chunks & System Prompt"| OllamaApp
    OllamaApp -->|"6. Structured JSON (Summary, Article, Tags)"| PDFEngine

    FastAPIApp -->|"7. Persist Content & Vectors (Service Role - Bypasses RLS)"| PostgresDB
```

---

## 2. End-to-End User Flow & Journey Maps

The platform caters to 4 distinct user roles: **Public Visitor**, **Researcher**, **Editor**, and **Administrator**.

```mermaid
flowchart TD
    Start([User Arrives at Platform]) --> RoleCheck{User Authenticated?}

    %% Public Flow
    RoleCheck -->|No / Anonymous| PublicFlow[Public Visitor Flow]
    PublicFlow --> Home[Home Page: Polar Stations & Hero Stats]
    Home --> Repo[Browse Repository: Open Access Datasets & Reports]
    Home --> Stories[Read Outreach Articles & Summaries]
    Home --> Expeditions[Explore Polar Missions & Research Bases]
    Repo --> Download[Inspect Metadata & Download Media]
    Stories --> SocialShare[View Social Snippets & Share to X/LinkedIn]

    %% Authenticated Flow
    RoleCheck -->|Yes| RoleType{User Role?}

    %% Researcher Flow
    RoleType -->|Researcher| ResearcherFlow[Researcher Portal]
    ResearcherFlow --> UploadPage[Access Upload Studio]
    UploadPage --> FillMeta[1. Fill Asset Metadata & Link Expedition]
    FillMeta --> DropFile[2. Upload Research PDF or Dataset]
    DropFile --> TriggerAI[3. Trigger Local AI Processing]
    TriggerAI --> PreviewAI[4. Live Preview: Summary, Draft Story, Tags]
    PreviewAI --> SubmitQueue[5. Submit to Editorial Review Queue]

    %% Editor Flow
    RoleType -->|Editor| EditorFlow[Editorial Console]
    EditorFlow --> AdminQueue[Review Submissions in 'Draft' / 'Peer Review']
    AdminQueue --> ReviewDraft{Acceptable Quality?}
    ReviewDraft -->|Needs Revision| RejectDraft[Reject with Notes -> Return to Draft]
    ReviewDraft -->|Approved| InlineEdit[OutreachEditor: Edit Title, Markdown Body, Tags]
    InlineEdit --> PromoteApproved[Advance Status to 'Admin Approved']

    %% Administrator Flow
    RoleType -->|Admin| AdminFlow[Executive Administration]
    AdminFlow --> FullQueue[Review All Stages]
    FullQueue --> PublishLive[Publish to Open Access Portal]
    AdminFlow --> Governance[Asset Governance: Toggle Public/Private & Immutability Lock]
    AdminFlow --> AuditLog[Inspect Security Audit Trail & System Health]
```

---

## 3. AI Document Ingestion & Transformation Sequence

Sequence showing how raw scientific research papers are parsed, transformed by local AI, and indexed into the database without third-party cloud leakage.

```mermaid
sequenceDiagram
    autonumber
    actor User as Researcher / Uploader
    participant UI as React Frontend
    participant API as FastAPI Backend (:8000)
    participant PDF as PDF Service (pypdf)
    participant Ollama as Local Ollama (:11434)
    participant DB as Supabase Postgres (Service Role)
    participant Storage as Supabase Storage

    User->>UI: Selects file (PDF) & inputs title/expedition
    UI->>Storage: Direct upload binary to research-media/ bucket
    Storage-->>UI: Returns file_path & file_size
    UI->>DB: INSERT into research_assets (is_public, uploader_id)
    DB-->>UI: Returns asset_id

    UI->>API: POST /api/v1/process-document (asset_id, file, Bearer JWT)
    API->>API: Verify JWT signature with SUPABASE_JWT_SECRET
    API->>API: Check rate limit (SlowAPI)

    API->>PDF: Extract text pages & clean whitespace
    PDF-->>API: Returns full_text & structured chunks

    API->>Ollama: POST /api/generate (model: llama3, system: science_communicator, prompt: text)
    Ollama-->>API: Returns JSON (summary, article_body, suggested_tags, social snippets)

    API->>Ollama: POST /api/embeddings (model: nomic-embed-text, text: chunks)
    Ollama-->>API: Returns 768-dimensional vector embeddings

    API->>DB: INSERT into generated_content (asset_id, content_type, body, status='draft')
    API->>DB: INSERT into asset_vectors (asset_id, embedding, chunk_text)
    API->>DB: INSERT into audit_log (action='ingest_document', asset_id)

    API-->>UI: 200 OK: Ingestion complete (asset_id, summary, article, tags)
    UI-->>User: Displays real-time preview & success confirmation
```

---

## 4. Editorial Content Lifecycle State Machine

Outreach articles and generated content progress through a formal editorial pipeline before public syndication.

```mermaid
stateDiagram-v2
    [*] --> DRAFT: AI Extraction Completed

    DRAFT --> PEER_REVIEW: Researcher submits for scientific review
    DRAFT --> REJECTED: Initial review failed

    PEER_REVIEW --> ADMIN_APPROVED: Scientific Editor validates accuracy
    PEER_REVIEW --> REJECTED: Fact-checking failed / corrections needed

    ADMIN_APPROVED --> PUBLISHED: Lead Admin grants public release
    ADMIN_APPROVED --> REJECTED: Executive veto

    REJECTED --> DRAFT: Researcher modifies / re-submits with revisions

    state PUBLISHED {
        [*] --> ActivePublic
        ActivePublic --> ImmutableLocked: Administrator sets is_immutable=true
        ImmutableLocked --> ActivePublic: Administrative unlock
    }

    note right of ImmutableLocked
        PostgreSQL Trigger prevents:
        - Changes to title
        - Changes to file_path
        - Changes to scientific metadata
    end note
```

---

## 5. Role-Based Access Control (RBAC) & Security Architecture

Matrix showing permission boundaries enforced via **Supabase Row-Level Security (RLS)** in PostgreSQL and **Frontend Protected Routes**.

```mermaid
flowchart LR
    subgraph Roles["Identity Roles"]
        R_Anon["Visitor (Anonymous)"]
        R_Res["Researcher"]
        R_Ed["Editor"]
        R_Adm["Administrator"]
    end

    subgraph Permissions["System Actions & RLS Filters"]
        P_ReadPublic["Read Public Assets & Published Stories"]
        P_ReadPrivate["Read Own Drafts & Unlisted Uploads"]
        P_Upload["Upload Assets & Trigger Local AI"]
        P_Review["Edit Content Drafts & Advance Review Stages"]
        P_Publish["Publish Live to Open Access & Lock Immutability"]
        P_Audit["Access Audit Logs & System Health Diagnostics"]
    end

    %% Mappings
    R_Anon --> P_ReadPublic

    R_Res --> P_ReadPublic
    R_Res --> P_ReadPrivate
    R_Res --> P_Upload

    R_Ed --> P_ReadPublic
    R_Ed --> P_ReadPrivate
    R_Ed --> P_Upload
    R_Ed --> P_Review

    R_Adm --> P_ReadPublic
    R_Adm --> P_ReadPrivate
    R_Adm --> P_Upload
    R_Adm --> P_Review
    R_Adm --> P_Publish
    R_Adm --> P_Audit
```

---

## 6. Database Entity-Relationship (ER) Diagram

Complete schema relational model as implemented in [`database/migrations/001_init.sql`](../database/migrations/001_init.sql).

```mermaid
erDiagram
    PROFILES ||--o{ RESEARCH_ASSETS : "uploads"
    PROFILES ||--o{ GENERATED_CONTENT : "reviews"
    PROFILES ||--o{ AUDIT_LOG : "triggers"
    EXPEDITIONS ||--o{ RESEARCH_ASSETS : "contains"
    RESEARCH_ASSETS ||--o{ GENERATED_CONTENT : "generates"
    RESEARCH_ASSETS ||--o{ ASSET_VECTORS : "embedded_into"

    PROFILES {
        uuid id PK "references auth.users"
        text full_name
        text role "admin | editor | researcher | visitor"
        text department
        timestamptz created_at
    }

    EXPEDITIONS {
        uuid id PK
        text code UK "e.g. 43-ISEA, ARCTIC-2024"
        text name
        text region "Antarctic | Arctic | Himalayas | Southern Ocean"
        date season_start
        date season_end
        text description
        text status "planned | ongoing | completed"
        timestamptz created_at
    }

    RESEARCH_ASSETS {
        uuid id PK
        uuid expedition_id FK
        uuid uploader_id FK
        text title
        text description
        text asset_type "report | dataset | publication | photo | video"
        text file_path "path in storage bucket"
        bigint file_size_bytes
        text mime_type
        text sha256_checksum
        boolean is_public "Open Access vs Internal"
        boolean is_immutable "WORM protection lock"
        timestamptz created_at
        timestamptz updated_at
    }

    GENERATED_CONTENT {
        uuid id PK
        uuid asset_id FK
        text content_type "summary | article | social_x | social_linkedin"
        text title
        text body "Markdown / Plaintext"
        text status "draft | peer_review | admin_approved | published | rejected"
        uuid reviewed_by FK
        timestamptz published_at
        timestamptz created_at
    }

    ASSET_VECTORS {
        uuid id PK
        uuid asset_id FK
        vector embedding "768 dimensions (nomic-embed-text)"
        text chunk_text
        integer chunk_index
        timestamptz created_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        text action "upload | status_change | immutability_toggle"
        text target_table
        uuid target_id
        jsonb metadata
        timestamptz created_at
    }
```

---

## 7. Deployment & Network Infrastructure Topology

Deployment layout showing the air-gapped boundary between the public Internet, the static application hosting, and the secure internal AI computation nodes.

```mermaid
flowchart TB
    subgraph Internet["Public Internet"]
        PublicUsers["General Public & Students"]
        Researchers["Polar Scientists & Editors"]
    end

    subgraph CDN["Static Frontend Hosting (Edge CDN / On-Prem Nginx)"]
        Edge["Frontend Static Host (Vercel / Netlify / Nginx)"]
        StaticAssets["Pre-compiled React + Vite Bundles (HTML / JS / CSS)"]
        Edge --- StaticAssets
    end

    subgraph CloudOrOnPrem["Data Layer (Supabase Managed or Self-Hosted Docker)"]
        SupaAPI["Supabase REST & Auth Gateway (PostgREST / GoTrue)"]
        PostgresContainer["PostgreSQL DB + pgvector Extension"]
        ObjectStore["Object Storage (S3-compatible bucket: research-media)"]
        SupaAPI --- PostgresContainer
        SupaAPI --- ObjectStore
    end

    subgraph SecureLab["🔒 NCPOR Secure Lab / On-Prem Server (Zero Data Egress)"]
        ReverseProxy["Reverse Proxy (Nginx / Caddy with SSL)"]
        FastAPIWorker["Uvicorn / FastAPI Ingestion Service"]
        LocalOllama["Ollama Daemon (GPU / CPU accelerated)"]
        LLMModels[("Local Models: llama3 + nomic-embed-text")]

        ReverseProxy --> FastAPIWorker
        FastAPIWorker --> LocalOllama
        LocalOllama --- LLMModels
    end

    %% Network flows
    PublicUsers -->|HTTPS: 443| Edge
    Researchers -->|HTTPS: 443| Edge

    Edge -.->|Direct API calls to Supabase| SupaAPI
    Researchers -->|Authenticated Upload Requests| ReverseProxy
    FastAPIWorker -->|Service Role DB Sync| PostgresContainer
    FastAPIWorker -.->|No external cloud LLM connections| LocalOllama
```

---

## Summary of Architectural Guarantees

1. **Air-Gapped AI Privacy**: Scientific reports uploaded to the platform are processed exclusively on the local Ollama instance on-premises. No proprietary research data or pre-publication findings are transmitted to third-party LLM APIs.
2. **Immutability Protection**: The database enforces integrity via automated triggers, ensuring historical scientific expedition records and publications cannot be altered once verified.
3. **Resilient Local Mode**: The frontend provides automatic local mock fallbacks for all endpoints, ensuring full demonstration capabilities during offline evaluations, hackathon judging, or disconnected expedition settings.
