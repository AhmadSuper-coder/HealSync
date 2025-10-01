

// API response types based on your backend payload
// Frontend Packet
export interface PatientRequestPacket {
    age: number;
    mobile: string;
    name: string;
    gender: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    allergies?: string;
    medicalHistory?: string;
    lifestyle?: string;
}



export type DjangoPatient = {
    age: number | null;
    mobile_number: string;
    full_name: string;
    gender: string | null;
    email: string | null;
    address: string;
    emergency_contact: string | null;
    known_allergies: string;
    medical_history: string;
    lifestyle_information: string;
};


export function mapPatientRequestToDjango(
    data: PatientRequestPacket
): Partial<DjangoPatient> {
    return {
        full_name: data.name,
        mobile_number: data.mobile,
        age: data.age ?? null,
        gender: data.gender ?? null,
        email: data.email ?? null,
        address: data.address ?? "",
        emergency_contact: data.emergencyContact ?? null,
        known_allergies: data.allergies ?? "",
        medical_history: data.medicalHistory ?? "",
        lifestyle_information: data.lifestyle ?? "",
    };
}



export type DjangoPaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};


// Request: user may send only some fields
export interface PatientRequest {
    mobile_number?: string;
    full_name?: string;
    age?: number;
    gender?: "male" | "female" | "other";
    status?: "active" | "inactive";
    email?: string;
    address?: string;
    emergency_contact?: string;
    known_allergies?: string;
    medical_history?: string;
    lifestyle_information?: string;
}


// Response: always comes in this shape
export interface PatientResponse {
    id: number;
    mobile_number: string;
    full_name: string;
    age: number;
    gender: "male" | "female" | "other";
    status: "active" | "inactive";
    email: string;
    address: string;
    emergency_contact: string;
    known_allergies: string;
    medical_history: string;
    lifestyle_information: string;
    created_at: string;  // ISO timestamp
    updated_at: string;  // ISO timestamp
    doctor: number;      // doctor ID reference
}
