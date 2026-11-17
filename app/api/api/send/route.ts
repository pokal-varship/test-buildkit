// File: app/api/proxy/send/route.js

import { NextResponse } from 'next/server';

export async function POST(request: Request) {

  try {
    // Get the raw request body
    const body = await request.text();
    
    // Extract headers from incoming request to forward them
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Don't forward connection-specific headers
      if (!['host', 'connection', 'sec-fetch-mode', 'sec-fetch-site', 'sec-fetch-dest'].includes(key.toLowerCase())) {
        headers.append(key, value);
      }
    });
    
    // Make sure we have a content-type if one wasn't provided
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    
    // Forward the request to the external API
    const response = await fetch('http://4.240.118.47:3000/api/send', {
      method: 'POST',
      headers: headers,
      body: body,
    });
    
    // Create response with the same status code
    const responseData = await response.arrayBuffer();
    
    // Create a new response with the same status, headers, and body
    const newResponse = new NextResponse(responseData, {
      status: response.status,
    });
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') { // Skip content-encoding as it might cause issues
        newResponse.headers.set(key, value);
      }
    });
    
    return newResponse;
  } catch {

    return NextResponse.json(
      { error: 'Failed to proxy request',},
      { status: 500 }
    );
  }
}

