import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Image, Eye, Plus, FilePlus, Receipt, Send, Download, Stethoscope, CreditCard, RotateCcw, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { BillingForm } from "@/components/BillingForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { downloadPatientPDF, getPatientPDFBlob } from "@/lib/pdfGenerator";
import type { Patient, Prescription, Bill, Medicine } from "@shared/schema";

// Component for prescription status buttons
function PrescriptionStatusButton({ prescription, targetStatus, patientId }: {
  prescription: Prescription;
  targetStatus: 'active' | 'completed';
  patientId: string;
}) {
  const { toast } = useToast();
  
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', `/api/prescriptions/${prescription.id}`, { status: targetStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions', patientId] });
      toast({
        title: "Success",
        description: `Prescription marked as ${targetStatus}`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prescription status",
        variant: "destructive"
      });
    }
  });

  if ((targetStatus === 'completed' && prescription.status !== 'active') ||
      (targetStatus === 'active' && prescription.status !== 'completed')) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => updateStatusMutation.mutate()}
      disabled={updateStatusMutation.isPending}
      data-testid={`button-${targetStatus === 'completed' ? 'complete' : 'activate'}-prescription-${prescription.id}`}
      className={targetStatus === 'completed' 
        ? "text-green-600 hover:text-green-700 hover:bg-green-50"
        : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      }
    >
      {targetStatus === 'completed' ? <FilePlus className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
    </Button>
  );
}

