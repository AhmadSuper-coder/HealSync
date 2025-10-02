import {apiClient, post, get} from './client';
import {
    DjangoPatient,
    DjangoPaginatedResponse,
    PatientRequest,
    PatientResponse,
    PatientRequestPacket,
    mapPatientRequestToDjango,
} from "@/types/patients.ts";

import {DocumentConfirmRequest, preSignedUrlRequest, SignUploadResponse, DocumentConfirmResponse, DocumentItemResponse} from "@/types/document.ts"
import {DjangoAuthResponse, GoogleProfile} from "@/types/auth.ts";


// Patient API methods
export const DocumentAPI = {

    /**
     *  get the list of patients
     */

    // GET /patients/ with nobody, returns paginated results
    async getDocumentByPatientId(patientId: string): Promise<DocumentItemResponse> {
        return await get<DocumentItemResponse>(`api/document/view/${patientId}/`);
    },


    /**
     * Get pressing url
     */
    async getPreSignedUrl(data:preSignedUrlRequest): Promise<SignUploadResponse> {
        return await post<SignUploadResponse,preSignedUrlRequest>(
            `api/document/sign-upload/`,
            data
        );
    },

    /**
     * Confirm upload
     */
    async confirmUpload(data:DocumentConfirmRequest): Promise<DocumentConfirmResponse> {
        return await post<DocumentConfirmResponse,DocumentConfirmRequest>(
            `api/document/confirm/`,
            data
        );
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