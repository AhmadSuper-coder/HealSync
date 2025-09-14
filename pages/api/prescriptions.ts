import type { NextApiRequest, NextApiResponse } from 'next';

// Mock prescriptions data
let mockPrescriptions: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all prescriptions
    res.status(200).json(mockPrescriptions);
  } else if (req.method === 'POST') {
    // Create new prescription
    const newPrescription = {
      id: (mockPrescriptions.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      ...req.body,
    };
    mockPrescriptions.push(newPrescription);
    res.status(201).json(newPrescription);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}