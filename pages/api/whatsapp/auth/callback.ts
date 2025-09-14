import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { code, error } = req.query;
    
    if (error) {
      // User denied authorization or error occurred
      return res.redirect('/whatsapp?error=authorization_denied');
    }
    
    if (!code) {
      return res.redirect('/whatsapp?error=missing_code');
    }
    
    // In production: Exchange code for access token
    // 1. POST to https://graph.facebook.com/v18.0/oauth/access_token
    // 2. Get access_token, phone_number_id, waba_id
    // 3. Store in database against doctor ID
    // 4. Get business profile info
    
    // For now, simulate successful connection
    const mockConnectionData = {
      isConnected: true,
      phoneNumberId: 'mock_phone_id_123',
      wabaId: 'mock_waba_id_456',
      connectedPhone: '+1234567890',
      businessName: 'HomeoClinic Practice',
      connectedAt: new Date().toISOString()
    };
    
    // Store mock data (in production, save to database)
    
    // Redirect back to WhatsApp page with success
    res.redirect('/whatsapp?connected=true');
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}