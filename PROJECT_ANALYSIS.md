# Semantic Search SaaS - Complete Technical Analysis

## 1. Project Overview

**Project Name:** Semantic Search SaaS (Full-Stack)

**Purpose:** A production-ready semantic search and RAG (Retrieval-Augmented Generation) chat system for PDFs with isolated per-user knowledge spaces.

**In Simple Terms:** This is a web application that lets users upload PDF documents and ask intelligent questions about them. The system understands the meaning of queries (not just keyword matching) and provides answers backed by specific passages from the uploaded documents with source attribution.

---

## 2. Problem It Solves

1. **Document Search Limitation:** Traditional keyword-based search in documents fails at understanding intent. Searching "vehicle" won't match "car" or "bicycle."

2. **Knowledge Isolation:** Users need private, isolated document spaces. One user's PDFs shouldn't be visible or searchable by others.

3. **Context-Aware Answers:** Simply highlighting search results isn't enough. Users need intelligent answers synthesized from their documents.

4. **Scalability:** The system must handle multiple users with varying numbers of documents efficiently.

5. **Multi-Document Synthesis:** Answers should intelligently combine information from multiple sources with proper attribution.

---

## 3. All Features Implemented

### **Authentication & User Management**

- JWT-based authentication with bcrypt password hashing
- User signup with email validation
- User login with credential verification
- Session management via access tokens (30-day expiration)
- Password strength validation (minimum 8 characters, max 72 bytes)

### **Document Management**

- Multi-file PDF upload (batch upload supported)
- Upload progress tracking
- PDF text extraction using PyMuPDF
- Semantic chunking with sentence-aware splitting
- Chunk overlap to maintain context across chunks
- Document deletion (removes both MongoDB records and Pinecone vectors)
- Document metadata tracking (page count, chunk count, creation date)
- Per-user document isolation

### **Search & Retrieval**

- Semantic search using vector embeddings
- Top-K retrieval (configurable, default 5 results)
- Automatic embedding generation for documents
- Per-user metadata filtering in Pinecone
- Search result ranking by similarity score
- Query history persistence

### **RAG (Retrieval-Augmented Generation) Chat**

- Question answering based on document context
- Multiple RAG strategies:
  - HuggingFace Inference API integration (if configured)
  - Fallback extractive answer generation from top matched documents
- Source attribution (document name, page number, relevance score)
- Chat history persistence in MongoDB
- Streaming chat endpoint (bonus feature)
- Token-by-token streaming responses

### **Analytics**

- Document count per user
- Query count per user
- Real-time analytics dashboard

### **Query History**

- Persistent storage of all user queries
- Query-response pairing
- Query replay functionality
- Individual query deletion
- Bulk history deletion

### **User Interface**

- Premium dark-mode dashboard
- 3-pane responsive layout:
  - **Left Sidebar:** Document library, upload panel, query history
  - **Center:** Chat interface with conversation history
  - **Right Panel:** Source attribution, analytics
- File upload with progress bar
- Real-time UI updates
- Tailwind CSS + custom shadcn-style components
- Framer Motion animations

---

## 4. Complete Tech Stack

### **Frontend**

- **Framework:** Next.js 14.2.25 (App Router)
- **Language:** TypeScript 5.6.3
- **Styling:** Tailwind CSS 3.4.14 + PostCSS
- **HTTP Client:** Axios 1.11.0
- **UI Components:** Radix UI (Progress, ScrollArea, Separator, Slot)
- **Animation:** Framer Motion 11.3.19
- **Icons:** Lucide React 0.469.0
- **Utilities:** clsx, class-variance-authority, tailwind-merge
- **Development:** ESLint, TypeScript compiler
- **Deployment:** Vercel (evidenced by .env containing `https://docusense-ett.vercel.app`)

### **Backend**

- **Framework:** FastAPI 0.116.1
- **Server:** Uvicorn 0.35.0 with ASGI support
- **Language:** Python 3.x
- **Data Validation:** Pydantic 2.11.7
- **Configuration:** Pydantic Settings 2.10.1
- **Authentication:** Python-Jose 3.5.0 (JWT), bcrypt, Passlib
- **Email Validation:** email-validator 2.2.0
- **File Processing:** python-multipart 0.0.20

