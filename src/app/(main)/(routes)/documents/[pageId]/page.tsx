"use client"
// import React from "react";
// import { createClient } from "@/lib/supabase/client";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import LeftPanel from "../_components/left-panel";
import MiddlePanel from "../_components/middle-panel";
import RightPanel from "../_components/right-panel";

// export interface DocumentData {
//   id: string;
//   user_id: string;
//   name: string;
//   file_path: string;
//   file_type: string;
//   size: string;
//   created_at: string;
// }

// interface DashboardPageProps {
//   params: {
//     pageId: string;
//   };
// }

// export default async function DashboardPage({ params }: DashboardPageProps) {
//   const supabase = createClient();
//   const { pageId } = await params;
//   console.log(pageId)

//   // Fetch the PDF document record
//   const { data: documentRecord, error } = await supabase
//     .from("documents")
//     .select("*")
//     .eq("id", pageId)
//     .single();

//   console.log(error, documentRecord)

//   if (error || !documentRecord) {
//     // Customize error handling or redirect as needed
//     throw new Error(`Unable to load document ${pageId}: ${error?.message}`);
//   }

//   // Default visibility (will hydrate from Zustand on the client)
//   const initialVisibility = {
//     showMiddlePanel: true,
//     showRightPanel: true,
//   };

//   return (
//     <div className="h-full w-full px-1 relative overflow-hidden">
//       <PanelGroup autoSaveId="doc-panels" direction="horizontal">
//         <Panel
//           collapsible
//           defaultSize={20}
//           id="left"
//           maxSize={100}
//           minSize={10}
//           order={1}
//           className="border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl h-full overflow-hidden"
//         >
//           <LeftPanel  />
//         </Panel>

//         {initialVisibility.showMiddlePanel && (
//           <>
//             <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300" />
//             <Panel
//               collapsible
//               id="middle"
//               maxSize={100}
//               minSize={25}
//               order={2}
//               className="border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl overflow-y-scroll h-full"
//             >
//               <MiddlePanel />
//             </Panel>
//           </>
//         )}

//         {initialVisibility.showRightPanel && (
//           <>
//             <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300" />
//             <Panel
//               collapsible
//               defaultSize={20}
//               id="right"
//               maxSize={100}
//               minSize={10}
//               order={3}
//               className="border-r border-gray-200 flex flex-col rounded-xl shadow-xl h-full"
//             >
//               <RightPanel/>
//             </Panel>
//           </>
//         )}
//       </PanelGroup>
//     </div>
//   );
// }

import React from 'react'

const DashboardPage = () => {
  const initialVisibility = {
    showMiddlePanel: true,
    showRightPanel: true,
  };
  return (
        <div className="h-full w-full px-1 relative overflow-hidden">
 <PanelGroup autoSaveId="doc-panels" direction="horizontal">
 <Panel
              collapsible
              defaultSize={20}
              id="left"
              maxSize={100}
              minSize={10}
              order={1}
              className="border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl h-full overflow-hidden"
            >
              <LeftPanel  />
            </Panel>
            {initialVisibility.showMiddlePanel && (
          <>
            <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300" />
            <Panel
              collapsible
              id="middle"
              maxSize={100}
              minSize={25}
              order={2}
              className="border-r-2 border-gray-200 flex flex-col rounded-xl shadow-xl overflow-y-scroll h-full"
            >
              <MiddlePanel />
            </Panel>
          </>
        )}
           {initialVisibility.showRightPanel && (
          <>
            <PanelResizeHandle className="w-1 bg-white cursor-col-resize z-10 hover:bg-blue-300" />
            <Panel
              collapsible
              defaultSize={20}
              id="right"
              maxSize={100}
              minSize={10}
              order={3}
              className="border-r border-gray-200 flex flex-col rounded-xl shadow-xl h-full"
            >
              <RightPanel/>
            </Panel>
          </>
        )}
 </PanelGroup>
        </div>
  )
}

export default DashboardPage
