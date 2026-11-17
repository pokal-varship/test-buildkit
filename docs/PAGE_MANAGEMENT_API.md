# Page Management API Integration

This document describes the integration of external API for page management in the Puck editor.

## Overview

The Puck editor fully integrates with an external API for both reading and writing page data. The system:

**For Loading Draft Data:**
1. Server provides fallback data from local files
2. Client-side fetches fresh draft data from external API (visible in Network tab)
3. Transforms API response to Puck data format
4. Falls back to server-provided data if API fails or returns no data

**For Publishing Draft Data:**
1. Transforms the Puck data format to match the external API requirements
2. Sends a PATCH request to the external API endpoint
3. Displays success/error feedback to the user

## Configuration

### Environment Variables

Add the following environment variables to configure the external API integration:

```bash
# External Page Management API Configuration
NEXT_PUBLIC_EXTERNAL_API_URL=https://api.newkommerce.com
NEXT_PUBLIC_API_TOKEN=your-jwt-bearer-token-here
```

### Default Values

If environment variables are not set, the system will use these defaults:

- **API URL**: `https://api.newkommerce.com`
- **Token**: The hardcoded token from your curl example (should be replaced in production)

## API Endpoints

### GET - Fetch Draft Data
**URL**: `{NEXT_PUBLIC_EXTERNAL_API_URL}/e-commerce/v1/pages?pageSlug={slug}&isDraft=true`
**Method**: `GET`
**Headers**:
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

### PATCH - Publish Draft Data
**URL**: `{NEXT_PUBLIC_EXTERNAL_API_URL}/e-commerce/v1/pages`
**Method**: `PATCH`
**Headers**:
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

## Request/Response Payloads

### GET Request Query Parameters
- `pageSlug`: Page identifier ("home" for root path, otherwise path without leading slash)
- `isDraft`: Always "true" for draft data

### GET Response Format
```json
{
  "status": "Request successfully completed",
  "message": "Success",
  "data": {
    "data": [...], // Array of page components
    "pageSlug": "home",
    "isDraft": true,
    // ... other metadata
  }
}
```

### PATCH Request Payload
The system transforms Puck data into the following format:

```json
{
  "data": [...], // Array of Puck components
  "pageSlug": "home", // Page identifier ("home" for root path, otherwise path without leading slash)
  "isDraft": true
}
```

## Data Transformation

- **Root path** (`/`) → `pageSlug: "home"`
- **Other paths** (`/about-us`) → `pageSlug: "about-us"`
- **Puck content** → `data` array containing all page components

## Error Handling

The integration includes comprehensive error handling:

- **Network errors**: Caught and displayed to user
- **API errors**: HTTP status codes and response messages logged
- **User feedback**: Success/error messages displayed in the editor

## Files Modified

1. **`app/pages/puck/[...puckPath]/client.tsx`**
   - Updated `handlePublishDraft` function
   - Added import for new page management service

2. **`services/pageManagement.ts`** (new)
   - Contains `publishPageDraft` function for external API calls
   - Contains `getPageDraft` function for server-side fetching
   - Contains `getPageDraftClient` function for client-side fetching (visible in Network tab)

3. **`pageEditor/lib/get-page.ts`**
   - Restored to original local file reading functionality

4. **`app/pages/puck/page.tsx`**
   - Provides fallback data from server, passes `fetchFromAPI={true}` to client

5. **`app/pages/puck/[...puckPath]/page.tsx`**
   - Provides fallback data from server, passes `fetchFromAPI={true}` to client

6. **`app/pages/puck/[...puckPath]/client.tsx`**
   - Added client-side API fetching with `getPageDraftClient`
   - Added loading states and error handling
   - Shows API calls in browser Network tab

7. **`config/api.config.ts`**
   - Added `PAGES_ENDPOINT` constant

## Testing

To test the integration:

1. Set up the environment variables with valid API credentials
2. Open the Puck editor for any page
3. **Check Browser Network Tab**: You should see the GET API call to fetch draft data
4. **Check Browser Console**: Look for logs starting with "🌐 CLIENT:"
5. Verify that existing draft data is loaded correctly in the editor
6. Make changes to the page content
7. Click "Publish Draft" button
8. **Check Network Tab**: You should see the PATCH API call
9. Verify the PATCH API call response is handled correctly
10. Refresh the page to verify the updated draft data is loaded from the API

## Security Considerations

- **Token Management**: Store API tokens securely using environment variables
- **HTTPS**: Always use HTTPS for API communications
- **Token Rotation**: Implement token rotation strategy for production use
- **Error Logging**: Avoid logging sensitive information in error messages

## Future Enhancements

- Add retry logic for failed API calls
- Implement token refresh mechanism
- Add API response caching
- Support for different environments (dev, staging, prod)
- Add API health check before making requests
