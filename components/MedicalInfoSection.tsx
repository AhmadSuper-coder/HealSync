import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Stethoscope, Edit, Calendar } from "lucide-react";
import Link from "next/link";
import type { Patient } from "@shared/schema";

interface MedicalInfoSectionProps {
  patient: Patient;
}

export function MedicalInfoSection({ patient }: MedicalInfoSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <p data-testid="text-patient-medical-history" className="whitespace-pre-wrap">
              {patient.medicalHistory}
            </p>
          ) : (
            <p className="text-muted-foreground italic">No medical history recorded</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <p data-testid="text-patient-allergies" className="whitespace-pre-wrap">
              {patient.allergies}
            </p>
          ) : (
            <p className="text-muted-foreground italic">No known allergies recorded</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <p data-testid="text-patient-lifestyle" className="whitespace-pre-wrap">
              {patient.lifestyle}
            </p>
          ) : (
            <p className="text-muted-foreground italic">No lifestyle information recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}