### **Databases**

- **Primary Database:** MongoDB (via motor async driver)
  - Handles: User accounts, documents metadata, query history
- **Vector Database:** Pinecone
  - Handles: Document embeddings for semantic search
  - Dimension: 384 (for all-MiniLM-L6-v2) or 1536 (for text-embedding-3-small)
  - Metric: Cosine similarity
  - Cost Model: Serverless with AWS infrastructure

### **AI/ML Components**

- **Embedding Model:** Sentence Transformers (`all-MiniLM-L6-v2`)
  - Local execution on backend
  - 384-dimensional vectors
  - Optimized for semantic similarity
- **Alternative Embedding:** OpenAI `text-embedding-3-small` (optional)
  - 1536-dimensional vectors
  - If `USE_OPENAI_EMBEDDINGS=true` in .env
- **LLM for RAG:**
  - Primary: HuggingFace Inference API (Mistral-7B-Instruct-v0.1)
  - Fallback: Extractive answer generation (no LLM call needed)
- **Optional:** OpenAI API (if configured via `OPENAI_API_KEY`)

### **PDF Processing**

- **Library:** PyMuPDF (fitz) 1.26.4
- **Capabilities:** Text extraction, page-by-page processing

### **Supporting Libraries**

- **Data Processing:** NumPy 2.2.6
- **HTTP Requests:** httpx 0.28.1
- **JSON Serialization:** orjson 3.11.1
- **Vector Operations:** Pinecone SDK 7.3.0
- **Async Database:** Motor 3.7.1, PyMongo 4.13.2

### **Deployment**

- **Container:** Docker (Dockerfile present)
- **Orchestration:** Docker Compose
- **Frontend Deployment:** Vercel (Next.js)
- **Backend Deployment:** Docker-based (likely cloud-native)

---

## 5. System Architecture & End-to-End Flow

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Login/Signup Page → Dashboard (3-pane layout)           │   │
│  │ - Chat Panel | Document Sidebar | Sources Panel         │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST + JWT Token
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Routers: Auth | Documents | Search | Chat | History       │ │
│  │ Services: User | PDF | Chunk | Embedding | RAG | Query    │ │
│  │ Core: Config | Security (JWT/bcrypt) | Database           │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────┬──────────────────────────────┬──────────────────┬──────┘
         │                              │                  │
         ↓                              ↓                  ↓
    ┌─────────┐              ┌──────────────────┐   ┌──────────┐
    │ MongoDB │              │  Pinecone        │   │HuggingFace│
    │         │              │  Vector DB       │   │Inference  │
    │ Users   │              │ (Embeddings)     │   │API (LLM)  │
    │ Docs    │              │ (Filters by uid) │   └──────────┘
    │ History │              └──────────────────┘
    └─────────┘
