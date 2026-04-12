import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const url = `${BACKEND_URL}/api/approvals/campaign-managers/pending?page=${page}&limit=${limit}`;
    console.log(`📡 Fetching campaign managers: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend error (${response.status}):`, errorText.substring(0, 200));
      try {
        const error = JSON.parse(errorText);
        return NextResponse.json(error, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: `Backend returned ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching pending campaign manager approvals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}
