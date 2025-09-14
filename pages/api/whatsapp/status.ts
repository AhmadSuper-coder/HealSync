import type { NextApiRequest, NextApiResponse } from 'next';

interface WhatsAppConnection {
  isConnected: boolean;
  phoneNumberId?: string;
  wabaId?: string;
  connectedPhone?: string;
  businessName?: string;
  connectedAt?: string;
}

// Mock WhatsApp connection status
let mockConnectionStatus: WhatsAppConnection = {
  isConnected: false
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return current connection status (without access token for security)
    res.status(200).json(mockConnectionStatus);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}