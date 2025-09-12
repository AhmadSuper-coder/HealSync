import { useState } from "react";
import { PrescriptionForm } from "@/components/PrescriptionForm";
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
  date: string;
  status: "active" | "completed" | "cancelled";
  medicineCount: number;
}

// todo: remove mock functionality
const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    patientName: "Rajesh Sharma",
    date: "2024-01-15",
    status: "active",
    medicineCount: 3,
  },
  {
    id: "2",
    patientName: "Priya Patel",
    date: "2024-01-14",
    status: "completed",
    medicineCount: 2,
  },
  {
    id: "3",
    patientName: "Amit Kumar",
    date: "2024-01-13",
    status: "active",
    medicineCount: 4,
  },
];

export default function Prescriptions() {
  const [activeTab, setActiveTab] = useState("list");

  const handleViewPrescription = (prescription: Prescription) => {
    console.log('View prescription:', prescription.id);
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
    console.log('Download prescription:', prescription.id);
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
                    <TableHead>Status</TableHead>
                    <TableHead>Medicines</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">{prescription.patientName}</TableCell>
                      <TableCell>{prescription.date}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(prescription.status) as any}>
                          {prescription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{prescription.medicineCount} medicines</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPrescription(prescription)}
                            data-testid={`button-view-prescription-${prescription.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <PrescriptionForm onSubmit={(data) => {
            console.log('Prescription created:', data);
            setActiveTab("list");
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}