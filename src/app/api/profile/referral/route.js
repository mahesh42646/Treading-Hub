import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const uid = authHeader.replace('Bearer ', '');
    
    // Fetch user's referral data from backend
    const response = await fetch(`${BACKEND_URL}/api/profile/referral`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-uid': uid
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
