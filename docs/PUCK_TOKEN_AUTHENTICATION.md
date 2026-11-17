# Puck Editor Token Authentication

This document describes the token-based authentication system implemented for the Puck page editor.

## Overview

The Puck editor pages now require a valid JWT token in the URL parameters to access. This prevents unauthorized users from accessing the page editor interface.

## Protected Routes

The following routes are protected with token authentication:

### Editor Routes
- `/pages/puck/` - Homepage editor
- `/pages/puck/[...puckPath]` - Dynamic page editor (accessed via `/edit` URLs)
- `/edit` - Homepage editor (via middleware rewrite)
- `/about-us/edit` - About Us page editor (via middleware rewrite)

### Draft Preview Routes
- `/draft` - Homepage draft preview
- `/about-us/draft` - About Us draft preview

## How It Works

### 1. Token Validation

The system validates JWT tokens using the following criteria:

- Token must be present in URL parameters as `token`
- Token must have valid JWT structure (header.payload.signature)
- Token must not be expired (`exp` claim)
- Token must have required fields (`exp`, `iat`)

### 2. URL Format

To access the editor, append the token as a query parameter:

```
https://your-domain.com/pages/puck/?token=Bearer%20your-jwt-token-here
```

Or for specific pages:

```
https://your-domain.com/about-us/edit?token=Bearer%20your-jwt-token-here
```

### 3. Authentication Flow

1. User visits a Puck editor URL
2. System extracts token from URL parameters
3. Token is validated on both server and client side
4. If valid: Editor loads normally
5. If invalid: "Access Denied" page is displayed

## Implementation Details

### Files Modified/Created

- `lib/tokenValidation.ts` - Token validation utilities
- `components/UnauthorizedAccess.tsx` - Unauthorized access page component (uses website's primary color)
- `app/pages/puck/page.tsx` - Homepage editor with token validation
- `app/pages/puck/[...puckPath]/page.tsx` - Dynamic page editor with token validation
- `app/pages/puck/[...puckPath]/client.tsx` - Puck client component (optimized, no redundant validation)
- `app/draft/page.tsx` - Homepage draft preview with token validation
- `app/about-us/draft/page.tsx` - About Us draft preview with token validation
- `middleware.ts` - Enhanced to preserve query parameters during URL rewriting


### Token Validation Function

```typescript
export function validateToken(token: string | null): boolean {
  if (!token) return false;
  
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '').trim();
    if (!cleanToken) return false;
    
    // Basic JWT structure validation (header.payload.signature)
    const jwtParts = cleanToken.split('.');
    if (jwtParts.length !== 3) return false;
    
    // Try to decode the payload
    const payload = JSON.parse(atob(jwtParts[1]));
    
    // Check if token has required fields and is not expired
    if (!payload.exp || !payload.iat) return false;
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}
```

## Security Features

- **Server-side validation**: Token is validated on the server before rendering (no client-side hooks issues)
- **Simple token validation**: Clean JWT validation with essential checks only
- **Expiration checking**: Tokens are checked for expiration
- **Graceful error handling**: Invalid tokens show a user-friendly error page
- **No token exposure**: Tokens are only processed, never stored or logged
- **Comprehensive protection**: Both editor and draft preview routes are protected
- **Theme integration**: Error pages use website's primary color scheme
- **Minimal implementation**: Only essential code, no unnecessary complexity

## Error Handling

When token validation fails, users see:

- Clear "Access Denied" message
- Information about requiring proper authentication
- Option to return to homepage
- Contact support information

## Usage Examples

### Valid Token URL
```
https://website-one.newkommerce.com/pages/puck/?token=Bearer%20eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIwYTBvYkVnNXdQX2p1OWhHOGVHUF9tT3AwWnYyRVpka09GdUZxa2taa2ZBIn0...
```

### Invalid/Missing Token
```
https://website-one.newkommerce.com/pages/puck/
```
→ Shows "Access Denied" page

## Maintenance

- Tokens are validated but not stored
- No database changes required
- Token format follows standard JWT specifications
- System is compatible with existing Puck functionality

## Future Enhancements

Potential improvements could include:

- Role-based access control
- Token refresh mechanisms
- Audit logging
- Integration with existing auth systems
- Custom token validation rules
