// This file contains Vercel-specific configuration and helpers

import path from 'path';
import { fileURLToPath } from 'url';

// Handle ESM compatibility for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to determine if running in Vercel production environment
export function isVercelProduction(): boolean {
  return process.env.VERCEL === '1' && process.env.NODE_ENV === 'production';
}

// Helper to get the correct static files path in Vercel environment
export function getStaticFilesPath(): string {
  if (isVercelProduction()) {
    // In Vercel production, serve files from the dist/client directory
    return path.join(__dirname, '../client');
  }

  // In development, let Vite handle serving the files
  return '';
}

// Helper to configure environment-specific settings
export function configureForVercel(): void {
  // Ensure required environment variables are set
  if (isVercelProduction()) {
    if (!process.env.DATABASE_URL) {
      console.error('ERROR: DATABASE_URL environment variable is required for production');
      process.exit(1);
    }

    if (!process.env.GROQ_API_KEY) {
      console.warn('WARNING: GROQ_API_KEY environment variable is missing. Chatbot functionality will use fallback responses.');
    }

    if (!process.env.SESSION_SECRET) {
      console.warn('WARNING: SESSION_SECRET environment variable is missing. Using a default value, which is not secure for production.');
      process.env.SESSION_SECRET = 'vercel-default-session-secret';
    }
  }
}