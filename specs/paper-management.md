# Paper Management Specification

## Overview

The Paper Management system in Lesearch allows users to upload, organize, explore, and manage research papers. This system integrates with external APIs like arXiv and Semantic Scholar to provide a comprehensive research paper discovery and management experience.

## Key Features

1. **Paper Upload**: Upload PDF research papers to the user's library
2. **Paper Exploration**: Discover papers using arXiv and Semantic Scholar APIs
3. **Library Management**: Organize papers with tags, collections, and metadata
4. **Paper Metadata**: Extract and display paper metadata (title, authors, abstract, etc.)
5. **Storage Integration**: Store papers in Supabase storage with proper access controls

## Implementation Requirements

### Paper Upload

- Support for direct PDF file uploads
- Drag and drop interface
- Bulk upload capability
- Progress indicators for large files
- Automatic metadata extraction from uploaded PDFs

### Paper Exploration

#### arXiv Integration

- Search arXiv papers by keyword, author, category, and date
- Filter results by relevance, date, and citation count
- Preview paper abstracts and metadata
- Save papers to the user's library
- Download papers directly from arXiv

```typescript
// Example arXiv API integration
const searchArxiv = async (query: string, options: ArxivSearchOptions) => {
  const baseUrl = 'http://export.arxiv.org/api/query';
  const params = new URLSearchParams({
    search_query: query,
    start: options.start.toString(),
    max_results: options.maxResults.toString(),
    sortBy: options.sortBy,
    sortOrder: options.sortOrder
  });
  
  const response = await fetch(`${baseUrl}?${params}`);
  const data = await response.text();
  
  // Parse XML response
  return parseArxivResponse(data);
};
```

#### Semantic Scholar Integration

- Search papers by keyword, author, venue, and year
- Filter by citation count, influence, and recency
- View citation graph and related papers
- Save papers to the user's library
- Access full-text links when available

```typescript
// Example Semantic Scholar API integration
const searchSemanticScholar = async (query: string, options: SemanticScholarOptions) => {
  const baseUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';
  const params = new URLSearchParams({
    query,
    limit: options.limit.toString(),
    offset: options.offset.toString(),
    fields: 'title,authors,year,abstract,citationCount,influentialCitationCount,url,venue'
  });
  
  const response = await fetch(`${baseUrl}?${params}`, {
    headers: {
      'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
    }
  });
  
  return await response.json();
};
```

### Library Management

- Create collections to organize papers
- Add tags to papers for easy filtering
- Star/favorite important papers
- Sort and filter papers by various criteria
- Bulk actions (tag, move, delete)
- Search within the user's library

### Paper Metadata

- Extract metadata from PDFs using tools like pdf.js
- Store metadata in Supabase database
- Fields to extract and store:
  - Title
  - Authors
  - Abstract
  - Publication date
  - DOI
  - Keywords
  - Citations
  - References

### Storage Integration

- Store papers in Supabase storage buckets
- Implement proper access controls
- Generate signed URLs for secure access
- Handle storage quotas and limits
- Implement caching for frequently accessed papers

## Database Schema

```sql
-- Papers table
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  authors JSONB,
  abstract TEXT,
  publication_date DATE,
  doi TEXT,
  arxiv_id TEXT,
  file_path TEXT,
  thumbnail_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paper collections junction table
CREATE TABLE paper_collections (
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (paper_id, collection_id)
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  UNIQUE (user_id, name)
);

-- Paper tags junction table
CREATE TABLE paper_tags (
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (paper_id, tag_id)
);
```

## User Interface

### Upload Interface

- Drag and drop zone for PDF files
- File selection dialog
- Upload progress indicator
- Metadata preview and editing before finalizing

### Library View

- Grid and list view options
- Sort by date, title, author, etc.
- Filter by collection, tag, and other metadata
- Search functionality
- Thumbnail previews of papers

### Paper Detail View

- Paper metadata display
- Abstract preview
- Citation information
- Related papers
- Actions (open in reader, edit metadata, delete, etc.)

## Implementation Phases

1. **Phase 1**: Basic PDF upload and storage in Supabase
2. **Phase 2**: Metadata extraction and library management
3. **Phase 3**: arXiv integration for paper discovery
4. **Phase 4**: Semantic Scholar integration and citation analysis

## Dependencies

- `pdf.js` for PDF parsing and metadata extraction
- Supabase storage for file storage
- arXiv API for paper discovery
- Semantic Scholar API for enhanced metadata and citations
