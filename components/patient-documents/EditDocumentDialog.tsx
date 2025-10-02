import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DocumentAPI } from "@/lib/django-api";

interface Document {
  id: string | number;
  name: string;
  type: string;
  date: string;
  size: string;
}

interface EditDocumentDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export function EditDocumentDialog({ document, open, onOpenChange, patientId }: EditDocumentDialogProps) {
  const [name, setName] = useState(document.name);
  const [documentType, setDocumentType] = useState(document.type);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (file) {
        // If a new file is provided, delete old and upload new
        await DocumentAPI.delete(Number(document.id));
        const metadata = {
          patient_id: Number(patientId),
          type: documentType,
          name: name,
        };
        const response = await DocumentAPI.upload(file, metadata);
        if (!response.ok) throw new Error('Failed to upload updated document');
        return response.json();
      } else {
        // Just update metadata (not implemented in current API, would need PATCH endpoint)
        toast({
          title: "Note",
          description: "Document metadata update requires uploading a new file",
          variant: "default"
        });
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
      toast({
        title: "Document Updated",
        description: "Document has been updated successfully"
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="edit-document-description">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>
        <p id="edit-document-description" className="text-sm text-muted-foreground">
          Update document information and optionally replace the file.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Document Name</Label>
            <Input 
              id="edit-name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-edit-document-name"
            />
          </div>
          <div>
            <Label htmlFor="edit-type">Document Type</Label>
            <select 
              id="edit-type"
              className="w-full p-2 border rounded-md mt-1"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              data-testid="select-edit-document-type"
            >
              <option value="prescription">Prescription</option>
              <option value="test_report">Test Report</option>
              <option value="x_ray">X-Ray</option>
              <option value="medical_report">Medical Report</option>
              <option value="insurance">Insurance Document</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="edit-file">Replace File (Optional)</Label>
            <Input 
              id="edit-file"
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              data-testid="input-edit-document-file"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit"
              className="flex-1"
              disabled={updateMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
