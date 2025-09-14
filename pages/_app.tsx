import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import dynamic from "next/dynamic";

// Dynamically import dashboard-only components to reduce shared bundle size
const SidebarProvider = dynamic(() => import("@/components/ui/sidebar").then(mod => ({ default: mod.SidebarProvider })), { ssr: false });
const SidebarTrigger = dynamic(() => import("@/components/ui/sidebar").then(mod => ({ default: mod.SidebarTrigger })), { ssr: false });
const AppSidebar = dynamic(() => import("@/components/AppSidebar").then(mod => ({ default: mod.AppSidebar })), { ssr: false });
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(mod => ({ default: mod.ThemeToggle })), { ssr: false });
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Pin, Megaphone } from "lucide-react";
import type { Announcement } from "@shared/schema";
import "@/index.css";

// Global Announcement Banner Component
function AnnouncementBanner() {
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('dismissedAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
    refetchOnWindowFocus: false, // Disable automatic refetching to improve performance
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Find the most recent pinned or latest announcement that hasn't been dismissed
  const currentAnnouncement = announcements.find((announcement: Announcement) => 
    !dismissedAnnouncements.includes(announcement.id) && 
    (announcement.isPinned || announcements.indexOf(announcement) === 0)
  );

  const dismissAnnouncement = (announcementId: string) => {
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    }
  };

  if (!currentAnnouncement) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-200 dark:border-blue-800">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {currentAnnouncement.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={
                  currentAnnouncement.category === 'feature' ? 'default' :
                  currentAnnouncement.category === 'pricing' ? 'destructive' :
                  currentAnnouncement.category === 'update' ? 'secondary' : 'outline'
                } className="text-xs">
                  {currentAnnouncement.category}
                </Badge>
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {currentAnnouncement.title}
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 line-clamp-2">
                {currentAnnouncement.message}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissAnnouncement(currentAnnouncement.id)}
            className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            data-testid="button-dismiss-announcement"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <AnnouncementBanner />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Determine if this is a dashboard page that needs the sidebar layout
  const isDashboardPage = router.pathname.startsWith('/dashboard') || 
                          router.pathname.startsWith('/patients') || 
                          router.pathname.startsWith('/revenue') ||
                          router.pathname.startsWith('/appointments') ||
                          router.pathname.startsWith('/documents') ||
                          router.pathname.startsWith('/prescriptions') ||
                          router.pathname.startsWith('/billing') ||
                          router.pathname.startsWith('/communication') ||
                          router.pathname.startsWith('/announcements') ||
                          router.pathname.startsWith('/reports') ||
                          router.pathname.startsWith('/feedback') ||
                          router.pathname.startsWith('/settings');

  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            {isDashboardPage ? (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            ) : (
              <Component {...pageProps} />
            )}
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}