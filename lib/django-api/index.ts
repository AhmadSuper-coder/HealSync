// Export API client
export { apiClient } from './client';
export type { DjangoError } from './client';

// Export all API modules
export { AuthAPI } from './auth';
export { PatientAPI } from './patient';



export type {
  // Patient types
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientListParams,
} from './patient';