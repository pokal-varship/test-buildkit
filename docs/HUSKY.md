# Husky Git Hooks Setup

This document outlines the Husky configuration to ensure Git hooks are never ignored and work properly.

## Overview

Husky is configured to run Git hooks that help maintain code quality and consistency. The hooks are set up to run automatically on specific Git events.

## Current Hooks

### Pre-commit Hook
- **File**: `.husky/pre-commit`
- **Purpose**: Runs before each commit
- **Action**: Executes `npm run build` to ensure the project builds successfully

### Commit-msg Hook
- **File**: `.husky/commit-msg`
- **Purpose**: Validates commit messages
- **Action**: Can be extended to validate commit message format

### Post-commit Hook
- **File**: `.husky/post-commit`
- **Purpose**: Runs after each commit
- **Action**: Can be extended for post-commit actions

### Prepare-commit-msg Hook
- **File**: `.husky/prepare-commit-msg`
- **Purpose**: Runs before commit message is created
- **Action**: Can be extended to prepare commit messages

## Setup

### Automatic Setup
The hooks are automatically set up when you run:
```bash
npm install
```

### Manual Setup
If hooks are being ignored, run:
```bash
npm run setup-husky
```

This script ensures all hooks are executable and properly configured.

### Manual Commands
```bash
# Make all hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/post-commit
chmod +x .husky/prepare-commit-msg

# Make internal Husky files executable
chmod +x .husky/_/*
```

## Troubleshooting

### Hooks Being Ignored
If you see messages like "hook was ignored because it's not set as executable":

1. **Run the setup script:**
   ```bash
   npm run setup-husky
   ```

2. **Check file permissions:**
   ```bash
   ls -la .husky/
   ```

3. **Verify all files are executable:**
   All files should show `-rwxrwxr-x` permissions.

### Hooks Not Running
If hooks aren't running at all:

1. **Check if Husky is installed:**
   ```bash
   npm list husky
   ```

2. **Reinstall Husky:**
   ```bash
   npm uninstall husky
   npm install --save-dev husky
   npx husky install
   ```

3. **Verify Git hooks directory:**
   ```bash
   git config core.hooksPath
   ```
   Should return `.husky`

### Adding New Hooks
To add a new hook:

1. **Create the hook file:**
   ```bash
   npx husky add .husky/hook-name "command to run"
   ```

2. **Make it executable:**
   ```bash
   chmod +x .husky/hook-name
   ```

3. **Add proper shebang:**
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"
   
   # Your command here
   ```

## Hook Configuration

### Pre-commit Hook
Currently runs:
- `npm run build` - Ensures the project builds successfully

You can extend it to include:
- Linting: `npm run lint`
- Type checking: `npx tsc --noEmit`
- Tests: `npm test`

### Commit-msg Hook
Can be extended to validate commit messages:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

### Post-commit Hook
Can be extended for:
- Notifications
- Deployment triggers
- Documentation updates

## Best Practices

1. **Always make hooks executable** after creating them
2. **Test hooks** before pushing to production
3. **Keep hooks fast** - they run on every commit
4. **Use the setup script** when setting up the project
5. **Document custom hooks** in this file

## Environment Variables

Husky respects these environment variables:
- `HUSKY=0` - Disable all hooks
- `HUSKY_SKIP_HOOKS` - Skip specific hooks

## CI/CD Considerations

In CI/CD environments:
- Hooks are automatically disabled if `CI=true`
- You can manually disable with `HUSKY=0`
- Consider running hook checks in CI pipeline

## Support

For issues with Husky:
1. Check the [Husky documentation](https://typicode.github.io/husky/)
2. Verify file permissions
3. Run the setup script
4. Check Git configuration 