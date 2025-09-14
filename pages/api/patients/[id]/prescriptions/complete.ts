import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    // Mock completing previous prescriptions
    const { id } = req.query;
    res.status(200).json({ 
      message: `Previous prescriptions for patient ${id} marked as completed`,
      success: true 
    });
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}