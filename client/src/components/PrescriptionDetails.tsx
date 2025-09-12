import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Clock,
  Pill
} from "lucide-react";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientMobile: string;
  medicines: Medicine[];
  instructions?: string;
  date: string;
  followUpDate?: string;
}

interface PrescriptionDetailsProps {
  prescriptionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrescriptionDetails({ prescriptionId, open, onOpenChange }: PrescriptionDetailsProps) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && prescriptionId) {
      fetchPrescription(prescriptionId);
    }
  }, [open, prescriptionId]);

  const fetchPrescription = async (id: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPrescription(data);
      }
    } catch (error) {
      console.error('Failed to fetch prescription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prescription Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : prescription ? (
          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(prescription.patientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{prescription.patientName}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{prescription.patientMobile}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Prescription Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prescription Date</p>
                    <p className="font-medium">{formatDate(prescription.date)}</p>
                  </div>
                  {prescription.followUpDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Follow-up Date</p>
                      <p className="font-medium">{formatDate(prescription.followUpDate)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medicines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescribed Medicines ({prescription.medicines.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescription.medicines.map((medicine, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{medicine.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Dosage:</span>
                              <p className="font-medium">{medicine.dosage}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequency:</span>
                              <p className="font-medium">{medicine.frequency}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span>
                              <p className="font-medium">{medicine.duration}</p>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          Medicine {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            {prescription.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Special Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{prescription.instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Generated on {formatDate(prescription.date)}</span>
              </div>
              <Button onClick={() => onOpenChange(false)} data-testid="button-close-prescription">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Prescription not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}