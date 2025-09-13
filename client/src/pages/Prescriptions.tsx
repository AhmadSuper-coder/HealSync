import { useState, useMemo } from "react";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { PrescriptionDetails } from "@/components/PrescriptionDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Download, FileText, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Prescription } from "@shared/schema";

// Extended prescription type with additional fields from API
interface PrescriptionWithPhone extends Prescription {
  patientPhone?: string;
  medicines: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
}


export default function Prescriptions() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>("");
  const [isPrescriptionDetailsOpen, setIsPrescriptionDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all prescriptions
  const { data: prescriptions = [], isLoading } = useQuery<PrescriptionWithPhone[]>({
    queryKey: ['/api/prescriptions'],
  });

  // Filter prescriptions based on search query
  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return prescriptions;
    }
    
    const query = searchQuery.toLowerCase();
    return prescriptions.filter((prescription: PrescriptionWithPhone) => {
      const patientName = prescription.patientName?.toLowerCase() || '';
      const patientPhone = prescription.patientPhone?.toLowerCase() || '';
      
      return patientName.includes(query) || patientPhone.includes(query);
    });
  }, [prescriptions, searchQuery]);

  const handleViewPrescription = (prescription: PrescriptionWithPhone) => {
    setSelectedPrescriptionId(prescription.id);
    setIsPrescriptionDetailsOpen(true);
  };

  const handleDownloadPrescription = (prescription: PrescriptionWithPhone) => {
    console.log('Download prescription:', prescription.id);
    // TODO: Implement PDF download functionality
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const activeCount = filteredPrescriptions.filter((p: PrescriptionWithPhone) => p.status === "active").length;
  const totalCount = prescriptions.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track patient prescriptions.
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("create")}
          data-testid="button-new-prescription"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {/* Prescription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Prescriptions</p>
                <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Prescriptions</p>
                <p className="text-2xl font-bold text-green-600">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" data-testid="tab-prescription-list">Prescription List</TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create-prescription">Create Prescription</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Prescriptions</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-prescriptions"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Medicines</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading prescriptions...
                      </TableCell>
                    </TableRow>
                  ) : filteredPrescriptions.length > 0 ? (
                    filteredPrescriptions.map((prescription: PrescriptionWithPhone) => (
                    <TableRow key={prescription.id} data-testid={`prescription-row-${prescription.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prescription.patientName}</p>
                          <p className="text-sm text-muted-foreground">{prescription.patientPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {prescription.medicines?.length || 0} medicine{(prescription.medicines?.length || 0) !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(prescription.status) as any}>
                          {prescription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPrescription(prescription)}
                            data-testid={`button-view-prescription-${prescription.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPrescription(prescription)}
                            data-testid={`button-download-prescription-${prescription.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        {searchQuery ? 'No prescriptions found matching your search.' : 'No prescriptions found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <PrescriptionForm
            onSubmit={() => {
              setActiveTab("list");
              queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Prescription Details Dialog */}
      <PrescriptionDetails
        prescriptionId={selectedPrescriptionId}
        open={isPrescriptionDetailsOpen}
        onOpenChange={setIsPrescriptionDetailsOpen}
      />
    </div>
  );
}