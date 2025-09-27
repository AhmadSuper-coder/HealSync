// Export API client
export { apiClient } from './client';
export type { DjangoError } from './client';

// Export all API modules
export { AuthAPI } from './auth';
export { PatientAPI } from './patient';

// Export types from modules
export type {
  // Auth types
  LoginRequest,
  LoginResponse,
  UserProfile,
} from './auth';

export type {
  // Patient types
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientListResponse,
  PatientListParams,
} from './patient';