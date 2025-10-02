import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Eye, Edit, Download, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DocumentAPI } from "@/lib/django-api";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { EditDocumentDialog } from "./EditDocumentDialog";
import { ViewDocumentDialog } from "./ViewDocumentDialog";

interface Document {
  id: string | number;
  name: string;
  type: string;
  date: string;
  size: string;
  patient_id?: number;
  file_url?: string;
}

interface PatientDocumentsProps {
  patientId: string;
}

export function PatientDocuments({ patientId }: PatientDocumentsProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  // Fetch documents from API
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', patientId],
    queryFn: async () => {
      const response = await DocumentAPI.getAll({ patient_id: Number(patientId) });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      return data.results || data;
    },
    enabled: !!patientId,
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await DocumentAPI.delete(documentId);
      if (!response.ok) throw new Error('Failed to delete document');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  // Download document mutation
  const downloadMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await DocumentAPI.download(documentId);
      if (!response.ok) throw new Error('Failed to download document');
      return response.blob();
    },
    onSuccess: (blob, documentId) => {
      const document = documents.find(d => d.id === documentId);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document?.name || 'document';
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Document is being downloaded"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(documentId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Patient Documents & Files ({documents.length})
          </CardTitle>
          <Button 
            onClick={() => setShowUploadDialog(true)}
            data-testid="button-upload-document"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document) => (
              <div 
                key={document.id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" 
                data-testid={`document-${document.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{document.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="capitalize">{document.type.replace(/_/g, ' ')}</span>
                        <span>{document.date}</span>
                        <span>{document.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setViewingDocument(document)}
                      data-testid={`button-view-document-${document.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingDocument(document)}
                      data-testid={`button-edit-document-${document.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(Number(document.id))}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-document-${document.id}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadMutation.mutate(Number(document.id))}
                      disabled={downloadMutation.isPending}
                      data-testid={`button-download-document-${document.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setShowUploadDialog(true)}
              data-testid="button-upload-first-document"
            >
              Upload First Document
            </Button>
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        patientId={patientId}
      />

      {/* Edit Dialog */}
      {editingDocument && (
        <EditDocumentDialog
          document={editingDocument}
          open={!!editingDocument}
          onOpenChange={(open) => !open && setEditingDocument(null)}
          patientId={patientId}
        />
      )}

      {/* View Dialog */}
      {viewingDocument && (
        <ViewDocumentDialog
          document={viewingDocument}
          open={!!viewingDocument}
          onOpenChange={(open) => !open && setViewingDocument(null)}
        />
      )}
    </Card>
  );
}
