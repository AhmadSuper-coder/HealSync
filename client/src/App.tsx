import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetails from "@/pages/PatientDetails";
import EditPatient from "@/pages/EditPatient";
import Appointments from "@/pages/Appointments";
import Prescriptions from "@/pages/Prescriptions";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import Communication from "@/pages/Communication";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { X, Pin, Megaphone } from "lucide-react";
import type { Announcement } from "@shared/schema";

// Global Announcement Banner Component
function AnnouncementBanner() {
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>(() => {
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
    refetchInterval: 60000, // Poll every minute for new announcements
  });

  // Find the most recent pinned or latest announcement that hasn't been dismissed
  const currentAnnouncement = announcements.find((announcement: Announcement) => 
    !dismissedAnnouncements.includes(announcement.id) && 
    (announcement.isPinned || announcements.indexOf(announcement) === 0)
  );

  const dismissAnnouncement = (announcementId: string) => {
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={Patients} />
      <Route path="/patients/:id/edit" component={EditPatient} />
      <Route path="/patients/:id" component={PatientDetails} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/prescriptions" component={Prescriptions} />
      <Route path="/billing" component={Billing} />
      <Route path="/reports" component={Reports} />
      <Route path="/communication" component={Communication} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
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
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
