import { apiClient } from './client';

// Patient-related types
export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  date_of_birth: string;
  address: string;
  emergency_contact: string;
  medical_history: string;
  condition: string;
  last_visit: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  name: string;
  email: string;
  phone: string;
  age: number;
  date_of_birth: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  condition?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: number;
}

export interface PatientListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Patient[];
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  ordering?: string;
}

// Patient API methods
export const PatientAPI = {
  /**
   * Get list of patients with pagination and search
   */
  async list(params?: PatientListParams): Promise<PatientListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.ordering) queryParams.append('ordering', params.ordering);
    
    const query = queryParams.toString();
    return await apiClient.get(`/patients/${query ? `?${query}` : ''}`);
  },

  /**
   * Get patient by ID
   */
  async getById(id: number): Promise<Patient> {
    return await apiClient.get(`/patients/${id}/`);
  },

  /**
   * Create new patient
   */
  async create(patientData: CreatePatientRequest): Promise<Patient> {
    return await apiClient.post('/patients/', patientData);
  },

  /**
   * Update existing patient
   */
  async update(id: number, patientData: Partial<UpdatePatientRequest>): Promise<Patient> {
    return await apiClient.put(`/patients/${id}/`, patientData);
  },

  /**
   * Partially update patient
   */
  async patch(id: number, patientData: Partial<UpdatePatientRequest>): Promise<Patient> {
    return await apiClient.patch(`/patients/${id}/`, patientData);
  },

  /**
   * Delete patient
   */
  async delete(id: number): Promise<{ message: string }> {
    return await apiClient.delete(`/patients/${id}/`);
  },

  /**
   * Get patient's appointment history
   */
  async getAppointments(id: number): Promise<any[]> {
    return await apiClient.get(`/patients/${id}/appointments/`);
  },

  /**
   * Get patient's prescription history
   */
  async getPrescriptions(id: number): Promise<any[]> {
    return await apiClient.get(`/patients/${id}/prescriptions/`);
  },

  /**
   * Get patient's billing history
   */
  async getBills(id: number): Promise<any[]> {
    return await apiClient.get(`/patients/${id}/bills/`);
  },

  /**
   * Send patient information via WhatsApp/SMS/Email
   */
  async sendInfo(id: number, data: {
    method: 'whatsapp' | 'sms' | 'email';
    message: string;
  }): Promise<{ message: string }> {
    return await apiClient.post(`/patients/${id}/send-info/`, data);
  },
};