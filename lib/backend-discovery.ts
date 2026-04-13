/**
 * Dynamically discover backend URL
 * 1. Try to read backend-info.json (written by backend on startup)
 * 2. Try port probing (5000-5009)
 * 3. Fall back to environment variable
 * 4. Fall back to localhost:5000
 */
export async function getBackendUrl(): Promise<string> {
  // Try to fetch backend info file created by backend
  try {
    const response = await fetch("/backend-info.json", { cache: "no-store" });
    if (response.ok) {
      const config = await response.json();
      const url = config.url;
      console.log(`🔍 Backend discovered at ${url} from config file`);
      return url;
    }
  } catch (error) {
    console.log(`ℹ️  backend-info.json not found, trying port probing...`);
  }

  // Try to probe for available backend (ports 5000-5009)
  try {
    const port = await probeBackendPort();
    if (port) {
      const url = `http://localhost:${port}`;
      console.log(`🔍 Backend discovered on port ${port} via probing`);
      return url;
    }
  } catch (error) {
    console.log(`ℹ️  Port probing failed, using fallback...`);
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
 * Probe available ports to find the backend (5000-5009)
 */
async function probeBackendPort(): Promise<number | null> {
  for (let port = 5000; port <= 5009; port++) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(1000), // 1 second timeout
      });
      if (response.ok) {
        return port;
      }
    } catch (err) {
      // Port not available, try next
      continue;
    }
  }
  return null;
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