```

### **Complete User Flow - Step by Step**

#### **Phase 1: Authentication**

1. User lands on `/` → redirected to `/login`
2. User signs up with email + password (or logs in)
3. **Backend:**
   - Validates email format
   - Hashes password using bcrypt
   - Stores in MongoDB `users` collection
   - Generates JWT token with user ID + 30-day expiration
4. **Frontend:**
   - Stores token in localStorage
   - Stores email in localStorage
   - Redirects to `/dashboard`

#### **Phase 2: Document Upload**

1. User selects PDF files in sidebar upload area
2. Frontend calls `apiClient.uploadDocuments(files)` with progress tracking
3. **Backend processes each PDF:**
   - Receives file via multipart form data
   - Extracts pages using PyMuPDF
   - For each page:
     - **Semantic Chunking:**
       - Splits into sentences using regex: `r'(?<=[.!?])\s+(?=[A-Z0-9])'`
       - Groups sentences into chunks (~380 words default)
       - Adds 60-word overlap to maintain context
     - **Vector Generation:**
       - Sends chunks to Sentence Transformers model
       - Generates 384-dim embeddings
       - Normalizes vectors
   - **Storage:**
     - Saves metadata to MongoDB `documents` collection (user_id, filename, page_count, chunk_count, timestamp)
     - Batches vectors (100 at a time) and upserts to Pinecone with metadata:
       - text, document_id, document_name, page_number, **user_id** (critical for filtering)
4. **Frontend:** Receives document list, updates UI, shows success

#### **Phase 3: Semantic Search**

1. User enters search query: "What is the capital of France?"
2. Frontend calls `apiClient.search(query, topK=5)`
3. **Backend:**
   - Takes query string
   - Generates embedding using same model as training
   - Sends to Pinecone with **filter `{'user_id': {'$eq': current_user_id}}`** (ensures isolation)
   - Pinecone returns top-5 matches with similarity scores
   - Formats results with document name, page, and score
4. **Frontend:** Displays results in Sources Panel

#### **Phase 4: RAG Chat**

1. User enters question: "Summarize the main findings"
2. Frontend calls `apiClient.chat(question, topK=5)`
3. **Backend RAG Pipeline:**
   ```
   Question Input
        ↓
   semantic_search() → Get top-5 relevant chunks with scores
        ↓
   Build Prompt → System instructions + ranked contexts + question
        ↓
   Optional: Call HuggingFace Inference API (Mistral-7B)
        ↓
   If HF available & succeeds → Return generated answer
   Else → Fallback to extractive synthesis of top-3 chunks
        ↓
   Store query + response in MongoDB `query_history`
        ↓
   Return answer + source metadata
   ```
4. **Detailed RAG Process:**
   - **Semantic Search:** Query embedded, top-5 vectors retrieved filtered by user_id
   - **Context Building:**

     ```
     [1] Source: document.pdf (page 5)
     <actual text from chunk 1>

     [2] Source: document.pdf (page 7)
     <actual text from chunk 2>
     ```

   - **Answer Generation (Two Modes):**
     - **Generative:** HuggingFace API generates new text using contexts
     - **Extractive:** Directly synthesizes top-3 matched chunks with source citations
   - **Response Format:** `{ answer: string, sources: [{text, document_name, page_number, score}] }`
5. **Frontend:**
   - Displays assistant message with answer
   - Highlights sources in right panel
   - Stores in UI message history
   - Auto-refreshes analytics & history

#### **Phase 5: Query History**

1. All queries automatically stored in MongoDB with timestamp
2. User can view history in sidebar (sorted by recent first)
3. User can delete individual query or bulk clear all
4. Replay functionality: Click query in history → re-run as new chat

#### **Phase 6: Analytics**

1. Dashboard displays real-time stats:
   - Document count (from `db.documents.count_documents({'user_id': user_id})`)
   - Query count (from `db.query_history.count_documents({'user_id': user_id})`)

#### **Phase 7: Document Deletion**

1. User clicks delete on document in sidebar
2. Frontend calls `apiClient.deleteDocument(doc_id)`
3. **Backend:**
   - Retrieves document from MongoDB (with user_id check)
   - Gets all associated vector IDs
   - Deletes vectors from Pinecone in batch: `index.delete(ids=vector_ids)`
   - Deletes document from MongoDB
4. **Frontend:** Removes from list, updates analytics

---

## 6. Key Components & Architecture

### **Backend Architecture**

#### **1. Core Layer** (`app/core/`)

- **config.py:** Pydantic-based settings loader
  - Reads from `.env` file
  - CORS origins, API prefix, database URIs
  - Embedding model config, chunk sizes, top-k settings
  - 30-day JWT expiration
- **database.py:** MongoDB async connection management
  - Motor async driver
  - Indexes: users (unique email), documents (user_id + created_at), query_history (user_id + created_at)
- **security.py:** JWT + password hashing
  - `create_access_token()` → generates HS256 JWT
  - `decode_token()` → validates and extracts payload
  - `get_password_hash()` → bcrypt hashing with auto salt
  - `verify_password()` → bcrypt comparison

#### **2. Services Layer** (`app/services/`)

- **user_service.py:** User CRUD operations
  - `create_user()` → validates email uniqueness, hashes password
  - `authenticate_user()` → credential verification with timing-safe comparison
- **pdf_service.py:** PDF text extraction
  - Async wrapper around PyMuPDF `fitz`
  - Extracts text per page
- **chunk_service.py:** Semantic document chunking
  - Sentence-aware splitting using regex
  - Configurable chunk size (380 words) and overlap (60 words)
  - Preserves sentence boundaries (no mid-sentence cuts)
- **embedding_service.py:** Vector generation
  - Lazy-loaded Sentence Transformers model (LRU cache)
  - Async wrapper for CPU-bound embedding
  - Normalizes vectors for cosine similarity
- **pinecone_service.py:** Vector database integration
  - Manages Pinecone client (singleton)
  - Creates index on startup if missing
  - Handles upsert (insert or update) operations
  - Supports metadata-based filtering (per-user isolation)
- **rag_service.py:** Semantic search + answer generation
  - `semantic_search()` → filters by user_id, ranks by score
  - `_build_prompt()` → formats context into LLM prompt
  - `_use_hf_inference()` → calls HuggingFace API (optional)
  - `_generate_extractive_answer()` → fallback synthesis
  - `answer_with_rag()` → orchestrates full RAG pipeline
- **query_service.py:** Query history management
  - Stores queries with responses, timestamps
  - Per-user history retrieval with sorting
  - Bulk delete operations

#### **3. Router Layer** (`app/routers/`)

- **auth.py:** Authentication endpoints
  - `POST /auth/signup` → user registration
  - `POST /auth/login` → credential exchange for JWT
- **documents.py:** Document CRUD + upload
  - `GET /documents` → list user's documents
  - `POST /documents/upload` → batch PDF upload with embedding
  - `DELETE /documents/{id}` → delete with vector cleanup
- **search.py:** Semantic search
  - `POST /search` → query with top-k results + history logging
- **chat.py:** RAG chat endpoints
  - `POST /chat` → question answering (includes answer + sources)
  - `POST /chat/stream` → streaming response (word-by-word)
- **history.py:** Query history management
  - `GET /history` → retrieve recent queries
  - `DELETE /history/{id}` → delete individual query
  - `DELETE /history` → clear all user history
- **analytics.py:** User analytics
  - `GET /analytics` → document count + query count

#### **4. Dependency Injection** (`app/utils/dependencies.py`)

- **get_current_user():** FastAPI dependency
  - Extracts JWT from Authorization header (Bearer scheme)
  - Decodes and validates token
  - Looks up user in MongoDB
  - Returns user object with id field for downstream use
  - Applies to all protected endpoints

#### **5. Schema Layer** (`app/schemas/`)

- Request/response models for Pydantic validation
- Type-safe API contracts
- Automatic OpenAPI documentation

#### **6. Application Startup** (`app/main.py`)

- Lifespan context manager:
  - Creates MongoDB indexes on startup
  - Ensures Pinecone index exists
- CORS middleware configuration (allows localhost:3000 + production domains)
- 6 routers attached with `/api/v1` prefix
- Health check endpoint

### **Frontend Architecture**

#### **1. Next.js App Router Structure**

- Server-side rendering with client components where needed
- Dynamic routing with pages and layout composition
- Automatic code splitting

#### **2. Key Pages**

- **`/`:** Root redirects to `/login` or `/dashboard` based on auth
- **`/login`:** Login/Signup form (client component)
- **`/signup`:** Signup form with full_name field
- **`/dashboard`:** Main 3-pane application interface

#### **3. Components** (`components/`)

- **Sidebar:** Document list, upload area, query history, logout
- **ChatPanel:** Message history, input box, loading state
- **SourcesPanel:** Source attribution display, analytics cards
- **UI Components:** Button, Card, Input, Textarea, Progress, Badge, etc.

#### **4. Hooks** (`hooks/`)

- **use-auth.ts:** Custom hook managing authentication state
  - Token management
  - Login/Signup/Logout functions
  - localStorage persistence

#### **5. API Client** (`lib/api.ts`)

- Axios instance with automatic JWT injection in headers
- Interceptor pattern: every request includes `Authorization: Bearer <token>`
- Methods for all endpoints with TypeScript types

#### **6. Styling**

- Tailwind CSS utility-first framework
- Dark mode enabled by default (`html[@class="dark"]`)
- Responsive grid layout: `grid-cols-1 xl:grid-cols-[320px_1fr_360px]`
- Custom components using CVA (class-variance-authority)

---

## 7. Important Libraries, Tools & Services

| Component            | Library/Tool          | Version | Purpose                               |
| -------------------- | --------------------- | ------- | ------------------------------------- |
| **Backend API**      | FastAPI               | 0.116.1 | Modern, async-first web framework     |
| **Server**           | Uvicorn               | 0.35.0  | ASGI server with hot reload           |
| **Data Validation**  | Pydantic              | 2.11.7  | Type-safe request/response validation |
| **Authentication**   | Python-Jose           | 3.5.0   | JWT token creation & validation       |
| **Password Hashing** | bcrypt                | 3.2.2   | Secure password storage (timing-safe) |
| **Async Database**   | Motor                 | 3.7.1   | Async MongoDB driver                  |
| **PDF Processing**   | PyMuPDF               | 1.26.4  | Fast PDF text extraction              |
| **Vector DB**        | Pinecone SDK          | 7.3.0   | Managed vector database client        |
| **Embeddings**       | Sentence Transformers | 3.0.1   | Local embedding model                 |
| **Frontend**         | Next.js               | 14.2.25 | React meta-framework with SSR         |
| **HTTP Client**      | Axios                 | 1.11.0  | Promise-based HTTP requests           |
| **Styling**          | Tailwind CSS          | 3.4.14  | Utility-first CSS framework           |
| **Animation**        | Framer Motion         | 11.3.19 | React animation library               |
| **Container**        | Docker                | -       | Containerization                      |
| **Orchestration**    | Docker Compose        | -       | Multi-container deployment            |

---

## 8. Authentication & Security Mechanisms

### **Authentication Flow**

1. **JWT (JSON Web Tokens)**
   - Algorithm: HS256 (HMAC with SHA-256)
   - Secret: Loaded from `SECRET_KEY` env variable
   - Claims: `sub` (user_id), `exp` (expiration timestamp)
   - Expiration: 30 days from issue
   - Storage: Browser localStorage (semantic_token)

2. **Password Hashing**
   - Library: bcrypt with Passlib wrapper
   - Salting: Automatic per hash
   - Cost: Default (12 rounds)
   - Timing-Safe: Uses constant-time comparison
   - Validation: Minimum 8 characters, maximum 72 bytes

3. **Request Authentication**
   - Bearer token scheme: `Authorization: Bearer <jwt>`
   - FastAPI OAuth2PasswordBearer dependency extracts token
   - Token validated on every protected endpoint
   - Failure: 401 Unauthorized with WWW-Authenticate header

### **Security Features**

1. **Per-User Data Isolation**
   - Every database query includes `user_id` filter
   - Pinecone vectors tagged with user_id metadata
   - MongoDB indexes ensure efficient user-scoped queries
   - Cross-user access prevented at application level

2. **Input Validation**
   - Pydantic validates all request payloads
   - Email format validation (EmailStr)
   - Password length constraints
   - File type validation (PDF-only)

3. **CORS Configuration**
   - Whitelist of allowed origins:
     - `http://localhost:3000` (development)
     - `https://docusense.gayathrii.dev`
     - `https://docusense-ett.vercel.app`
   - Credentials allowed: `Access-Control-Allow-Credentials: true`

