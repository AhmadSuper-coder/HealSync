import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import {DocumentItemResponse} from "@/types/document.ts";



interface ViewDocumentDialogProps {
  document: DocumentItemResponse;
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
              <p className="text-muted-foreground">{document.filename}</p>
            </div>
            <div>
              <p className="font-medium">Type</p>
              <p className="text-muted-foreground capitalize">{document.document_type.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p className="text-muted-foreground">{document.created_at}</p>
            </div>
            <div>
              <p className="font-medium">Size</p>
              <p className="text-muted-foreground">{document.size_bytes}</p>
            </div>
          </div>
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            {document.download_url ? (
              <iframe 
                src={document.download_url}
                className="w-full h-96 rounded-lg"
                title={document.filename}
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
