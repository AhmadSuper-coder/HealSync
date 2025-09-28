import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthAPI } from '../../../lib/django-api/auth';
import type { EmailSignupRequest } from '../../../types/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, full_name }: EmailSignupRequest = req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      return res.status(400).json({ 
        error: 'Email, password, and full name are required' 
      });
    }

    // Validate email format
    if (!AuthAPI.validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Call backend API to create user
    const response = await AuthAPI.emailSignup({
      email,
      password,
      full_name,
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: response.user,
      created: response.created,
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific error cases
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      return res.status(409).json({ 
        error: 'An account with this email already exists' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create account. Please try again.' 
    });
  }
}