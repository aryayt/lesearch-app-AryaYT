# PDF Viewer System

## Overview

The PDF Viewer system is a comprehensive solution for viewing, managing, and interacting with PDF documents in the Lesearch application. It provides a rich set of features including multi-panel viewing, thumbnails navigation, zoom controls, and PDF management.

## Key Components

### 1. PDF Store (Zustand)

Located at `src/store/pdf-store.ts`, this is the central state management for PDFs:

- **PDF Management**: Stores and manages PDF metadata and content
- **Panel Management**: Tracks open panels and their associated PDFs
- **Persistence**: Uses Zustand's persist middleware to save PDFs and panel state to localStorage

```typescript
// Core interfaces
export interface PDF {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
}

export interface PanelInfo {
  id: string;
  pdfId: string;
}
```

### 2. PDF Viewer Component

Located at `src/components/pdf-viewer/pdfViewer.tsx`, this component renders a single PDF:

- Built on top of `@anaralabs/lector` library
- Features:
  - Thumbnails sidebar (collapsible)
  - Page navigation
  - Zoom controls
  - Search functionality
  - Base64 PDF data support

### 3. Multi-Panel Layout

Located at `src/app/(main)/(routes)/documents/[pageId]/page.tsx`, this implements the resizable multi-panel view:

- Uses `react-resizable-panels` for resizable panels
- Supports opening multiple PDFs side by side
- Each panel operates independently with its own controls
- Panels can be added, removed, and resized

### 4. PDF Import

Located at `src/components/pdf-import/pdf-import.tsx`, this handles PDF file uploads:

- Converts uploaded files to base64 for storage
- Validates file type and size
- Provides a user-friendly import dialog
- Integrates with the sidebar for easy access

### 5. PDF Sidebar

Located at `src/app/(main)/_components/sidebar/pdf-sidebar.tsx`, this displays available PDFs:

- Lists all imported PDFs
- Provides quick access to open PDFs
- Highlights the currently active PDF

## Implementation Details

### PDF Storage Strategy

PDFs are stored as base64-encoded strings in localStorage via Zustand's persist middleware. This approach was chosen to:

1. Avoid issues with temporary blob URLs that don't persist across page reloads
2. Ensure PDFs remain available offline
3. Simplify the storage and retrieval process

```typescript
// Reading a file as base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
};
```

### Multi-Panel Architecture

The multi-panel system uses a combination of:

1. **Panel Group**: Container for all panels using `react-resizable-panels`
2. **Panel**: Individual container for each PDF viewer
3. **Panel Resize Handle**: Draggable divider between panels
4. **PDF Panel**: Wrapper component that includes panel header and PDF viewer

Panels are stored in the Zustand store as an array of `PanelInfo` objects, each linking to a PDF by ID:

```typescript
// Opening a PDF in a new panel
openPdfInPanel: (pdfId) => {
  // Check if the PDF exists
  const pdf = get().getPdf(pdfId);
  if (!pdf) return;
  
  // Create a new panel with the PDF
  const newPanel = {
    id: uuidv4(),
    pdfId,
  };
  
  set((state) => ({
    openPanels: [...state.openPanels, newPanel],
  }));
}
```

### Navigation and State Persistence

When navigating between pages, we use `window.location.href` instead of Next.js's `router.push()` to ensure proper rehydration of the Zustand store from localStorage. This approach was necessary due to an issue where the persisted state wasn't properly rehydrated during client-side navigation.

## Usage

### Importing a PDF

1. Click the "+" button in the sidebar user section
2. Select "Import PDF" from the dropdown
3. Choose a PDF file and provide a name
4. Click "Import"

### Working with Multiple PDFs

1. Open a PDF by clicking on it in the sidebar
2. To open another PDF alongside it, click the floating "+" button
3. Select another PDF from the dropdown
4. Resize panels by dragging the divider between them
5. Close a panel by clicking the "X" in its header

## Technical Considerations

- **PDF Size Limits**: Be mindful of localStorage limits when importing large PDFs
- **Performance**: The thumbnail generation can be resource-intensive for large documents
- **Browser Support**: The implementation relies on modern browser features like `FileReader` and `localStorage`

## Future Improvements

- PDF annotation support
- Collaborative viewing and commenting
- Server-side PDF storage for larger files
- Search across multiple PDFs
- PDF comparison tools
