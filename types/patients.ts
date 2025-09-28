export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  lastVisit: string;
  status: "active" | "inactive";
}

// API response types based on your backend payload
export type DjangoPatient = {
    id: number;
    mobile_number: string;
    full_name: string;
    age: number | null;
    gender: string | null;
    email: string | null;
    address: string;
    emergency_contact: string | null;
    date_of_birth: string | null;
    known_allergies: string;
    medical_history: string;
    lifestyle_information: string;
    created_at: string;
    updated_at: string;
    doctor: number;
};

export type DjangoPaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};
