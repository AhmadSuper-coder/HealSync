import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Generate Meta WhatsApp Business API OAuth URL
    // In production, this would use actual Meta app credentials
    const clientId = process.env.META_APP_ID || 'your_meta_app_id';
    const redirectUri = encodeURIComponent(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/whatsapp/auth/callback`);
    const scope = encodeURIComponent('whatsapp_business_messaging,whatsapp_business_management');
    
    // Meta's Embedded Signup URL
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&config_id=your_config_id`;
    
    res.status(200).json({ 
      authUrl,
      message: 'Redirecting to Meta WhatsApp Business API authorization'
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}