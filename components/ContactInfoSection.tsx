import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";
import type { Patient } from "@shared/schema";

interface ContactInfoSectionProps {
  patient: Patient;
}

export function ContactInfoSection({ patient }: ContactInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm text-muted-foreground">Phone Number</p>
            <p className="font-medium" data-testid="text-patient-phone">
              {patient.phone}
            </p>
          </div>
        </div>
        
        {patient.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium" data-testid="text-patient-email">
                {patient.email}
              </p>
            </div>
          </div>
        )}

        {patient.emergencyContact && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Emergency Contact</p>
              <p className="font-medium" data-testid="text-patient-emergency-contact">
                {patient.emergencyContact}
              </p>
            </div>
          </div>
        )}
        
        {patient.address && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium" data-testid="text-patient-address">
                {patient.address}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}