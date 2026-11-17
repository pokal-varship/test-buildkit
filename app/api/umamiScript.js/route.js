// File: app/api/proxy/script/route.js

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Make a request to the source script
    const response = await fetch('http://4.240.118.47:3000/script.js', {
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Next.js Proxy',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch script: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the script content
    const scriptContent = await response.text();

    // Return the script with the correct content type
    return new NextResponse(scriptContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch {
    // Error handled silently
    return NextResponse.json(
      { error: 'Failed to proxy script' },
      { status: 500 }
    );
  }
}