# Multi-Panel Interface Specification

## Overview

The Lesearch multi-panel interface is a core feature of the application, providing a flexible and customizable workspace for users to interact with research papers, notes, and AI assistance simultaneously. The interface is built using react-resizable-panels and supports drag-and-drop functionality for panel organization.

## Panel Configuration

The interface consists of multiple resizable panels that can be arranged in various layouts:

1. **Main Paper Panel**: Displays the primary research paper being studied
   - PDF viewer with annotation capabilities
   - Text highlighting and commenting
   - Zoom and page navigation controls
   - Search functionality within the paper
   - Citation linking to open cited papers

2. **Citation Panel**: Shows related papers cited in the main paper
   - List view of cited papers with metadata
   - Preview capability for quick reference
   - Ability to open a citation as the main paper
   - Search and filter citations
   - Drag and drop for paper organization

3. **Note Editor Panel**: BlockNote editor for taking notes on the paper
   - Rich text editor with Markdown support
   - Citation insertion from the main paper
   - Image and diagram insertion
   - Auto-saving functionality
   - Drag and drop for content organization

4. **AI Chat Panel**: Interface for interacting with AI assistants
   - Chat interface for interacting with AI models
   - Context-aware queries based on the current paper
   - Support for multiple AI providers (Gemini, Azure OpenAI)
   - Artifact generation (summaries, explanations, reports)
   - Chat history persistence

## Implementation Details

### Panel Framework

- Implemented using `react-resizable-panels`
- Support for dragging panel dividers to resize
- Minimum and maximum size constraints for each panel
- Ability to collapse and expand panels
- Layout persistence across sessions using Zustand

### Layout Presets

Predefined layout configurations for common use cases:

1. **Reading Focus**: Main paper takes up most of the screen with a small notes panel
2. **Research Mode**: Equal space for main paper and citation papers
3. **Writing Mode**: Note editor takes up most of the screen with reference papers
4. **AI Analysis**: Main paper with prominent AI chat panel

### Component Architecture

```typescript
// Panel container component
const ResizablePanels = () => {
  const { layout, updateLayout } = usePanelStore();
  
  return (
    <PanelGroup direction="horizontal" onLayout={updateLayout}>
      <Panel defaultSize={layout.mainPaper.size} minSize={20}>
        <PaperViewer />
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={layout.citations.size} minSize={15}>
        <CitationViewer />
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={layout.notes.size} minSize={20}>
        <NoteEditor />
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={layout.aiChat.size} minSize={15}>
        <AIChatInterface />
      </Panel>
    </PanelGroup>
  );
};
```

### State Management

```typescript
interface PanelState {
  layout: {
    mainPaper: { size: number; isCollapsed: boolean };
    citations: { size: number; isCollapsed: boolean };
    notes: { size: number; isCollapsed: boolean };
    aiChat: { size: number; isCollapsed: boolean };
  };
  activePanel: string | null;
  panelOrder: string[];
}

const usePanelStore = create<PanelState>((set) => ({
  layout: {
    mainPaper: { size: 40, isCollapsed: false },
    citations: { size: 20, isCollapsed: false },
    notes: { size: 20, isCollapsed: false },
    aiChat: { size: 20, isCollapsed: false },
  },
  activePanel: null,
  panelOrder: ['mainPaper', 'citations', 'notes', 'aiChat'],
  updateLayout: (newLayout) => set({ layout: newLayout }),
  setActivePanel: (panelId) => set({ activePanel: panelId }),
  updatePanelOrder: (newOrder) => set({ panelOrder: newOrder }),
}));
```

### Responsive Design

- Adapt layout for different screen sizes
- Stack panels vertically on mobile devices
- Provide panel focus mode for small screens
- Touch-friendly controls for mobile devices
- Responsive sidebar integration

## User Experience Considerations

- Smooth resize animations
- Visual indicators for panel focus
- Keyboard shortcuts for panel manipulation
- Drag and drop support between panels
- Context-aware panel interactions
- Panel state persistence
- Quick panel switching
- Panel maximization/minimization

## Implementation Phases

1. **Phase 1**: Basic resizable two-panel layout (paper + notes)
2. **Phase 2**: Add AI chat panel and integration
3. **Phase 3**: Implement citation panel and paper linking
4. **Phase 4**: Advanced features (layout presets, panel focus mode)

## Dependencies

- `react-resizable-panels` for panel implementation
- `@blocknote/react` for note editor
- `react-pdf` for PDF viewing
- `zustand` for state management
- `react-dnd` for drag and drop functionality

## Best Practices

1. **Performance**
   - Lazy load panel content
   - Optimize panel resize operations
   - Cache panel states
   - Minimize re-renders

2. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - ARIA attributes
   - Focus management

3. **Error Handling**
   - Graceful fallbacks
   - Error boundaries
   - Recovery mechanisms
   - State persistence

4. **User Experience**
   - Intuitive controls
   - Visual feedback
   - Smooth animations
   - Consistent behavior

## Future Enhancements

1. **Advanced Layout Features**
   - Custom layout presets
   - Layout templates
   - Layout sharing
   - Layout import/export

2. **Collaboration Features**
   - Shared panel states
   - Real-time updates
   - User presence
   - Panel locking

3. **Integration Enhancements**
   - Plugin system
   - Custom panel types
   - Panel communication
   - External tool integration

4. **Performance Optimizations**
   - Virtual scrolling
   - Content preloading
   - Memory management
   - Caching strategies
