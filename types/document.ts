export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: string;
}



export interface preSignedUrlRequest {
    filename: string;
    content_type: string;
    size_bytes: number;
    patient_id: number;
    document_type: string;
    description: string;
}


export interface SignUploadResponse {
    upload_url: string;
    method: string;
    headers: Record<string, string>;
    key: string;
    document_id: number;
    expires_in: number;
}


export interface DocumentConfirmRequest {
    document_id: number;
}

export interface DocumentConfirmResponse {
    status: boolean;
    download_url: string;
    download_expires_in: number;
}


export interface DocumentItemResponse {
    id: number;
    filename: string;
    content_type: string;
    document_type: string;
    size_bytes: number;
    is_uploaded: boolean;
    created_at: string; // ISO date string
    download_url: string // Tuple: [URL, expires_in_seconds]
    download_expires_in: number | null; // still optional / nullable
}

