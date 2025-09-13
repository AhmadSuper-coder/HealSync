import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

// Mock Django API base URL
const DJANGO_API_BASE = process.env.DJANGO_API_URL || "http://localhost:8000/api";

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export async function djangoApiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
) {
  const {
    method = "GET",
    body,
    headers = {},
    requireAuth = true,
  } = options;

  let authHeaders = {};

  if (requireAuth) {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error("No authentication token available");
    }
    authHeaders = {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  // Mock responses for development
  return mockDjangoResponse(endpoint, options);
}

// Mock Django API responses for development
function mockDjangoResponse(endpoint: string, options: ApiRequestOptions) {
  console.log(`Mock Django API call: ${options.method || "GET"} ${endpoint}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      switch (endpoint) {
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
          
        default:
          resolve({
            ok: true,
            json: () => Promise.resolve({ message: "Mock response" })
          });
      }
    }, 300); // Simulate network delay
  });
}

export default djangoApiRequest;