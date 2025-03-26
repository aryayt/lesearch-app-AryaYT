"use client";
import type { PropsWithChildren } from "react";

import FullScreenLoading from "@/components/full-screen-loading";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useEffectOnce } from "react-use"; // You'll need to install react-use package

// Dynamically import the layout wrapper for better performance
const LayoutWrapper = dynamic(() => import("./_components/layout-wrapper"), {
  ssr: false,
  loading: () => <FullScreenLoading />,
});

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
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  );
}