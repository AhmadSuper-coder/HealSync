import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Prescription as BasePrescription, Medicine } from "@shared/schema";

type Prescription = Omit<BasePrescription, 'medicines'> & {
  medicines: Medicine[];
};

interface ViewPrescriptionDialogProps {
  prescription: Prescription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPrescriptionDialog({ prescription, open, onOpenChange }: ViewPrescriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <p>{prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'Unknown'}</p>
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
                {prescription.medicines.map((medicine: Medicine, index: number) => (
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
              <p className="text-sm">{prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'Not set'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
