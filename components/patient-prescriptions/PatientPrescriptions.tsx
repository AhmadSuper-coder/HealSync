import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope, Eye, Edit, Receipt, FilePlus, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { PrescriptionAPI } from "@/lib/django-api";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { ViewPrescriptionDialog } from "./ViewPrescriptionDialog";
import type { Prescription as BasePrescription, Medicine } from "@shared/schema";

// Extend the Prescription type to properly type the medicines field
type Prescription = Omit<BasePrescription, 'medicines'> & {
  medicines: Medicine[];
};

interface PatientPrescriptionsProps {
  patientId: string;
  patientData?: any;
  onGenerateBill?: (prescriptionId: string) => void;
}

export function PatientPrescriptions({ patientId, patientData, onGenerateBill }: PatientPrescriptionsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const { toast } = useToast();

  // Fetch prescriptions from API
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ['prescriptions', patientId],
    queryFn: async () => {
      const response = await PrescriptionAPI.getAll({ patient_id: Number(patientId) });
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      const data = await response.json();
      return data.results || data;
    },
    enabled: !!patientId,
  });

  // Update prescription status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'completed' }) => {
      const response = await PrescriptionAPI.update(id, { status });
      if (!response.ok) throw new Error('Failed to update prescription status');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] });
      toast({
        title: "Success",
        description: `Prescription marked as ${variables.status}`
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

  const activePrescriptions = prescriptions.filter((p: Prescription) => p.status === 'active').length;
  const completedPrescriptions = prescriptions.filter((p: Prescription) => p.status === 'completed').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading prescriptions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Prescriptions ({prescriptions.length})
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                preselectedPatientId={patientData?.id}
                onSubmit={() => {
                  setShowAddDialog(false);
                  queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] });
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
                  <p className="text-2xl font-bold text-green-600">{activePrescriptions}</p>
                  <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                </div>
              </Card>
              <Card className="p-4" data-testid="metric-completed-prescriptions">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{completedPrescriptions}</p>
                  <p className="text-sm text-muted-foreground">Completed Prescriptions</p>
                </div>
              </Card>
            </div>
            <div className="space-y-3">
              {prescriptions.map((prescription: Prescription) => (
                <div 
                  key={prescription.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" 
                  data-testid={`row-prescription-${prescription.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                          {prescription.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'Unknown'}
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
                          Follow-up: {prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewingPrescription(prescription)}
                        data-testid={`button-view-prescription-${prescription.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingPrescription(prescription)}
                        data-testid={`button-edit-prescription-${prescription.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {prescription.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateStatusMutation.mutate({ id: Number(prescription.id), status: 'completed' })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-complete-prescription-${prescription.id}`}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <FilePlus className="h-4 w-4" />
                        </Button>
                      )}
                      {prescription.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateStatusMutation.mutate({ id: Number(prescription.id), status: 'active' })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-activate-prescription-${prescription.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {onGenerateBill && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onGenerateBill(prescription.id)}
                          data-testid={`button-generate-bill-${prescription.id}`}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
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
              onClick={() => setShowAddDialog(true)}
              data-testid="button-add-first-prescription"
            >
              Add First Prescription
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      {editingPrescription && (
        <Dialog open={!!editingPrescription} onOpenChange={(open) => !open && setEditingPrescription(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Prescription</DialogTitle>
            </DialogHeader>
            <PrescriptionForm 
              preselectedPatientId={patientData?.id}
              onSubmit={() => {
                setEditingPrescription(null);
                queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      {viewingPrescription && (
        <ViewPrescriptionDialog
          prescription={viewingPrescription}
          open={!!viewingPrescription}
          onOpenChange={(open) => !open && setViewingPrescription(null)}
        />
      )}
    </Card>
  );
}
