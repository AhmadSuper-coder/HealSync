import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { Patient } from "@shared/schema";

interface PersonalDetailsSectionProps {
  patient: Patient;
}

export function PersonalDetailsSection({ patient }: PersonalDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-sm text-muted-foreground">Emergency Contact</p>
            <p data-testid="text-patient-emergency-contact">
              {patient.emergencyContact || "Not specified"}
            </p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground">Created On</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p data-testid="text-patient-created-at">
                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "Not available"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}