"use client";
import type{ PropsWithChildren } from "react";
import { memo, useEffect } from "react";
import FullScreenLoading from "@/components/full-screen-loading";
import LayoutWrapper from "../../components/sidebar/layout-wrapper";
import { redirect, usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useEffectOnce } from "react-use"; // You'll need to install react-use package
import { useStore } from "@/store/useCollectionStore";
import { usePanelStore } from "@/store/usePanelStore";

// Memoize the LayoutWrapper to prevent unnecessary re-renders
const MemoizedLayoutWrapper = memo(LayoutWrapper);

export default function MainLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isDocumentPage = pathname.startsWith("/documents") && pathname !== "/documents";
  const { user, fetchUser } = useUserStore();
  const { setActiveItem } = useStore();
  const { setActivePageId } = usePanelStore();
  // Hook into user store on mount
  useEffectOnce(() => {
    if (!user) {
      fetchUser();
    }
  });

  useEffect(() => {
    if (!isDocumentPage) {
      setActiveItem(null);
      setActivePageId("");
    }
  }, [isDocumentPage, setActiveItem, setActivePageId]);

  // Show loading while fetching user data
  if (user === undefined) {
    return <FullScreenLoading />;
  }

  // Redirect if user is not logged in
  if (!user) {
    return redirect("/login");
  }

  // Redirect if profile is not completed
  if (!user.user_metadata.isLoggedin) {
    return redirect("/complete-profile");
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MemoizedLayoutWrapper>
        {children}
      </MemoizedLayoutWrapper>
    </div>
  );
}