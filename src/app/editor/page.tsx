import { Toaster } from 'sonner';

import { PlateEditor } from '@/components/platejs/plate-editor';
import { SettingsProvider } from '@/components/platejs/settings';

export default function Page() {
  const docid = "41e57a83-7fcb-4146-a789-82f61bcf7b38"
  return (
    <div className="h-screen w-full" data-registry="plate">
      <SettingsProvider>
        <PlateEditor docid={docid}/>
      </SettingsProvider>
      <Toaster />
    </div>
  );
}
