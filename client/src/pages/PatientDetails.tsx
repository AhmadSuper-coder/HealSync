import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Image, Eye, Plus, FilePlus, Receipt, Send, Download, Stethoscope, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { BillingForm } from "@/components/BillingForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { downloadPatientPDF, getPatientPDFBlob } from "@/lib/pdfGenerator";
import type { Patient, Prescription, Bill, Medicine } from "@shared/schema";

export default function PatientDetails() {
  const [match, params] = useRoute("/patients/:id");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showAddBilling, setShowAddBilling] = useState(false);
  const [billingPrescriptionId, setBillingPrescriptionId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const patientId = params?.id;

  // Fetch patient data
  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ['/api/patients', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient');
      return response.json();
    },
    enabled: !!patientId,
  });

  // Fetch prescriptions and bills using useQuery for proper cache management
  const { data: prescriptions = [], isLoading: isPrescriptionsLoading } = useQuery({
    queryKey: ['/api/prescriptions', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/prescriptions?patientId=${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      return response.json();
    },
    enabled: !!patientId,
  });

  const { data: bills = [], isLoading: isBillsLoading } = useQuery({
    queryKey: ['/api/bills', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/bills?patientId=${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      return response.json();
    },
    enabled: !!patientId,
  });

  // Send patient info mutation
  const sendPatientInfoMutation = useMutation({
    mutationFn: async () => {
      if (!patient || !prescriptions || !bills) {
        throw new Error("Patient data not available");
      }

      try {
        // Generate PDF blob with patient data
        const pdfBlob = getPatientPDFBlob({
          patient,
          prescriptions,
          bills
        });

        // Create FormData to send PDF with the request
        const formData = new FormData();
        formData.append('pdf', pdfBlob, `${patient.name.replace(/\s+/g, '_')}_PatientReport.pdf`);
        formData.append('patientName', patient.name);
        formData.append('patientPhone', patient.phone || '');

        // Send the request with PDF attached
        const response = await fetch(`/api/patients/${patientId}/send-info`, {
          method: 'POST',
          body: formData,
          credentials: 'include', // Include credentials like apiRequest does
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        console.error('Error in sendPatientInfo:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Information Sent",
        description: `Patient information with PDF report has been sent to ${patient?.name} via ${data?.method || 'WhatsApp'}`,
      });
    },
    onError: (error) => {
      console.error('Send patient info error:', error);
      toast({
        title: "Error",
        description: "Failed to send patient information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendPatientInfo = () => {
    if (patient && prescriptions !== undefined && bills !== undefined) {
      sendPatientInfoMutation.mutate();
    } else {
      toast({
        title: "Error",
        description: "Patient data is not fully loaded yet. Please wait and try again.",
        variant: "destructive",
      });
    }
  };

  const downloadPatientReport = () => {
    if (patient && prescriptions && bills) {
      try {
        downloadPatientPDF({
          patient,
          prescriptions,
          bills
        });
        toast({
          title: "PDF Downloaded",
          description: "Patient report has been downloaded successfully",
        });
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toast({
          title: "Download Failed",
          description: "Failed to generate patient report PDF",
          variant: "destructive",
        });
      }
    }
  };

  if (isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Patient not found</p>
        <Link href="/patients">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="outline" size="sm" data-testid="button-back-to-patients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/patients/${patient.id}/edit`}>
            <Button variant="outline" data-testid="button-edit-patient">
              <Edit className="mr-2 h-4 w-4" />
              Edit Patient
            </Button>
          </Link>
          <Button onClick={sendPatientInfo} data-testid="button-send-patient-info">
            <Send className="mr-2 h-4 w-4" />
            Send Patient Info
          </Button>
          <Button variant="outline" onClick={downloadPatientReport} data-testid="button-download-patient-report">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Patient Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{patient.name}</h1>
                <Badge variant="outline" className="text-sm">
                  {patient.age} years • {patient.gender}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Patient Details Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic" data-testid="tab-basic-details">Basic Information</TabsTrigger>
          <TabsTrigger value="medical" data-testid="tab-medical-details">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions" data-testid="tab-prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-patient-documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                  </div>
                )}

                {patient.emergencyContact && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="font-medium">{patient.emergencyContact}</p>
                    </div>
                  </div>
                )}

                {patient.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{patient.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{patient.age} years</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">January 15, 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {patient.allergies && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Known Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{patient.allergies}</p>
                </CardContent>
              </Card>
            )}

            {patient.medicalHistory && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{patient.medicalHistory}</p>
                </CardContent>
              </Card>
            )}

            {patient.lifestyle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lifestyle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{patient.lifestyle}</p>
                </CardContent>
              </Card>
            )}

            {!patient.allergies && !patient.medicalHistory && !patient.lifestyle && (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No medical history recorded yet.</p>
                  <Link href={`/patients/${patient.id}/edit`}>
                    <Button variant="outline" className="mt-4">
                      Add Medical Information
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="h-5 w-5" />
                Prescription Images & Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.prescriptionImages && patient.prescriptionImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.prescriptionImages.map((image, index) => (
                    <div key={index} className="border rounded-lg p-4 hover-elevate cursor-pointer">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium truncate">Prescription {index + 1}</p>
                      <p className="text-xs text-muted-foreground">Uploaded document</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet.</p>
                  <Link href={`/patients/${patient.id}/edit`}>
                    <Button variant="outline" className="mt-4">
                      Upload Documents
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Prescriptions ({prescriptions.length})
                </CardTitle>
                <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-prescription">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Prescription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Prescription</DialogTitle>
                    </DialogHeader>
                    <PrescriptionForm 
                      preselectedPatientId={patient?.id}
                      onSubmit={() => {
                        setShowAddPrescription(false);
                        queryClient.invalidateQueries({ queryKey: ['/api/prescriptions', patientId] });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {prescriptions.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="p-4" data-testid="metric-active-prescriptions">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {prescriptions.filter(p => p.status === 'active').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                      </div>
                    </Card>
                    <Card className="p-4" data-testid="metric-completed-prescriptions">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {prescriptions.filter(p => p.status === 'completed').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Completed Prescriptions</p>
                      </div>
                    </Card>
                  </div>
                  <div className="space-y-3">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" data-testid={`row-prescription-${prescription.id}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                {prescription.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(prescription.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium mb-1">
                              {prescription.medicines.length} Medicine{prescription.medicines.length > 1 ? 's' : ''} Prescribed
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {prescription.medicines.slice(0, 2).map(m => m.name).join(', ')}
                              {prescription.medicines.length > 2 && ` +${prescription.medicines.length - 2} more`}
                            </p>
                            {prescription.followUpDate && (
                              <p className="text-sm text-blue-600 mt-1">
                                Follow-up: {new Date(prescription.followUpDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-view-prescription-${prescription.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Prescription Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">Status</p>
                                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                      {prescription.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="font-medium">Date</p>
                                    <p>{new Date(prescription.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium mb-2">Medicines</p>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Medicine</TableHead>
                                        <TableHead>Dosage</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Duration</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {prescription.medicines.map((medicine, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{medicine.name}</TableCell>
                                          <TableCell>{medicine.dosage}</TableCell>
                                          <TableCell>{medicine.frequency}</TableCell>
                                          <TableCell>{medicine.duration}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                {prescription.instructions && (
                                  <div>
                                    <p className="font-medium">Instructions</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{prescription.instructions}</p>
                                  </div>
                                )}
                                {prescription.followUpDate && (
                                  <div>
                                    <p className="font-medium">Follow-up Date</p>
                                    <p className="text-sm">{new Date(prescription.followUpDate).toLocaleDateString()}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setBillingPrescriptionId(prescription.id);
                                setShowAddBilling(true);
                              }}
                              data-testid={`button-generate-bill-${prescription.id}`}
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No prescriptions recorded yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddPrescription(true)}
                    data-testid="button-add-first-prescription"
                  >
                    Add First Prescription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Invoices ({bills.length})
                </CardTitle>
                <Dialog open={showAddBilling} onOpenChange={(open) => {
                  setShowAddBilling(open);
                  if (!open) {
                    setBillingPrescriptionId(undefined);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-bill">
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Generate New Bill</DialogTitle>
                    </DialogHeader>
                    <BillingForm 
                      preselectedPatientId={patient?.id}
                      preselectedPrescriptionId={billingPrescriptionId}
                      onSubmit={() => {
                        setShowAddBilling(false);
                        setBillingPrescriptionId(undefined);
                        queryClient.invalidateQueries({ queryKey: ['/api/bills', patientId] });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {bills.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4" data-testid="metric-pending-bills">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {bills.filter(b => b.status === 'pending').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Pending Bills</p>
                      </div>
                    </Card>
                    <Card className="p-4" data-testid="metric-paid-bills">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {bills.filter(b => b.status === 'paid').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Paid Bills</p>
                      </div>
                    </Card>
                    <Card className="p-4" data-testid="metric-total-paid">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          ₹{(bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0) / 100).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                      </div>
                    </Card>
                  </div>
                  <div className="space-y-3">
                    {bills.map((bill) => (
                      <div key={bill.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" data-testid={`row-bill-${bill.id}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                bill.status === 'paid' ? 'default' : 
                                bill.status === 'overdue' ? 'destructive' : 'secondary'
                              }>
                                {bill.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(bill.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium mb-1">₹{(bill.amount / 100).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{bill.description}</p>
                            {bill.paymentMethod && (
                              <p className="text-sm text-blue-600 mt-1">
                                Payment: {bill.paymentMethod}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-view-bill-${bill.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Bill Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium">Amount</p>
                                      <p className="text-lg font-bold">₹{(bill.amount / 100).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Status</p>
                                      <Badge variant={
                                        bill.status === 'paid' ? 'default' : 
                                        bill.status === 'overdue' ? 'destructive' : 'secondary'
                                      }>
                                        {bill.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="font-medium">Created</p>
                                      <p>{new Date(bill.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {bill.paidAt && (
                                      <div>
                                        <p className="font-medium">Paid</p>
                                        <p>{new Date(bill.paidAt).toLocaleDateString()}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">Description</p>
                                    <p className="text-sm text-muted-foreground">{bill.description}</p>
                                  </div>
                                  {bill.paymentMethod && (
                                    <div>
                                      <p className="font-medium">Payment Method</p>
                                      <p className="text-sm">{bill.paymentMethod}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" data-testid={`button-download-bill-${bill.id}`}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bills generated yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddBilling(true)}
                    data-testid="button-add-first-bill"
                  >
                    Generate First Bill
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}