// Component for billing status buttons
function BillingStatusButton({ bill, targetStatus, patientId }: {
  bill: Bill;
  targetStatus: 'paid' | 'pending';
  patientId: string;
}) {
  const { toast } = useToast();
  
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const payload = targetStatus === 'paid' 
        ? { status: targetStatus, paidAt: new Date().toISOString() }
        : { status: targetStatus };
      
      return apiRequest('PATCH', `/api/bills/${bill.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills', patientId] });
      toast({
        title: "Success",
        description: `Bill marked as ${targetStatus}`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive"
      });
    }
  });

  if ((targetStatus === 'paid' && bill.status !== 'pending') ||
      (targetStatus === 'pending' && bill.status !== 'paid')) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => updateStatusMutation.mutate()}
      disabled={updateStatusMutation.isPending}
      data-testid={`button-mark-${targetStatus}-${bill.id}`}
      className={targetStatus === 'paid' 
        ? "text-green-600 hover:text-green-700 hover:bg-green-50"
        : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
      }
    >
      {targetStatus === 'paid' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
    </Button>
  );
}

export default function PatientDetails() {
  const router = useRouter();
  const { id: patientId } = router.query;
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showAddBilling, setShowAddBilling] = useState(false);
  const [billingPrescriptionId, setBillingPrescriptionId] = useState<string | undefined>(undefined);
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<{id: string; name: string; type: string; date: string; size: string} | null>(null);
  const { toast } = useToast();

  // patientId is now extracted from router.query above

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
            {/* Known Allergies Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Known Allergies
                  </CardTitle>
                  <Link href={`/patients/${patient?.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {patient?.allergies ? (
                  <p className="whitespace-pre-wrap">{patient.allergies}</p>
                ) : (
                  <p className="text-muted-foreground italic">No known allergies recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Medical History Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Medical History
                  </CardTitle>
                  <Link href={`/patients/${patient?.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {patient?.medicalHistory ? (
                  <p className="whitespace-pre-wrap">{patient.medicalHistory}</p>
                ) : (
                  <p className="text-muted-foreground italic">No medical history recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Lifestyle Information Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Lifestyle Information
                  </CardTitle>
                  <Link href={`/patients/${patient?.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {patient?.lifestyle ? (
                  <p className="whitespace-pre-wrap">{patient.lifestyle}</p>
                ) : (
                  <p className="text-muted-foreground italic">No lifestyle information recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Patient Documents & Files
                </CardTitle>
                <Dialog open={showUploadDocument} onOpenChange={setShowUploadDocument}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-upload-document">
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md" aria-describedby="upload-document-description">
                    <DialogHeader>
                      <DialogTitle>Upload New Document</DialogTitle>
                    </DialogHeader>
                    <p id="upload-document-description" className="text-sm text-muted-foreground">
                      Upload a new document for this patient. Supported formats: PDF, JPG, PNG, DOC, DOCX.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Document Type</label>
                        <select className="w-full p-2 border rounded-md mt-1">
                          <option value="prescription">Prescription</option>
                          <option value="test_report">Test Report</option>
                          <option value="x_ray">X-Ray</option>
                          <option value="medical_report">Medical Report</option>
                          <option value="insurance">Insurance Document</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <input 
                          type="text" 
                          placeholder="Enter document description..."
                          className="w-full p-2 border rounded-md mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Upload File</label>
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="w-full p-2 border rounded-md mt-1"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => {
                            setShowUploadDocument(false);
                            toast({
                              title: "Document Uploaded",
                              description: "Document has been uploaded successfully"
                            });
                          }}
                          className="flex-1"
                        >
                          Upload
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowUploadDocument(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mock document list for demonstration */}
              <div className="space-y-3">
                {[
                  { id: "1", name: "Blood Test Report", type: "test_report", date: "2024-01-15", size: "2.5 MB" },
                  { id: "2", name: "X-Ray Chest", type: "x_ray", date: "2024-01-10", size: "4.1 MB" },
                  { id: "3", name: "Previous Prescription", type: "prescription", date: "2024-01-08", size: "1.2 MB" }
                ].map((document) => (
                  <div key={document.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" data-testid={`document-${document.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{document.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="capitalize">{document.type.replace('_', ' ')}</span>
                            <span>{document.date}</span>
                            <span>{document.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" data-testid={`button-view-document-${document.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              data-testid={`button-edit-document-${document.id}`}
                              onClick={() => setEditingDocument(document)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md" aria-describedby="edit-document-description">
                            <DialogHeader>
                              <DialogTitle>Edit Document</DialogTitle>
                            </DialogHeader>
                            <p id="edit-document-description" className="text-sm text-muted-foreground">
                              Update document information and optionally replace the file.
                            </p>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Document Name</label>
                                <input 
                                  type="text" 
                                  defaultValue={document.name}
                                  className="w-full p-2 border rounded-md mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Document Type</label>
                                <select className="w-full p-2 border rounded-md mt-1" defaultValue={document.type}>
                                  <option value="prescription">Prescription</option>
                                  <option value="test_report">Test Report</option>
                                  <option value="x_ray">X-Ray</option>
                                  <option value="medical_report">Medical Report</option>
                                  <option value="insurance">Insurance Document</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Replace File (Optional)</label>
                                <input 
                                  type="file" 
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  className="w-full p-2 border rounded-md mt-1"
                                />
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button 
                                  onClick={() => {
                                    setEditingDocument(null);
                                    toast({
                                      title: "Document Updated",
                                      description: "Document has been updated successfully"
                                    });
                                  }}
                                  className="flex-1"
                                >
                                  Save Changes
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingDocument(null)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this document?")) {
                              toast({
                                title: "Document Deleted",
                                description: "Document has been deleted successfully"
                              });
                            }
                          }}
                          data-testid={`button-delete-document-${document.id}`}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-download-document-${document.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty state when no documents */}
                {false && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowUploadDocument(true)}
                      data-testid="button-upload-first-document"
                    >
                      Upload First Document
                    </Button>
                  </div>
                )}
              </div>
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
                                      {prescription.medicines.map((medicine: any, index: number) => (
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-edit-prescription-${prescription.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Prescription</DialogTitle>
                                </DialogHeader>
                                <PrescriptionForm 
                                  preselectedPatientId={patient?.id}
                                  editingPrescription={prescription}
                                  onSubmit={() => {
                                    queryClient.invalidateQueries({ queryKey: ['/api/prescriptions', patientId] });
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                            <PrescriptionStatusButton 
                              prescription={prescription} 
                              targetStatus="completed" 
                              patientId={patientId!}
                            />
                            <PrescriptionStatusButton 
                              prescription={prescription} 
                              targetStatus="active" 
                              patientId={patientId!}
                            />
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-edit-bill-${bill.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Bill</DialogTitle>
                                </DialogHeader>
                                <BillingForm 
                                  preselectedPatientId={patient?.id}
                                  editingBill={bill}
                                  isEditing={true}
                                  onSubmit={() => {
                                    queryClient.invalidateQueries({ queryKey: ['/api/bills', patientId] });
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                            <BillingStatusButton 
                              bill={bill} 
                              targetStatus="paid" 
                              patientId={patientId!}
                            />
                            <BillingStatusButton 
                              bill={bill} 
                              targetStatus="pending" 
                              patientId={patientId!}
                            />
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