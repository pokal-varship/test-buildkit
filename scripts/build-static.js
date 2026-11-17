#!/usr/bin/env node

/**
 * Build script for static generation of Puck pages
 * This script ensures all published pages are included in the static build
 */

const fs = require('fs');
const path = require('path');

// Read the database to get all published pages
const databasePath = path.join(process.cwd(), 'database.json');

if (!fs.existsSync(databasePath)) {

  fs.writeFileSync(databasePath, JSON.stringify({}, null, 2));
}

try {
  const database = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  const publishedPages = Object.keys(database).filter(pagePath => pagePath !== '/puck');

  publishedPages.forEach(page => {

  });
  
  // Create a build manifest for static generation
  const buildManifest = {
    pages: publishedPages,
    generatedAt: new Date().toISOString(),
    totalPages: publishedPages.length
  };
  
  const manifestPath = path.join(process.cwd(), '.next', 'static-manifest.json');
  const nextDir = path.dirname(manifestPath);
  
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir, { recursive: true });
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(buildManifest, null, 2));

} catch (error) {

  process.exit(1);
}
