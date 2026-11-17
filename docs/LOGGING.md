# Logging Guidelines

This document outlines the logging strategy for the PlateAway web application to ensure console logs and errors don't go to production.

## Overview

We use a centralized logging utility that:
- **Overrides console methods** to control their behavior
- Shows logs only in development environment
- Strips console statements in production builds
- Provides hooks for error reporting services
- **Requires no code migration** - existing console statements work automatically

## How It Works

The logger automatically overrides `console.log`, `console.error`, `console.warn`, `console.debug`, and `console.info` methods when the application starts. This means:

- **No code changes required** - existing console statements work as expected
- **Environment-aware behavior** - logs only appear in development
- **Production-safe** - console statements are stripped in production builds

## Logger Utility

### Location
`lib/logger.ts`

### Automatic Initialization
The logger is automatically initialized in:
- `app/layout.tsx` (server-side)
- `components/LoggerInitializer.tsx` (client-side)

### Optional Direct Usage

You can also use the logger directly if you prefer:

```typescript
import { log, error, warn, debug, info } from '@lib/logger';

// Direct logging (optional)
log('User logged in successfully');
info('Application started');
warn('Deprecated feature used');
error('Failed to fetch user data', err);
debug('API response received', response);
```

## Environment Behavior

### Development (`NODE_ENV=development`)
- All console statements are shown
- Full debugging information available
- No console stripping

### Production (`NODE_ENV=production`)
- Console statements are stripped from the build
- Only errors can be logged (if `ENABLE_ERROR_LOGS=true`)
- Errors can be sent to external services (Sentry, LogRocket, etc.)

## Configuration

### Environment Variables

```bash
# Enable error logs in production (optional)
ENABLE_ERROR_LOGS=true

# Node environment
NODE_ENV=production
```

### Logger Configuration

The logger behavior is controlled by the `LoggerConfig` interface:

```typescript
interface LoggerConfig {
  enableConsoleLogs: boolean;    // Development only
  enableConsoleErrors: boolean;  // Development + ENABLE_ERROR_LOGS
  enableConsoleWarns: boolean;   // Development only
  enableDebugLogs: boolean;      // Development only
}
```

## Usage Examples

### Existing Code (No Changes Required)

```typescript
// These work exactly as before, but are now controlled by the logger
console.log('User data:', userData);
console.error('API error:', error);
console.warn('Deprecated feature used');
console.debug('Debug info');
console.info('Important info');
```

### Optional Direct Logger Usage

```typescript
import { log, error, warn, debug, info } from '@lib/logger';

// Alternative to console statements
log('User data:', userData);
error('API error:', error);
warn('Deprecated feature used');
debug('Debug info');
info('Important info');
```

## Next.js Configuration

The project includes webpack configuration to strip console statements in production:

```javascript
// next.config.js
webpack(config, { dev, isServer }) {
  if (!dev) {
    config.optimization.minimizer.forEach((minimizer) => {
      if (minimizer.constructor.name === 'TerserPlugin') {
        minimizer.options.terserOptions.compress.drop_console = true;
        minimizer.options.terserOptions.compress.drop_debugger = true;
      }
    });
  }
  return config;
}
```

## Error Reporting Integration

### Setup Error Reporting Service

To integrate with error reporting services like Sentry:

1. Install the service package
2. Update the `sendToErrorService` method in `lib/logger.ts`
3. Configure the service in your environment

Example with Sentry:

```typescript
import * as Sentry from '@sentry/nextjs';

private sendToErrorService(level: string, args: any[]): void {
  if (typeof window !== 'undefined') {
    Sentry.captureException(new Error(args.join(' ')));
  }
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Use console.log for general information
console.log('User clicked checkout button');

// Use console.info for important events
console.info('Order completed successfully');

// Use console.warn for potential issues
console.warn('API response took longer than expected');

// Use console.error for actual errors
console.error('Failed to process payment', paymentError);

// Use console.debug for detailed debugging
console.debug('API request payload', payload);
```

### 2. Include Context

```typescript
// Good
console.error('Failed to fetch user profile', { userId, error: err });

// Avoid
console.error('Error occurred');
```

### 3. Don't Log Sensitive Information

```typescript
// Avoid
console.log('User password:', password);
console.log('API key:', apiKey);

// Good
console.log('User authentication attempt', { userId, success: true });
```

### 4. Use Structured Logging

```typescript
// Good
console.log('Order created', { 
  orderId, 
  userId, 
  total: order.total,
  items: order.items.length 
});

// Avoid
console.log('Order created with ID', orderId, 'for user', userId);
```

## Testing

### Restore Console Methods

For testing purposes, you can restore the original console methods:

```typescript
import logger from '@lib/logger';

// In your test setup
beforeEach(() => {
  logger.restoreConsole();
});

afterEach(() => {
  // Re-initialize the logger
  import('@lib/logger');
});
```

### Update Logger Configuration

```typescript
import logger from '@lib/logger';

// Enable all logs for testing
logger.updateConfig({
  enableConsoleLogs: true,
  enableConsoleErrors: true,
  enableConsoleWarns: true,
  enableDebugLogs: true,
});
```

## Troubleshooting

### Console Statements Still Appearing in Production

1. Check if the statement is in an excluded file
2. Verify the webpack configuration is working
3. Ensure `NODE_ENV=production` is set
4. Check if the statement is in a third-party library

### Logger Not Working

1. Verify the logger is imported in `app/layout.tsx`
2. Check if the `LoggerInitializer` component is rendered
3. Ensure TypeScript compilation is successful
4. Verify the environment variables are set correctly

### Console Methods Not Overridden

1. Check if the logger is imported early enough
2. Verify the `LoggerInitializer` component is working
3. Ensure no other code is overriding console methods after the logger

## Benefits of This Approach

1. **Zero Migration Required**: Existing console statements work automatically
2. **Environment-Aware**: Logs only appear in development
3. **Production-Safe**: Console statements are stripped in production builds
4. **Flexible**: Can still use direct logger methods if preferred
5. **Maintainable**: Centralized control over logging behavior
6. **Testable**: Easy to restore console methods for testing

## Migration from Previous Approach

If you were using the previous migration-based approach:

1. **Remove logger imports** from files that were migrated
2. **Revert console statements** back to their original form
3. **Remove migration script** (`scripts/migrate-console-logs.js`)
4. **Update package.json** to remove migration scripts

The new approach is much simpler and requires no code changes!

## Support

For questions about logging setup or issues with the console override, please refer to:
- The logger utility code in `lib/logger.ts`
- The logger initializer in `components/LoggerInitializer.tsx`
- Next.js configuration in `next.config.js` 