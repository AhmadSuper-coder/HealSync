import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatientForm } from "@/components/PatientForm";

interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalHistory?: string;
  lifestyle?: string;
}

export default function EditPatient() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPatient(id);
    }
  }, [id]);

  const fetchPatient = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientUpdate = (data: any) => {
    console.log('Patient updated:', data);
    // Navigate back to patient details page
    router.push(`/patients/${id}`);
  };

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patient.id}`}>
          <Button variant="outline" size="sm" data-testid="button-back-to-patient">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patient
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Patient</h1>
          <p className="text-muted-foreground">Update {patient.name}'s information</p>
        </div>
      </div>

      {/* Patient Form */}
      <PatientForm
        initialData={{
          ...patient,
          age: patient.age.toString(),
        }}
        isEditing={true}
        onSubmit={handlePatientUpdate}
      />
    </div>
  );
}