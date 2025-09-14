import type { NextApiRequest, NextApiResponse } from 'next';

// Mock bills data
let mockBills: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all bills
    res.status(200).json(mockBills);
  } else if (req.method === 'POST') {
    // Create new bill
    const newBill = {
      id: (mockBills.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...req.body,
    };
    mockBills.push(newBill);
    res.status(201).json(newBill);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}