4. **API Prefix Versioning**
   - All routes under `/api/v1` prefix
   - Enables backward compatibility
   - Clear API versioning strategy

5. **File Upload Safety**
   - Validates file extension: `.pdf` only
   - Limits file handling via BytesIO (in-memory)
   - No file storage on disk (stateless)

6. **Error Handling**
   - Generic error messages (no information leakage)
   - HTTP status codes: 400, 401, 404, 500
   - Proper exception hierarchy

---

## 9. Deployment Setup

### **Docker Configuration**

**Dockerfile** (Backend)

```dockerfile
# Assumed Python-based image building
# Installs dependencies from requirements.txt
# Runs uvicorn on port 8000
```

**docker-compose.yml**

```yaml
services:
  backend:
    build: . # Builds from Dockerfile
    container_name: semantic-backend
    ports:
      - "8000:8000" # Exposes backend API
    env_file:
      - .env # Loads all environment variables
    restart: always # Auto-restart on failure
```

### **Environment Setup**

**Backend (.env file structure)**

```
SECRET_KEY=<random-32-char-string>
MONGODB_URI=mongodb+srv://...       # Atlas URI
PINECONE_API_KEY=<key>
PINECONE_INDEX=<index-name>
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
PINECONE_DIMENSION=384
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE_WORDS=380
CHUNK_OVERLAP_WORDS=60
TOP_K=5
CORS_ORIGINS=http://localhost:3000,[production-urls]
```

