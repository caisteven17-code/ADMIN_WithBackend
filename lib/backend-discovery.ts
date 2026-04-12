/**
 * Dynamically discover backend URL
 * 1. Try to read from .server-ports.json (created by backend)
 * 2. Fall back to environment variable
 * 3. Fall back to localhost:5000
 */
export async function getBackendUrl(): Promise<string> {
  try {
    // Try to fetch the port config created by backend
    const response = await fetch("/.server-ports.json");
    if (response.ok) {
      const config = await response.json();
      const port = config.backend;
      console.log(`🔍 Backend discovered on port ${port} from config file`);
      return `http://localhost:${port}`;
    }
  } catch (error) {
    console.log(`ℹ️  .server-ports.json not found, using fallback...`);
  }

  // Fall back to environment variable
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    console.log(`🔍 Using backend URL from environment: ${envUrl}`);
    return envUrl;
  }

  // Final fallback
  const defaultUrl = "http://localhost:5000";
  console.log(`🔍 Using default backend URL: ${defaultUrl}`);
  return defaultUrl;
}

/**
 * Cache the backend URL to avoid repeated lookups
 */
let cachedBackendUrl: string | null = null;

export async function getBackendUrlCached(): Promise<string> {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }
  cachedBackendUrl = await getBackendUrl();
  return cachedBackendUrl;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearBackendUrlCache(): void {
  cachedBackendUrl = null;
}
