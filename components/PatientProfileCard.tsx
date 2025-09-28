import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Send, Download } from "lucide-react";
import Link from "next/link";
import type { Patient } from "@shared/schema";

interface PatientProfileCardProps {
  patient: Patient;
  onSendInfo: () => void;
  onDownloadReport: () => void;
  isSending: boolean;
}

export function PatientProfileCard({ 
  patient, 
  onSendInfo, 
  onDownloadReport, 
  isSending 
}: PatientProfileCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patients">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Patients
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl" data-testid="text-patient-name">
                  {patient.name}
                </CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge 
                    variant="outline" 
                    className="text-sm"
                    data-testid="badge-patient-id"
                  >
                    ID: {patient.id}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="text-sm"
                    data-testid="badge-patient-age"
                  >
                    Age: {patient.age}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-sm"
                    data-testid="badge-patient-gender"
                  >
                    {patient.gender}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/patients/${patient.id}/edit`}>
              <Button variant="outline" size="sm" data-testid="button-edit-patient">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSendInfo}
              disabled={isSending}
              data-testid="button-send-info"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send Info"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownloadReport}
              data-testid="button-download-report"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}