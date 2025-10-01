import {apiClient, post, get} from './client';
import {
    DjangoPatient,
    DjangoPaginatedResponse,
    PatientRequest,
    PatientResponse,
    PatientRequestPacket,
    mapPatientRequestToDjango
} from "@/types/patients.ts";
import {DjangoAuthResponse, GoogleProfile} from "@/types/auth.ts";



// Patient API methods
export const PatientAPI = {

    /**
     *  get the list of patients
     */

    // GET /patients/ with nobody, returns paginated results
    async getPatientList(): Promise<DjangoPaginatedResponse<DjangoPatient>> {
        return await get<DjangoPaginatedResponse<DjangoPatient>>('api/patients/');
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
  async create(patientData: PatientRequestPacket): Promise<PatientResponse> {
      // map frontend → backend
      const payload = mapPatientRequestToDjango(patientData);
      return await post<PatientResponse, Partial<DjangoPatient>>('api/patients/', payload);
  },
    // call API with backend payload
    // const response = await post<DjangoPatient, Partial<DjangoPatient>>(
    //     "api/patients/",
    //     payload
    // );

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