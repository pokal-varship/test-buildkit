#!/bin/bash

# Script to ensure Husky hooks are properly configured and executable
echo "🔧 Setting up Husky hooks..."

# Make sure all Husky hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/post-commit
chmod +x .husky/prepare-commit-msg

# Verify the setup
echo "✅ Husky hooks are now executable:"
ls -la .husky/

echo ""
echo "🎉 Husky setup complete! Hooks will no longer be ignored." 