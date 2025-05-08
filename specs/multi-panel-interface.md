# Multi-Panel Interface Specification

## Overview

The Lesearch multi-panel interface is a core feature of the application, providing a flexible and customizable workspace for users to interact with research papers, notes, and AI assistance simultaneously.

## Panel Configuration

The interface will consist of multiple resizable panels that can be arranged in various layouts:

1. **Main Paper Panel**: Displays the primary research paper being studied
2. **Citation Panel**: Shows related papers cited in the main paper
3. **Note Editor Panel**: BlockNote editor for taking notes on the paper
4. **AI Chat Panel**: Interface for interacting with AI assistants

## Implementation Requirements

### Panel Framework

- Implement using a flexible panel library like `react-resizable-panels`
- Support for dragging panel dividers to resize
- Minimum and maximum size constraints for each panel
- Ability to collapse and expand panels
- Layout persistence across sessions

### Layout Presets

Provide predefined layout configurations for common use cases:

1. **Reading Focus**: Main paper takes up most of the screen with a small notes panel
2. **Research Mode**: Equal space for main paper and citation papers
3. **Writing Mode**: Note editor takes up most of the screen with reference papers
4. **AI Analysis**: Main paper with prominent AI chat panel

### Panel Components

#### Main Paper Panel

- PDF viewer with annotation capabilities
- Text highlighting and commenting
- Zoom and page navigation controls
- Search functionality within the paper
- Citation linking to open cited papers

#### Citation Panel

- List view of cited papers with metadata
- Preview capability for quick reference
- Ability to open a citation as the main paper
- Search and filter citations

#### Note Editor Panel

- BlockNote rich text editor integration
- Support for Markdown formatting
- Citation insertion from the main paper
- Image and diagram insertion
- Auto-saving functionality

#### AI Chat Panel

- Chat interface for interacting with AI models
- Context-aware queries based on the current paper
- Support for multiple AI providers (Gemini, Azure OpenAI)
- Artifact generation (summaries, explanations, reports)
- Chat history persistence

## Technical Implementation

### State Management

- Use Zustand to manage panel state (size, visibility, content)
- Persist layout preferences in user settings

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

### Responsive Design

- Adapt layout for different screen sizes
- Stack panels vertically on mobile devices
- Provide panel focus mode for small screens

## User Experience Considerations

- Smooth resize animations
- Visual indicators for panel focus
- Keyboard shortcuts for panel manipulation
- Drag and drop support between panels
- Context-aware panel interactions

## Implementation Phases

1. **Phase 1**: Basic resizable two-panel layout (paper + notes)
2. **Phase 2**: Add AI chat panel and integration
3. **Phase 3**: Implement citation panel and paper linking
4. **Phase 4**: Advanced features (layout presets, panel focus mode)

## Dependencies

- `react-resizable-panels` for panel implementation
- `@blocknote/react` for note editor
- `react-pdf` or similar for PDF viewing
- Zustand for state management
