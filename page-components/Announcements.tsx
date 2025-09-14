import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pin } from "lucide-react";
import type { Announcement } from "@shared/schema";
import { AnnouncementAPI } from "@/lib/django-api";

export function Announcements() {
  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await AnnouncementAPI.getAll();
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      // Handle Django API response format (results array)
      return data.results || data;
    },
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-2">
            System-wide updates and notifications for all clinics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Global Announcements
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Important updates about features, pricing, and bug fixes from the development team
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((announcement: Announcement) => (
                  <div key={announcement.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" data-testid={`announcement-${announcement.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {announcement.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
                        <Badge variant={
                          announcement.category === 'feature' ? 'default' :
                          announcement.category === 'pricing' ? 'destructive' :
                          announcement.category === 'update' ? 'secondary' : 'outline'
                        }>
                          {announcement.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {announcement.publishedAt 
                          ? new Date(announcement.publishedAt).toLocaleDateString()
                          : announcement.createdAt 
                            ? new Date(announcement.createdAt).toLocaleDateString()
                            : 'N/A'
                        }
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No announcements yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Announcements are published by the development team to notify all clinics about important updates.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}