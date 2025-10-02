import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {UploadedFile} from "@/types/file_upload.ts"


interface FileUploadProps {
  patientId?: string;
  onUpload?: (files: File[]) => void;
}

export function FileUpload({ patientId, onUpload }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    // todo: remove mock functionality
    {
      id: "1",
      name: "blood_test_report.pdf",
      size: 1024000,
      type: "application/pdf",
      uploadDate: "2024-01-10",
    },
    {
      id: "2",
      name: "xray_chest.jpg",
      size: 2048000,
      type: "image/jpeg",
      uploadDate: "2024-01-08",
    },
  ]);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log('Files dropped:', acceptedFiles);
      onUpload?.(acceptedFiles);
      
      // Simulate file upload
      const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString().split('T')[0],
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      toast({
        title: "Files Uploaded",
        description: `${acceptedFiles.length} file(s) uploaded successfully.`,
      });
    },
    [onUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "File Deleted",
      description: "File has been removed successfully.",
    });
  };

  const handleViewFile = (file: UploadedFile) => {
    console.log('View file:', file.name);
    toast({
      title: "View File",
      description: "File viewing functionality will be implemented.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    if (type.includes('image')) return 'bg-green-100 text-green-800';
    if (type.includes('pdf')) return 'bg-red-100 text-red-800';
    if (type.includes('word') || type.includes('document')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Patient Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            data-testid="file-upload-zone"
          >
            <input {...getInputProps()} data-testid="file-input" />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select files
                </p>
                <p className="text-sm text-muted-foreground">
                  Supported: Images, PDF, Word documents (Max 10MB each)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {/*<Card>*/}
        {/*<CardHeader>*/}
        {/*  <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>*/}
        {/*</CardHeader>*/}
        {/*<CardContent>*/}
        {/*  {uploadedFiles.length === 0 ? (*/}
        {/*    <div className="text-center py-8 text-muted-foreground">*/}
        {/*      <File className="mx-auto h-12 w-12 mb-4" />*/}
        {/*      <p>No files uploaded yet.</p>*/}
        {/*    </div>*/}
        {/*  ) : (*/}
        {/*    <div className="space-y-3">*/}
        {/*      {uploadedFiles.map((file) => (*/}
        {/*        <div */}
        {/*          key={file.id} */}
        {/*          className="flex items-center justify-between p-3 border rounded-lg hover-elevate"*/}
        {/*          data-testid={`uploaded-file-${file.id}`}*/}
        {/*        >*/}
        {/*          <div className="flex items-center gap-3 flex-1">*/}
        {/*            <File className="h-5 w-5 text-muted-foreground" />*/}
        {/*            <div className="flex-1 min-w-0">*/}
        {/*              <p className="font-medium truncate">{file.name}</p>*/}
        {/*              <div className="flex items-center gap-2 text-sm text-muted-foreground">*/}
        {/*                <span>{formatFileSize(file.size)}</span>*/}
        {/*                <span>•</span>*/}
        {/*                <span>{file.uploadDate}</span>*/}
        {/*              </div>*/}
        {/*            </div>*/}
        {/*            <Badge className={getFileTypeColor(file.type)}>*/}
        {/*              {file.type.split('/')[1]?.toUpperCase() || 'FILE'}*/}
        {/*            </Badge>*/}
        {/*          </div>*/}
        {/*          <div className="flex gap-2">*/}
        {/*            <Button*/}
        {/*              size="sm"*/}
        {/*              variant="outline"*/}
        {/*              onClick={() => handleViewFile(file)}*/}
        {/*              data-testid={`button-view-file-${file.id}`}*/}
        {/*            >*/}
        {/*              <Eye className="h-4 w-4" />*/}
        {/*            </Button>*/}
        {/*            <Button*/}
        {/*              size="sm"*/}
        {/*              variant="outline"*/}
        {/*              onClick={() => handleDeleteFile(file.id)}*/}
        {/*              data-testid={`button-delete-file-${file.id}`}*/}
        {/*            >*/}
        {/*              <X className="h-4 w-4" />*/}
        {/*            </Button>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      ))}*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*</CardContent>*/}
      {/*</Card>*/}


    </div>
  );
}