**Frontend (.env.local structure)**

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### **Local Development Setup**

**Backend:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with credentials
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
cp .env.example .env.local
np run dev                           # Runs on localhost:3000
```

### **Production Deployment**

**Frontend:** Deployed on Vercel (evidenced in CORS origins)

- Automatic builds from Git
- Node.js 18+ runtime
- Environment variables configured in Vercel dashboard
- CDN distribution

**Backend:** Docker-based (likely on:

- Docker Hub / ECR
- Cloud platforms: AWS ECS, Google Cloud Run, Kubernetes
- Environment variables injected at runtime

**Databases:**

- MongoDB: Atlas (fully managed cloud MongoDB)
- Pinecone: Serverless vector database (no self-hosting needed)

---

## 10. Data Flow Diagram (Complete)

```
┌──────────────────────┐
│   Frontend (Next.js) │
└──────────┬───────────┘
           │
           │ HTTP + JWT
           ↓
┌──────────────────────────────────────────────────┐
│         FastAPI Backend (/api/v1)                 │
│  ┌────────────────────────────────────────────┐  │
│  │  Dependencies: get_current_user (JWT auth) │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  ┌──────────────┐ ┌──────────────┐             │
│  │ Auth Router  │ │ Docs Router  │ ...         │
│  └──────┬───────┘ └──────┬───────┘             │
│         │                │                      │
│         ↓                ↓                      │
│  ┌────────────────────────────────────────────┐ │
│  │ Services Layer                              │ │
│  │ - UserService (create, authenticate)        │ │
│  │ - PDFService (extract pages)                │ │
│  │ - ChunkService (semantic splitting)         │ │
│  │ - EmbeddingService (vector generation)      │ │
│  │ - PineconeService (vector ops)              │ │
│  │ - RAGService (search + answer gen)          │ │
│  │ - QueryService (history management)         │ │
│  └────────────────────────────────────────────┘ │
└─────────┬──────────────────────────────┬────────┘
          │                              │
          ↓                              ↓
    ┌───────────┐                ┌──────────────┐
    │  MongoDB  │                │  Pinecone    │
    │  (Users,  │                │  (Embeddings │
    │   Docs,   │                │   Vectors)   │
    │  History) │                └──────────────┘
    └───────────┘
