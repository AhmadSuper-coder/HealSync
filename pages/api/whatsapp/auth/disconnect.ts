import type { NextApiRequest, NextApiResponse } from 'next';

// Mock storage - in production this would update the database
const mockConnectionStatus = {
  isConnected: false
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // In production: Remove stored tokens from database for this doctor
    // For now, just reset the mock status
    
    res.status(200).json({ 
      success: true,
      message: 'WhatsApp Business account disconnected successfully'
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}