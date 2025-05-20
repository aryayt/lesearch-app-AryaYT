"use client";
import type{ PropsWithChildren } from "react";
import { memo } from "react";
import FullScreenLoading from "@/components/full-screen-loading";
import LayoutWrapper from "../../components/sidebar/layout-wrapper";
import { redirect } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useEffectOnce } from "react-use"; // You'll need to install react-use package

// Memoize the LayoutWrapper to prevent unnecessary re-renders
const MemoizedLayoutWrapper = memo(LayoutWrapper);

export default function MainLayout({ children }: PropsWithChildren) {
  const { user, fetchUser } = useUserStore();
  
  // Hook into user store on mount
  useEffectOnce(() => {
    if (!user) {
      fetchUser();
    }
  });

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