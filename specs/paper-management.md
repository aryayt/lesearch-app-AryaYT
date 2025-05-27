# Paper Management Specification

## Overview

The Paper Management system in Lesearch allows users to upload, organize, explore, and manage research papers. This system integrates with external APIs like arXiv and Semantic Scholar to provide a comprehensive research paper discovery and management experience. The system includes drag-and-drop functionality for paper organization and a modern PDF viewer for paper reading.

## Key Features

1. **Paper Upload**: Upload PDF research papers to the user's library
   - Drag and drop interface
   - Bulk upload capability
   - Progress indicators
   - Automatic metadata extraction
   - File validation and error handling

2. **Paper Exploration**: Discover papers using arXiv and Semantic Scholar APIs
   - Advanced search capabilities
   - Filtering and sorting options
   - Paper previews
   - Citation information
   - Related papers suggestions

3. **Library Management**: Organize papers with tags, collections, and metadata
   - Drag and drop organization
   - Custom collections
   - Tag management
   - Metadata editing
   - Bulk actions

4. **Paper Metadata**: Extract and display paper metadata
   - Title and authors
   - Abstract and keywords
   - Publication information
   - Citation data
   - DOI and identifiers

5. **Storage Integration**: Store papers in Supabase storage
   - Secure file storage
   - Access control
   - Version management
   - Storage quotas
   - Backup and recovery

## Implementation Details

### Paper Upload

```typescript
interface PaperUploadOptions {
  file: File;
  metadata?: {
    title?: string;
    authors?: string[];
    abstract?: string;
    keywords?: string[];
    publicationDate?: Date;
  };
  collection?: string;
  tags?: string[];
}

const uploadPaper = async (options: PaperUploadOptions) => {
  // Validate file
  if (!options.file.type.includes('pdf')) {
    throw new Error('Only PDF files are supported');
  }

  // Extract metadata if not provided
  const metadata = options.metadata || await extractMetadata(options.file);

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('papers')
    .upload(`${user.id}/${options.file.name}`, options.file);

  if (error) throw error;

  // Save metadata to database
  const { data: paper, error: dbError } = await supabase
    .from('papers')
    .insert({
      title: metadata.title,
      authors: metadata.authors,
      abstract: metadata.abstract,
      file_path: data.path,
      user_id: user.id,
      collection: options.collection,
      tags: options.tags,
    });

  if (dbError) throw dbError;

  return paper;
};
```

### Paper Exploration

#### arXiv Integration

```typescript
interface ArxivSearchOptions {
  query: string;
  start?: number;
  maxResults?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder?: 'ascending' | 'descending';
}

const searchArxiv = async (options: ArxivSearchOptions) => {
  const baseUrl = 'http://export.arxiv.org/api/query';
  const params = new URLSearchParams({
    search_query: options.query,
    start: options.start?.toString() || '0',
    max_results: options.maxResults?.toString() || '10',
    sortBy: options.sortBy || 'relevance',
    sortOrder: options.sortOrder || 'descending'
  });
  
  const response = await fetch(`${baseUrl}?${params}`);
  const data = await response.text();
  
  return parseArxivResponse(data);
};
```

#### Semantic Scholar Integration

```typescript
interface SemanticScholarOptions {
  query: string;
  limit?: number;
  offset?: number;
  fields?: string[];
}

const searchSemanticScholar = async (options: SemanticScholarOptions) => {
  const baseUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';
  const params = new URLSearchParams({
    query: options.query,
    limit: options.limit?.toString() || '10',
    offset: options.offset?.toString() || '0',
    fields: (options.fields || [
      'title',
      'authors',
      'year',
      'abstract',
      'citationCount',
      'influentialCitationCount',
      'url',
      'venue'
    ]).join(',')
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

```typescript
interface LibraryState {
  papers: Paper[];
  collections: Collection[];
  tags: Tag[];
  selectedPaper: Paper | null;
  view: 'grid' | 'list';
  sortBy: string;
  filterBy: FilterOptions;
}

const useLibraryStore = create<LibraryState>((set) => ({
  papers: [],
  collections: [],
  tags: [],
  selectedPaper: null,
  view: 'grid',
  sortBy: 'title',
  filterBy: {},
  setPapers: (papers) => set({ papers }),
  setCollections: (collections) => set({ collections }),
  setTags: (tags) => set({ tags }),
  setSelectedPaper: (paper) => set({ selectedPaper: paper }),
  setView: (view) => set({ view }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterBy: (filterBy) => set({ filterBy }),
}));
```

### Database Schema

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
- Metadata preview and editing
- Collection and tag selection

### Library View

- Grid and list view options
- Sort by date, title, author, etc.
- Filter by collection, tag, and other metadata
- Search functionality
- Thumbnail previews
- Drag and drop organization

### Paper Detail View

- Paper metadata display
- Abstract preview
- Citation information
- Related papers
- Actions (open in reader, edit metadata, delete, etc.)
- PDF viewer integration

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
- `react-dnd` for drag and drop functionality
- `react-pdf` for PDF viewing

## Best Practices

1. **Performance**
   - Lazy loading of paper thumbnails
   - Efficient metadata extraction
   - Optimized search queries
   - Caching strategies

2. **Security**
   - File type validation
   - Access control
   - Secure storage
   - Data encryption

3. **User Experience**
   - Intuitive drag and drop
   - Responsive design
   - Progress indicators
   - Error handling

4. **Data Management**
   - Regular backups
   - Version control
   - Storage optimization
   - Data validation

## Future Enhancements

1. **Advanced Search**
   - Full-text search
   - Semantic search
   - Citation network analysis
   - Research trend analysis

2. **Collaboration Features**
   - Shared collections
   - Paper recommendations
   - Collaborative annotations
   - Research groups

3. **Integration Enhancements**
   - Reference manager integration
   - Citation style support
   - Bibliography generation
   - Research workflow automation

4. **AI Features**
   - Paper summarization
   - Key concept extraction
   - Related paper suggestions
   - Research gap analysis
