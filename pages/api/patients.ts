import type { NextApiRequest, NextApiResponse } from 'next';

// Mock patient data
const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+91-9876543210',
    age: 35,
    gender: 'Male',
    email: 'john.doe@email.com',
    condition: 'Chronic headaches',
    last_visit: '2024-01-15',
    address: '123 Main St, City',
    emergency_contact: '+91-9876543211',
    medical_history: 'No major medical history'
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+91-9876543212',
    age: 28,
    gender: 'Female',
    email: 'jane.smith@email.com',
    condition: 'Allergies',
    last_visit: '2024-01-20',
    address: '456 Oak Ave, City',
    emergency_contact: '+91-9876543213',
    medical_history: 'Seasonal allergies'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    phone: '+91-9876543214',
    age: 42,
    gender: 'Male',
    email: 'bob.johnson@email.com',
    condition: 'Digestive issues',
    last_visit: '2024-01-25',
    address: '789 Pine St, City',
    emergency_contact: '+91-9876543215',
    medical_history: 'IBS, chronic fatigue'
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all patients
    res.status(200).json(mockPatients);
  } else if (req.method === 'POST') {
    // Create new patient
    const newPatient = {
      id: (mockPatients.length + 1).toString(),
      ...req.body,
    };
    mockPatients.push(newPatient);
    res.status(201).json(newPatient);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}