```

---

## 11. Key Database Schemas

### **MongoDB Collections**

**users**

```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "full_name": "John Doe",
  "password_hash": "$2b$12$...",
  "created_at": ISODate("2024-01-01")
}
```

**documents**

```json
{
  "_id": ObjectId,
  "user_id": "user_object_id",
  "name": "research-paper.pdf",
  "created_at": ISODate("2024-01-02"),
  "page_count": 42,
  "chunk_count": 256,
  "vector_ids": ["abc-123", "abc-124", ...]
}
```

**query_history**

```json
{
  "_id": ObjectId,
  "user_id": "user_object_id",
  "query": "What are the conclusions?",
  "response": "Based on your documents...",
  "created_at": ISODate("2024-01-03")
}
```

### **Pinecone Vector Storage**

```json
{
  "id": "user_id-doc_id-chunk_idx-random",
  "values": [0.12, 0.45, -0.23, ..., 0.08],  // 384-dim vector
  "metadata": {
    "text": "Actual chunk text...",
    "document_id": "doc_id",
    "document_name": "filename.pdf",
    "page_number": 5,
    "user_id": "user_object_id"
  }
}
```

---

## 12. API Endpoints (Complete Reference)

| Endpoint            | Method | Auth | Purpose                |
| ------------------- | ------ | ---- | ---------------------- |
| `/auth/signup`      | POST   | ❌   | Register new user      |
| `/auth/login`       | POST   | ❌   | Login & get JWT token  |
| `/documents`        | GET    | ✅   | List user's PDFs       |
| `/documents/upload` | POST   | ✅   | Upload + process PDFs  |
| `/documents/{id}`   | DELETE | ✅   | Delete document        |
| `/search`           | POST   | ✅   | Semantic search        |
| `/chat`             | POST   | ✅   | RAG question answering |
| `/chat/stream`      | POST   | ✅   | Streaming RAG chat     |
| `/history`          | GET    | ✅   | Get query history      |
| `/history/{id}`     | DELETE | ✅   | Delete query           |
| `/history`          | DELETE | ✅   | Clear all history      |
| `/analytics`        | GET    | ✅   | Get user analytics     |
| `/health`           | GET    | ❌   | Health check           |

---

## 13. Performance Optimizations

1. **Async/Await Throughout**
   - Non-blocking I/O for database, HTTP, embedding calls
   - Uvicorn handles concurrent connections

2. **Batch Processing**
   - Vector upserts to Pinecone in batches of 100
   - Reduces request overhead

3. **Model Caching**
   - LRU cache for Sentence Transformers model (loaded once)
   - Pinecone client singleton

4. **Indexes**
   - MongoDB indexes on user_id, created_at for fast queries
   - Unique index on email prevents duplicate accounts

5. **Lazy Loading**
   - Models loaded on first use
   - Settings cached via lru_cache

6. **Streaming Responses**
   - Word-by-word streaming for large answers
   - UX improvement for perceived performance

---

## 14. Scalability Considerations

1. **Per-User Isolation**
   - metadata filtering in Pinecone prevents cross-user queries
   - MongoDB user_id index enables efficient sharding

2. **Stateless Backend**
   - No file storage on disk
   - Horizontal scaling via load balancer + multiple instances

3. **Serverless Vector DB**
   - Pinecone handles scaling (auto-scales with data + queries)
   - No infrastructure management needed

4. **Managed Database**
   - MongoDB Atlas auto-scaling
   - Multi-region replication available

5. **Future Scaling Points**
   - Rate limiting (not currently implemented)
   - Caching layer (Redis) for frequent queries
   - Async task queue (Celery) for long-running uploads

---

## Summary Table

| Aspect               | Details                                                          |
| -------------------- | ---------------------------------------------------------------- |
| **Project Type**     | Full-Stack SaaS                                                  |
| **Primary Use Case** | Semantic Search + RAG for PDFs                                   |
| **Frontend**         | Next.js 14 + TypeScript + Tailwind                               |
| **Backend**          | FastAPI + Python + Pydantic                                      |
| **Databases**        | MongoDB + Pinecone                                               |
| **AI/ML**            | Sentence Transformers + Optional HuggingFace                     |
| **Auth**             | JWT + bcrypt                                                     |
| **Deployment**       | Docker + Vercel (frontend) + Cloud (backend)                     |
| **Key Features**     | Multi-file upload, semantic search, RAG chat, history, analytics |
| **Data Isolation**   | Per-user vectors + MongoDB filtering                             |
| **Concurrency**      | Async/await throughout                                           |
| **API Spec**         | 13 endpoints, all RESTful, JSON payloads                         |
