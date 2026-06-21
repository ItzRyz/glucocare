/**
 * Resolves the Flask ML service base URL for server-side requests.
 * - FLASK_API_URL: explicit override (local or external)
 * - VERCEL_URL: same-deployment Python function at /flask
 * - fallback: local Flask dev server
 */
export function getFlaskBaseUrl(): string {
    if (process.env.FLASK_API_URL) {
        return process.env.FLASK_API_URL.replace(/\/$/, '');
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}/api/flask`;
    }
    // When running 'vercel dev', it manages both Next.js and Flask on the same port
    if (process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'development') {
        const port = process.env.PORT || '3000';
        return `http://localhost:${port}/api/flask`;
    }
    // Fallback for 'next dev' with manual Flask server
    return 'http://127.0.0.1:5328/api/flask';
}
