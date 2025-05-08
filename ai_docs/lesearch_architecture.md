# Lesearch Architecture Details

This document provides additional architectural details and diagrams for the Lesearch application.

## Component Architecture

```mermaid
graph TD
    subgraph Frontend
        UI[User Interface] --> DL[Dashboard Layout]
        UI --> FS[File System UI]
        UI --> AI[AI Integration]
        
        subgraph DL[Dashboard Layout]
            RP[react-resizable-panels] --> LP[Left Panel]
            RP --> MP[Main Panels]
            RP --> RP[Right Panel]
            
            subgraph MP[Main Panels]
                P1[Panel 1] --- P2[Panel 2]
                P2 --> TB[Tabbed Interface]
            end
        end
        
        subgraph FS[File System UI]
            FT[File Tree Component]
            IM[Import Component]
            FM[File Management]
            
            FT --> FM
            IM --> FM
        end
        
        subgraph AI[AI Integration]
            CH[Chat Interface]
            CM[Context Management]
            
            CH --> CM
        end
    end
    
    subgraph State
        ZS[Zustand Store]
        
        subgraph ZS[Zustand Store]
            LS[Layout State]
            FS[File System State]
            TS[Tab State]
            PS[Panel State]
            AS[AI State]
            
            LS --- FS
            FS --- TS
            TS --- PS
            PS --- AS
        end
    end
    
    subgraph Backend
        SB[Supabase]
        
        subgraph SB[Supabase]
            AU[Authentication]
            DB[Database]
            ST[Storage]
            
            AU --- DB
            DB --- ST
        end
    end
    
    Frontend <--> State
    State <--> Backend
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as User Interface
    participant State as Zustand State
    participant API as Next.js API
    participant DB as Supabase DB
    participant Storage as Supabase Storage
    
    User->>UI: Import PDF
    UI->>API: Upload PDF Request
    API->>Storage: Store PDF File
    Storage-->>API: File URL
    API->>DB: Create File System Entry
    DB-->>API: Confirmation
    API-->>UI: Success Response
    UI->>State: Update File System State
    State-->>UI: Updated UI
    
    User->>UI: Open PDF
    UI->>State: Request File Data
    State->>API: Fetch PDF Data
    API->>Storage: Get PDF File
    Storage-->>API: PDF Data
    API-->>State: PDF Content
    State-->>UI: Update Panel Content
    UI-->>User: Display PDF
    
    User->>UI: Create Note for PDF
    UI->>State: Create Note Request
    State->>API: Create Note Entry
    API->>DB: Store Note with Parent Relation
    DB-->>API: Confirmation
    API-->>State: Note Created
    State-->>UI: Update File System + Open Note
    UI-->>User: Display Note Editor
    
    User->>UI: Use AI Chat
    UI->>State: Get Current Context
    State-->>UI: PDF/Note Context
    UI->>API: AI Query with Context
    API->>External: AI Service Request
    External-->>API: AI Response
    API-->>UI: Display Response
    UI-->>User: Show AI Answer
```

## File System Data Model

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        timestamp created_at
        timestamp last_sign_in
    }
    
    FILE_SYSTEM_ITEMS {
        uuid id PK
        uuid user_id FK
        string name
        string type
        uuid parent_id FK
        string path
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    NOTES {
        uuid id PK
        uuid file_system_item_id FK
        jsonb content
        timestamp created_at
        timestamp updated_at
    }
    
    PDF_FILES {
        uuid id PK
        uuid file_system_item_id FK
        string storage_path
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    USERS ||--o{ FILE_SYSTEM_ITEMS : owns
    FILE_SYSTEM_ITEMS ||--o{ FILE_SYSTEM_ITEMS : has_children
    FILE_SYSTEM_ITEMS ||--o| NOTES : has_note
    FILE_SYSTEM_ITEMS ||--o| PDF_FILES : has_pdf
```

## User Interface Layout

```mermaid
graph TD
    subgraph Dashboard
        direction LR
        LS[Left Sidebar] --- MA[Main Area] --- RS[Right Sidebar]
        
        subgraph LS[Left Sidebar]
            direction TB
            UP[User Profile]
            IM[Import Button]
            FS[File System Tree]
            ST[Settings]
            TR[Trash]
        end
        
        subgraph MA[Main Area]
            direction LR
            P1[Panel 1] --- P2[Panel 2]
            
            subgraph P1[Panel 1]
                PV1[PDF Viewer]
            end
            
            subgraph P2[Panel 2]
                TH[Tab Header]
                TC[Tab Content]
                
                TH --- TC
            end
        end
        
        subgraph RS[Right Sidebar]
            direction TB
            CH[Chat History]
            CI[Chat Input]
        end
    end
```

## Workflow State Transitions

```mermaid
stateDiagram-v2
    [*] --> EmptyDashboard
    
    EmptyDashboard --> PDFImported: Import PDF
    EmptyDashboard --> NoteCreated: Create Note
    EmptyDashboard --> AIChatStarted: Open AI Chat
    
    PDFImported --> PDFInPanel1: Open PDF
    PDFInPanel1 --> PDFAndNote: Create Note for PDF
    PDFInPanel1 --> PDFAndPDF: Open Another PDF
    PDFInPanel1 --> PDFAndAI: Use AI with PDF Context
    
    NoteCreated --> NoteInPanel2: Open Note
    NoteInPanel2 --> NoteAndPDF: Import Related PDF
    NoteInPanel2 --> NoteAndAI: Use AI with Note Context
    
    AIChatStarted --> AIChatActive: Chat with AI
    AIChatActive --> AIChatAndPDF: Open PDF from Chat
    AIChatActive --> AIChatAndNote: Create Note from Chat
    
    PDFAndNote --> ResearchSession: Continue Research
    PDFAndPDF --> ResearchSession: Continue Research
    PDFAndAI --> ResearchSession: Continue Research
    NoteAndPDF --> ResearchSession: Continue Research
    NoteAndAI --> ResearchSession: Continue Research
    AIChatAndPDF --> ResearchSession: Continue Research
    AIChatAndNote --> ResearchSession: Continue Research
    
    ResearchSession --> [*]: End Session
```

## Technical Stack Integration

```mermaid
flowchart TD
    subgraph Frontend
        NJ[Next.js App Router]
        RC[React Components]
        ZS[Zustand State]
        RP[react-resizable-panels]
        BN[Blocknote Editor]
        PV[PDF Viewer]
        TC[Tailwind CSS]
        SC[shadcn/ui]
        
        NJ --> RC
        RC --> ZS
        RC --> RP
        RC --> BN
        RC --> PV
        RC --> TC
        TC --> SC
    end
    
    subgraph Backend
        NA[NextAuth.js]
        SB[Supabase]
        
        NA --> SB
    end
    
    subgraph External
        AI[AI Service]
    end
    
    Frontend <--> Backend
    Frontend <--> External
```

This document provides visual representations of the Lesearch application architecture to complement the project plan.
