import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import axios from "axios";
import {DocumentAPI} from "@/lib/django-api/document.ts";



export function UploadDocumentDialog({ open, onOpenChange, patientId }: UploadDocumentDialogProps) {
    const [documentType, setDocumentType] = useState("prescription");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!file) throw new Error("No file selected");

            // Step 1: Request a presigned URLconst
            const signUploadResponse = await DocumentAPI.getPreSignedUrl({
                patient_id: Number(patientId),
                document_type: documentType,
                filename: file.name,
                content_type: file.type,
                size_bytes: file.size,
                description: description,
            });

            // Step 2: Upload the file to GCS using the presigned URL
            await axios({
                method: signUploadResponse.method,
                url: signUploadResponse.upload_url,
                data: file,
                headers: signUploadResponse.headers,
            });

            // Step 3: Confirm the upload with the backend
            let confirmResponse;
            confirmResponse = await DocumentAPI.confirmUpload({
                document_id: signUploadResponse.document_id,
            });
            return confirmResponse;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
            toast({
                title: "Document Uploaded",
                description: "Document has been uploaded successfully"
            });
            onOpenChange(false);
            resetForm();
        },
        onError: (error) => {
            console.error("Upload error:", error);
            toast({
                title: "Error",
                description: "Failed to upload document",
                variant: "destructive"
            });
        }
    });

    const resetForm = () => {
        setDocumentType("prescription");
        setDescription("");
        setFile(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: "Error",
                description: "Please select a file to upload",
                variant: "destructive"
            });
            return;
        }
        uploadMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" aria-describedby="upload-document-description">
                <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                <p id="upload-document-description" className="text-sm text-muted-foreground">
                    Upload a new document for this patient. Supported formats: PDF, JPG, PNG, DOC, DOCX.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="documentType">Document Type</Label>
                        <select
                            id="documentType"
                            className="w-full p-2 border rounded-md mt-1"
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            data-testid="select-document-type"
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
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            type="text"
                            placeholder="Enter document description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            data-testid="input-document-description"
                        />
                    </div>
                    <div>
                        <Label htmlFor="file">Upload File</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            data-testid="input-document-file"
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={uploadMutation.isPending || !file}
                            data-testid="button-confirm-upload"
                        >
                            {uploadMutation.isPending ? "Uploading..." : "Upload"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                resetForm();
                            }}
                            className="flex-1"
                            data-testid="button-cancel-upload"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}