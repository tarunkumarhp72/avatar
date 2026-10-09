/**
 * Base fetch wrapper for calling the API (now proxied via Next.js).
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1') : '/api/v1';
  // If it's the server and we use NEXT_PUBLIC_API_URL, we don't need the `/api/v1` prefix if it's already there, 
  // but let's assume endpoint starts with `/` and we just append it.
  const url = isServer ? `${baseUrl.replace(/\/api\/v1$/, '')}/api/v1${endpoint}` : `/api/v1${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error?.message || errorMsg;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMsg);
  }

  // If 204 No Content, return null
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
