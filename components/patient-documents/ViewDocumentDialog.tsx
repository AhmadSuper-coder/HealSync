import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface Document {
  id: string | number;
  name: string;
  type: string;
  date: string;
  size: string;
  file_url?: string;
}

interface ViewDocumentDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewDocumentDialog({ document, open, onOpenChange }: ViewDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]" aria-describedby="view-document-description">
        <DialogHeader>
          <DialogTitle>View Document</DialogTitle>
        </DialogHeader>
        <p id="view-document-description" className="text-sm text-muted-foreground">
          Viewing document details and preview.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Document Name</p>
              <p className="text-muted-foreground">{document.name}</p>
            </div>
            <div>
              <p className="font-medium">Type</p>
              <p className="text-muted-foreground capitalize">{document.type.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p className="text-muted-foreground">{document.date}</p>
            </div>
            <div>
              <p className="font-medium">Size</p>
              <p className="text-muted-foreground">{document.size}</p>
            </div>
          </div>
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            {document.file_url ? (
              <iframe 
                src={document.file_url} 
                className="w-full h-96 rounded-lg"
                title={document.name}
              />
            ) : (
              <div>
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Document preview not available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the download button to view the full document
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
