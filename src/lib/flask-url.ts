/**
 * Resolves the Flask ML service base URL for server-side fetch() calls.
 *
 * IMPORTANT: Next.js rewrites() only apply to browser requests — server-side
 * fetch() calls bypass them entirely. Therefore we must construct the URL
 * that points to the Python serverless function directly.
 *
 * On Vercel, the Python function at api/index.py is exposed at /api/index,
 * but Flask registers its routes with prefix /api/flask. Vercel's Python
 * runtime serves the WSGI app at the file path, so the URL must be:
 *   https://<VERCEL_URL>/api/flask  (Vercel routes all /api/* to the function)
 *
 * Priority:
 *   1. FLASK_API_URL env var — explicit override
 *   2. VERCEL_URL env var — same-deployment serverless function
 *   3. Fallback — local Flask dev server on port 5328
 */
export function getFlaskBaseUrl(): string {
    // Explicit override (useful for pointing at an external API)
    if (process.env.FLASK_API_URL) {
        return process.env.FLASK_API_URL.replace(/\/$/, '');
    }

    // On Vercel: call the Python serverless function directly.
    // VERCEL_URL is always set in production/preview.
    if (process.env.VERCEL_URL) {
        // The Python WSGI function handles all routes under /api/flask/*
        return `https://${process.env.VERCEL_URL}/api/flask`;
    }

    // Local development with manual `python api/index.py`
    return 'http://127.0.0.1:5328/api/flask';
}
