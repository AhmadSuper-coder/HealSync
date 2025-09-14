import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

// Django API configuration
const DJANGO_API_BASE = process.env.DJANGO_API_URL || "http://localhost:8000/api";
const API_VERSION = "v1"; // For future API versioning

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  isFormData?: boolean;
}

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  json: () => Promise<T>;
}

// Type definitions for API responses
interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  last_visit: string;
  condition: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
}

interface DashboardStats {
  total_patients: number;
  appointments_today: number;
  revenue_this_month: number;
  pending_prescriptions: number;
  communication_stats: {
    whatsapp_sent: number;
    sms_sent: number;
    emails_sent: number;
  };
}

interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
}

interface Prescription {
  id: number;
  patient_id: number;
  medicines: any[];
  instructions: string;
  date: string;
  status: string;
  follow_up_date?: string;
}

interface Bill {
  id: number;
  patient_id: number;
  amount: number;
  status: string;
  date: string;
  description: string;
  payment_method?: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  priority: string;
  author: string;
}

interface Feedback {
  id: number;
  patient_name: string;
  rating: number;
  message: string;
  date: string;
  status: string;
}

export async function djangoApiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse> {
  const {
    method = "GET",
    body,
    headers = {},
    requireAuth = true,
    isFormData = false,
  } = options;

  let authHeaders = {};

  if (requireAuth) {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error("No authentication token available. Please log in.");
    }
    authHeaders = {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }

  const config: RequestInit = {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders,
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    // In production, this would make the actual API call:
    // const response = await fetch(`${DJANGO_API_BASE}/${API_VERSION}${endpoint}`, config);
    // return await handleApiResponse(response);
    
    // For development, return mock responses
    return await mockDjangoResponse(endpoint, options) as ApiResponse;
  } catch (error) {
    console.error('Django API request failed:', error);
    throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to handle API responses (for production use)
async function handleApiResponse(response: Response): Promise<ApiResponse> {
  const data = await response.json().catch(() => null);
  
  return {
    ok: response.ok,
    status: response.status,
    data,
    error: response.ok ? undefined : data?.error || `HTTP ${response.status}`,
    json: () => Promise.resolve(data),
  };
}

// API Service Functions for easier frontend integration
export const PatientAPI = {
  getAll: (params?: { limit?: number; offset?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return djangoApiRequest(`/patients/${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => djangoApiRequest(`/patients/${id}/`),
  
  create: (patient: Partial<Patient>) => djangoApiRequest('/patients/', {
    method: 'POST',
    body: patient,
  }),
  
  update: (id: number, patient: Partial<Patient>) => djangoApiRequest(`/patients/${id}/`, {
    method: 'PUT',
    body: patient,
  }),
  
  delete: (id: number) => djangoApiRequest(`/patients/${id}/`, {
    method: 'DELETE',
  }),
  
  sendInfo: (id: number, formData: FormData) => djangoApiRequest(`/patients/${id}/send-info/`, {
    method: 'POST',
    body: formData,
    isFormData: true,
  }),
};

export const AppointmentAPI = {
  getAll: (params?: { date?: string; patient_id?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return djangoApiRequest(`/appointments/${query ? `?${query}` : ''}`);
  },
  
  create: (appointment: Partial<Appointment>) => djangoApiRequest('/appointments/', {
    method: 'POST',
    body: appointment,
  }),
  
  update: (id: number, appointment: Partial<Appointment>) => djangoApiRequest(`/appointments/${id}/`, {
    method: 'PUT',
    body: appointment,
  }),
  
  delete: (id: number) => djangoApiRequest(`/appointments/${id}/`, {
    method: 'DELETE',
  }),
};

export const PrescriptionAPI = {
  getAll: (params?: { patient_id?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return djangoApiRequest(`/prescriptions/${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => djangoApiRequest(`/prescriptions/${id}/`),
  
  create: (prescription: Partial<Prescription>) => djangoApiRequest('/prescriptions/', {
    method: 'POST',
    body: prescription,
  }),
  
  update: (id: number, prescription: Partial<Prescription>) => djangoApiRequest(`/prescriptions/${id}/`, {
    method: 'PUT',
    body: prescription,
  }),
  
  complete: (id: number) => djangoApiRequest(`/prescriptions/${id}/complete/`, {
    method: 'POST',
  }),
  
  delete: (id: number) => djangoApiRequest(`/prescriptions/${id}/`, {
    method: 'DELETE',
  }),
};

export const BillingAPI = {
  getAll: (params?: { patient_id?: number; status?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    const query = queryParams.toString();
    return djangoApiRequest(`/bills/${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => djangoApiRequest(`/bills/${id}/`),
  
  create: (bill: Partial<Bill>) => djangoApiRequest('/bills/', {
    method: 'POST',
    body: bill,
  }),
  
  update: (id: number, bill: Partial<Bill>) => djangoApiRequest(`/bills/${id}/`, {
    method: 'PUT',
    body: bill,
  }),
  
  delete: (id: number) => djangoApiRequest(`/bills/${id}/`, {
    method: 'DELETE',
  }),
};

export const DashboardAPI = {
  getStats: () => djangoApiRequest('/dashboard/stats/'),
  
  getRecentPatients: (limit = 5) => djangoApiRequest(`/patients/?limit=${limit}&ordering=-last_visit`),
  
  getTodayAppointments: () => djangoApiRequest('/appointments/?today=true'),
};

export const AuthAPI = {
  sendOTP: (mobile: string) => djangoApiRequest('/auth/send-otp/', {
    method: 'POST',
    body: { mobile },
    requireAuth: false,
  }),
  
  verifyOTP: (mobile: string, otp: string) => djangoApiRequest('/auth/verify-otp/', {
    method: 'POST',
    body: { mobile, otp },
    requireAuth: false,
  }),
  
  googleAuth: (googleProfile: any) => djangoApiRequest('/auth/google/', {
    method: 'POST',
    body: googleProfile,
    requireAuth: false,
  }),
  
  refreshToken: (refreshToken: string) => djangoApiRequest('/auth/refresh/', {
    method: 'POST',
    body: { refresh_token: refreshToken },
    requireAuth: false,
  }),
};

export const AnnouncementAPI = {
  getAll: () => djangoApiRequest('/announcements/'),
  
  create: (announcement: Partial<Announcement>) => djangoApiRequest('/announcements/', {
    method: 'POST',
    body: announcement,
  }),
  
  update: (id: number, announcement: Partial<Announcement>) => djangoApiRequest(`/announcements/${id}/`, {
    method: 'PUT',
    body: announcement,
  }),
  
  delete: (id: number) => djangoApiRequest(`/announcements/${id}/`, {
    method: 'DELETE',
  }),
};

export const FeedbackAPI = {
  getAll: () => djangoApiRequest('/feedback/'),
  
  create: (feedback: Partial<Feedback>) => djangoApiRequest('/feedback/', {
    method: 'POST',
    body: feedback,
  }),
  
  update: (id: number, feedback: Partial<Feedback>) => djangoApiRequest(`/feedback/${id}/`, {
    method: 'PUT',
    body: feedback,
  }),
};

export const ReportsAPI = {
  getPatientReport: (patientId: number, params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    const query = queryParams.toString();
    return djangoApiRequest(`/reports/patients/${patientId}/${query ? `?${query}` : ''}`);
  },
  
  getRevenueReport: (params?: { date_from?: string; date_to?: string; group_by?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.group_by) queryParams.append('group_by', params.group_by);
    
    const query = queryParams.toString();
    return djangoApiRequest(`/reports/revenue/${query ? `?${query}` : ''}`);
  },
};

export const DocumentAPI = {
  getAll: (params?: { patient_id?: number; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
    if (params?.type) queryParams.append('type', params.type);
    
    const query = queryParams.toString();
    return djangoApiRequest(`/documents/${query ? `?${query}` : ''}`);
  },
  
  upload: (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    return djangoApiRequest('/documents/', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
  
  download: (id: number) => djangoApiRequest(`/documents/${id}/download/`),
  
  delete: (id: number) => djangoApiRequest(`/documents/${id}/`, {
    method: 'DELETE',
  }),
};

// Mock Django API responses for development
function mockDjangoResponse(endpoint: string, options: ApiRequestOptions) {
  console.log(`Mock Django API call: ${options.method || "GET"} ${endpoint}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      // Handle endpoints with query parameters
      const baseEndpoint = endpoint.split('?')[0];
      
      switch (baseEndpoint) {
        case "/patients/":
          resolve({
            ok: true,
            json: () => Promise.resolve({
              count: 25,
              results: [
                {
                  id: 1,
                  name: "John Doe",
                  email: "john@example.com",
                  phone: "+1234567890",
                  age: 35,
                  last_visit: "2024-01-15",
                  condition: "Regular Checkup"
                },
                {
                  id: 2,
                  name: "Jane Smith",
                  email: "jane@example.com",
                  phone: "+1234567891",
                  age: 28,
                  last_visit: "2024-01-20",
                  condition: "Diabetes Follow-up"
                }
              ]
            })
          });
          break;
          
        case "/dashboard/stats/":
          resolve({
            ok: true,
            json: () => Promise.resolve({
              total_patients: 125,
              appointments_today: 8,
              revenue_this_month: 45000,
              pending_prescriptions: 12,
              communication_stats: {
                whatsapp_sent: 45,
                sms_sent: 23,
                emails_sent: 67
              }
            })
          });
          break;
          
        case "/appointments/":
          resolve({
            ok: true,
            json: () => Promise.resolve({
              count: 15,
              results: [
                {
                  id: 1,
                  patient_name: "John Doe",
                  date: "2024-01-25",
                  time: "10:00 AM",
                  type: "Consultation",
                  status: "confirmed"
                },
                {
                  id: 2,
                  patient_name: "Jane Smith",
                  date: "2024-01-25",
                  time: "2:30 PM",
                  type: "Follow-up",
                  status: "pending"
                }
              ]
            })
          });
          break;
          
        case "/revenue/":
          resolve({
            ok: true,
            json: () => Promise.resolve({
              monthly_revenue: [
                { month: "Jan", amount: 45000 },
                { month: "Feb", amount: 52000 },
                { month: "Mar", amount: 48000 }
              ],
              payment_methods: {
                cash: 35000,
                card: 28000,
                online: 17000
              }
            })
          });
          break;
          
        case "/documents/":
          resolve({
            ok: true,
            json: () => Promise.resolve({
              count: 45,
              results: [
                {
                  id: 1,
                  title: "Lab Report - John Doe",
                  type: "lab_report",
                  date: "2024-01-20",
                  size: "2.5 MB"
                },
                {
                  id: 2,
                  title: "Prescription - Jane Smith",
                  type: "prescription",
                  date: "2024-01-22",
                  size: "500 KB"
                }
              ]
            })
          });
          break;
          
        case "/announcements/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              count: 3,
              results: [
                {
                  id: 1,
                  title: "Clinic Holiday Notice",
                  message: "The clinic will be closed on December 25th for Christmas.",
                  date: "2024-12-20",
                  priority: "high",
                  author: "Dr. Smith"
                },
                {
                  id: 2,
                  title: "New Services Available",
                  message: "We now offer telemedicine consultations.",
                  date: "2024-12-15",
                  priority: "medium",
                  author: "Admin"
                }
              ]
            })
          });
          break;

        case "/prescriptions/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              count: 12,
              results: [
                {
                  id: 1,
                  patient_id: 1,
                  medicines: [
                    { name: "Arnica Montana 30C", dosage: "3 drops, 3 times daily" },
                    { name: "Belladonna 200C", dosage: "2 drops, twice daily" }
                  ],
                  instructions: "Take with water 30 minutes before meals",
                  date: "2024-01-20",
                  status: "active",
                  follow_up_date: "2024-02-20"
                },
                {
                  id: 2,
                  patient_id: 2,
                  medicines: [
                    { name: "Nux Vomica 30C", dosage: "4 drops, morning only" }
                  ],
                  instructions: "Avoid coffee and spicy foods",
                  date: "2024-01-22",
                  status: "completed",
                  follow_up_date: "2024-02-22"
                }
              ]
            })
          });
          break;

        case "/bills/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              count: 8,
              results: [
                {
                  id: 1,
                  patient_id: 1,
                  amount: 150.00,
                  status: "paid",
                  date: "2024-01-20",
                  description: "Consultation and medicine",
                  payment_method: "cash"
                },
                {
                  id: 2,
                  patient_id: 2,
                  amount: 200.00,
                  status: "pending",
                  date: "2024-01-22",
                  description: "Follow-up consultation",
                  payment_method: "card"
                }
              ]
            })
          });
          break;

        case "/feedback/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              count: 5,
              results: [
                {
                  id: 1,
                  patient_name: "John Doe",
                  rating: 5,
                  message: "Excellent treatment and care. Highly recommended!",
                  date: "2024-01-18",
                  status: "approved"
                },
                {
                  id: 2,
                  patient_name: "Jane Smith",
                  rating: 4,
                  message: "Good experience, professional staff.",
                  date: "2024-01-16",
                  status: "approved"
                }
              ]
            })
          });
          break;

        case "/auth/send-otp/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              success: true,
              message: "OTP sent successfully",
              otp_id: "otp_" + Date.now()
            })
          });
          break;

        case "/auth/verify-otp/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              success: true,
              message: "OTP verified successfully",
              patient_id: 1,
              access_token: "mock_access_token_" + Date.now()
            })
          });
          break;

        case "/auth/google/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              access_token: "mock_django_access_token_" + Date.now(),
              refresh_token: "mock_django_refresh_token_" + Date.now(),
              doctor_id: "doc_" + Date.now(),
              expires_in: 3600
            })
          });
          break;

        case "/auth/refresh/":
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              access_token: "refreshed_mock_access_token_" + Date.now(),
              expires_in: 3600
            })
          });
          break;

        default:
          // Handle dynamic endpoints with IDs
          if (endpoint.match(/^\/patients\/\d+\/$/)) {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                phone: "+1234567890",
                age: 35,
                last_visit: "2024-01-15",
                condition: "Regular Checkup",
                date_of_birth: "1989-06-15",
                address: "123 Main St, City, State",
                emergency_contact: "Jane Doe - +1234567891",
                medical_history: "No known allergies. Previous treatments for anxiety."
              })
            });
          } else if (endpoint.match(/^\/patients\/\d+\/send-info\/$/)) {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                success: true,
                message: "Information sent successfully"
              })
            });
          } else if (endpoint.match(/^\/prescriptions\/\d+\/$/)) {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                id: 1,
                patient_id: 1,
                medicines: [
                  { name: "Arnica Montana 30C", dosage: "3 drops, 3 times daily" },
                  { name: "Belladonna 200C", dosage: "2 drops, twice daily" }
                ],
                instructions: "Take with water 30 minutes before meals",
                date: "2024-01-20",
                status: "active",
                follow_up_date: "2024-02-20"
              })
            });
          } else if (endpoint.match(/^\/prescriptions\/\d+\/complete\/$/)) {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                success: true,
                message: "Prescription marked as completed"
              })
            });
          } else if (endpoint.match(/^\/bills\/\d+\/$/)) {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                id: 1,
                patient_id: 1,
                amount: 150.00,
                status: "paid",
                date: "2024-01-20",
                description: "Consultation and medicine",
                payment_method: "cash"
              })
            });
          } else if (endpoint.match(/^\/reports\/patients\/\d+\/$/)) {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                patient_info: {
                  id: 1,
                  name: "John Doe",
                  age: 35
                },
                total_visits: 5,
                total_spent: 750.00,
                recent_prescriptions: 3,
                last_visit: "2024-01-20"
              })
            });
          } else {
            // Handle POST, PUT, DELETE operations
            if (options.method === "POST") {
              resolve({
                ok: true,
                status: 201,
                json: () => Promise.resolve({
                  success: true,
                  message: "Resource created successfully",
                  id: Math.floor(Math.random() * 1000) + 1
                })
              });
            } else if (options.method === "PUT" || options.method === "PATCH") {
              resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({
                  success: true,
                  message: "Resource updated successfully"
                })
              });
            } else if (options.method === "DELETE") {
              resolve({
                ok: true,
                status: 204,
                json: () => Promise.resolve({
                  success: true,
                  message: "Resource deleted successfully"
                })
              });
            } else {
              resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ message: "Mock response for " + endpoint })
              });
            }
          }
      }
    }, 300); // Simulate network delay
  });
}

export default djangoApiRequest;