import { useState } from 'react';
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  Activity,
  Search,
  RefreshCw
} from "lucide-react";
import { PatientAPI, Patient, PatientListResponse } from "@/lib/django-api/";

export default function Dashboard() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fetch patient list with automatic error handling via our new API client
  const {
    data: patientsData,
    isLoading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients,
    isFetching: isFetchingPatients
  } = useQuery<PatientListResponse>({
    queryKey: ['patients', 'list', { page: currentPage, limit, search: searchQuery }],
    queryFn: () => PatientAPI.list({ 
      page: currentPage, 
      limit, 
      search: searchQuery || undefined 
    }),
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure - errors are automatically shown as popups
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

  const totalPatients = patientsData?.count || 0;
  const patients = patientsData?.results || [];
  const hasNextPage = !!patientsData?.next;
  const hasPreviousPage = !!patientsData?.previous;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleRefresh = () => {
    refetchPatients();
  };

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-8 rounded-2xl border">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="dashboard-title">
          Welcome back, Dr. {session.user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your practice today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-patients">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-patients">
              {patientsLoading ? '...' : totalPatients || 125}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-appointments-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-appointments-today">
              8
            </div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-revenue">
              ₹45,000
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-prescriptions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-prescriptions">
              12
            </div>
            <p className="text-xs text-muted-foreground">
              -3 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List Section */}
      <Card data-testid="card-patient-list">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>
                Search and manage patient records from Django backend
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isFetchingPatients}
              variant="outline"
              size="sm"
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingPatients ? 'animate-spin' : ''}`} />
              {isFetchingPatients ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search patients by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                data-testid="input-patient-search"
              />
            </div>
          </div>

          {/* Patient List */}
          {patientsLoading && (
            <div className="space-y-3" data-testid="loading-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          )}

          {patientsError && (
            <div className="text-center py-8" data-testid="error-message">
              <p className="text-muted-foreground">
                Failed to load patient data. The error has been automatically shown in a popup.
              </p>
              <Button onClick={handleRefresh} className="mt-4" data-testid="button-retry">
                Try Again
              </Button>
            </div>
          )}

          {!patientsLoading && !patientsError && patients.length === 0 && (
            <div className="text-center py-8" data-testid="no-patients-message">
              <p className="text-muted-foreground">
                {searchQuery ? 'No patients found matching your search.' : 'No patients found.'}
              </p>
            </div>
          )}

          {!patientsLoading && !patientsError && patients.length > 0 && (
            <div className="space-y-3" data-testid="patient-list">
              {patients.map((patient: Patient) => (
                <div
                  key={patient.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`card-patient-${patient.id}`}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold" data-testid={`text-patient-name-${patient.id}`}>
                      {patient.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span data-testid={`text-patient-email-${patient.id}`}>
                        {patient.email}
                      </span>
                      <span data-testid={`text-patient-phone-${patient.id}`}>
                        {patient.phone}
                      </span>
                      <span data-testid={`text-patient-age-${patient.id}`}>
                        Age: {patient.age}
                      </span>
                    </div>
                    {patient.condition && (
                      <Badge variant="secondary" data-testid={`badge-condition-${patient.id}`}>
                        {patient.condition}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div data-testid={`text-last-visit-${patient.id}`}>
                      Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!patientsLoading && !patientsError && totalPatients > limit && (
            <div className="flex items-center justify-between mt-6" data-testid="pagination-controls">
              <div className="text-sm text-muted-foreground" data-testid="pagination-info">
                Page {currentPage} • {patients.length} of {totalPatients} patients
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!hasPreviousPage || isFetchingPatients}
                  data-testid="button-previous-page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasNextPage || isFetchingPatients}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication and Activity Section */}
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
    </div>
  );
}