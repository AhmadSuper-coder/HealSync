import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Send, Download } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { downloadPatientPDF, getPatientPDFBlob } from "@/lib/pdfGenerator";
import { PatientAPI, PrescriptionAPI, BillingAPI } from "@/lib/django-api";
import type { Patient, Prescription as BasePrescription, Bill, Medicine } from "@shared/schema";

// Import refactored components
import { PatientProfileCard } from "@/components/PatientProfileCard";
import { ContactInfoSection } from "@/components/ContactInfoSection";
import { PersonalDetailsSection } from "@/components/PersonalDetailsSection";
import { MedicalInfoSection } from "@/components/MedicalInfoSection";

// Import separated feature components
import { PatientDocuments } from "@/components/patient-documents/PatientDocuments";
import { PatientPrescriptions } from "@/components/patient-prescriptions/PatientPrescriptions";
import { PatientBilling } from "@/components/patient-billing/PatientBilling";

export default function PatientDetails() {
  const router = useRouter();
  const { id } = router.query;
  const patientId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const [billingPrescriptionId, setBillingPrescriptionId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  // patientId is now extracted from router.query above

  // Fetch patient data
  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ['patients', patientId],
    queryFn: async () => {
      const response = await PatientAPI.getById(Number(patientId));
      if (!response.ok) throw new Error('Failed to fetch patient');
      return response.json();
    },
    enabled: !!patientId,
  });

  // Fetch prescriptions and bills using useQuery for proper cache management
  const { data: prescriptions = [], isLoading: isPrescriptionsLoading } = useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: async () => {
      const response = await PrescriptionAPI.getAll({ patient_id: Number(patientId) });
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      const data = await response.json();
      return data.results || data;
    },
    enabled: !!patientId,
  });

  const { data: bills = [], isLoading: isBillsLoading } = useQuery({
    queryKey: ['bills', patientId],
    queryFn: async () => {
      const response = await BillingAPI.getAll({ patient_id: Number(patientId) });
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      return data.results || data;
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
        const response = await PatientAPI.sendInfo(Number(patientId), formData);

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
      <PatientProfileCard patient={patient} />

      {/* Patient Details Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic" data-testid="tab-basic-details">Basic Information</TabsTrigger>
          <TabsTrigger value="medical" data-testid="tab-medical-details">Medical History</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-patient-documents">Documents</TabsTrigger>
          <TabsTrigger value="prescriptions" data-testid="tab-prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactInfoSection patient={patient} />

            <PersonalDetailsSection patient={patient} />
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <MedicalInfoSection patient={patient} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <PatientDocuments patientId={patientId} />
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <PatientPrescriptions 
            patientId={patientId} 
            patientData={patient}
            onGenerateBill={(prescriptionId) => {
              setBillingPrescriptionId(prescriptionId);
            }}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <PatientBilling 
            patientId={patientId} 
            patientData={patient}
            preselectedPrescriptionId={billingPrescriptionId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}