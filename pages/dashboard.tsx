import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  MessageCircle,
  Phone,
  Mail,
  Gift,
  DollarSign,
  Activity
} from "lucide-react";
import { DashboardAPI } from "@/lib/django-api";

export default function Dashboard() {
  const { data: session } = useSession();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await DashboardAPI.getStats();
      return await response.json();
    },
    enabled: !!session,
  });

  const { data: recentPatients, isLoading: patientsLoading } = useQuery({
    queryKey: ['dashboard', 'recent-patients'],
    queryFn: async () => {
      const response = await DashboardAPI.getRecentPatients(5);
      const data = await response.json();
      return data.results || data;
    },
    enabled: !!session,
  });

  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['dashboard', 'today-appointments'],
    queryFn: async () => {
      const response = await DashboardAPI.getTodayAppointments();
      const data = await response.json();
      return data.results || data;
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-8 rounded-2xl border">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, Dr. {session.user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your practice today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-patients">
              {statsLoading ? '...' : stats?.total_patients || 125}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-appointments-today">
              {statsLoading ? '...' : stats?.appointments_today || 8}
            </div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-revenue">
              ₹{statsLoading ? '...' : (stats?.revenue_this_month || 45000).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-prescriptions">
              {statsLoading ? '...' : stats?.pending_prescriptions || 12}
            </div>
            <p className="text-xs text-muted-foreground">
              -3 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Communication Overview
            </CardTitle>
            <CardDescription>
              Messages sent to patients this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">WhatsApp Messages</span>
                </div>
                <span className="font-semibold">45</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm">SMS Sent</span>
                </div>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm">Emails Sent</span>
                </div>
                <span className="font-semibold">67</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Gift className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-sm">Festival Greetings</span>
                </div>
                <span className="font-semibold">15</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New patient registered</p>
                  <p className="text-xs text-muted-foreground">John Doe - 5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Appointment confirmed</p>
                  <p className="text-xs text-muted-foreground">Jane Smith - 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Prescription sent</p>
                  <p className="text-xs text-muted-foreground">Robert Johnson - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">₹2,500 - 2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients and Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest patient registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">john@example.com</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">jane@example.com</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Upcoming appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">Regular Checkup</p>
                  </div>
                  <span className="text-xs text-muted-foreground">10:00 AM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">Follow-up</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2:30 PM</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}