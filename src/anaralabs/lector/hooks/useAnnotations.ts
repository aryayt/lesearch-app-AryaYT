export interface Annotation {
  id: string;
  documentId: string;
  pageNumber: number;
  highlights: Array<{
    height: number;
    left: number;
    top: number;
    width: number;
    pageNumber: number;
  }>;
  color: string;
  borderColor: string;
  createdAt: Date;
  updatedAt: Date;
  comment?: string;
  metadata?: Record<string, unknown>;
} 