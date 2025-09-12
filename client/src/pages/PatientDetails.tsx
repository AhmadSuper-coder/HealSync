import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Image } from "lucide-react";
import { Link } from "wouter";

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
  prescriptionImages?: string[];
}

export default function PatientDetails() {
  const [match, params] = useRoute("/patients/:id");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchPatient(params.id);
    }
  }, [params?.id]);

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
        <Link href={`/patients/${patient.id}/edit`}>
          <Button data-testid="button-edit-patient">
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
        </Link>
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
                  <span>{patient.mobile}</span>
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
                    <p className="text-sm text-muted-foreground">Mobile Number</p>
                    <p className="font-medium">{patient.mobile}</p>
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
      </Tabs>
    </div>
  );
}