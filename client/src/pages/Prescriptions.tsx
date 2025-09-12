import { useState } from "react";
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
import { Plus, Eye, Download, FileText } from "lucide-react";

interface Prescription {
  id: string;
  patientName: string;
  patientMobile: string;
  date: string;
  status: "active" | "completed" | "cancelled";
  medicineCount: number;
}

// todo: remove mock functionality
const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    patientName: "Rajesh Sharma",
    patientMobile: "+91 9876543210",
    date: "2024-01-15",
    status: "active",
    medicineCount: 3,
  },
  {
    id: "2",
    patientName: "Priya Patel",
    patientMobile: "+91 9876543211",
    date: "2024-01-14",
    status: "completed",
    medicineCount: 2,
  },
  {
    id: "3",
    patientName: "Amit Kumar",
    patientMobile: "+91 9876543212",
    date: "2024-01-13",
    status: "active",
    medicineCount: 4,
  },
];

export default function Prescriptions() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>("");
  const [isPrescriptionDetailsOpen, setIsPrescriptionDetailsOpen] = useState(false);

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescriptionId(prescription.id);
    setIsPrescriptionDetailsOpen(true);
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
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

  const activeCount = mockPrescriptions.filter(p => p.status === "active").length;
  const totalCount = mockPrescriptions.length;

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
              <CardTitle>Recent Prescriptions</CardTitle>
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
                  {mockPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id} data-testid={`prescription-row-${prescription.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prescription.patientName}</p>
                          <p className="text-sm text-muted-foreground">{prescription.patientMobile}</p>
                        </div>
                      </TableCell>
                      <TableCell>{prescription.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {prescription.medicineCount} medicine{prescription.medicineCount !== 1 ? 's' : ''}
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
                  ))}
                </TableBody>
              </Table>

              {mockPrescriptions.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No prescriptions found.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("create")}
                  >
                    Create First Prescription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <PrescriptionForm
            onSubmit={(data) => {
              console.log('New prescription:', data);
              setActiveTab("list");
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