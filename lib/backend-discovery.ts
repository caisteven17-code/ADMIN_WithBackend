interface BackendInfo {
  port: number;
  url: string;
  timestamp: string;
}

const BACKEND_CONFIG_FILE = "/backend-info.json";
const HEALTH_CHECK_ENDPOINT = "/api/health";
const PORT_RANGE_START = 5000;
const PORT_RANGE_END = 5009;
const HEALTH_CHECK_TIMEOUT = 1000; // 1 second
const DEBUG = typeof window !== "undefined" && process.env.NODE_ENV === "development";

/**
 * Client-side backend URL discovery with fallback strategies:
 * 1. Read backend-info.json (written by backend on startup)
 * 2. Probe ports 5000-5009 for health endpoint
 * 3. Fall back to environment variable
 * 4. Use default localhost:5000
 */
export async function getBackendUrl(): Promise<string> {
  // Strategy 1: Try to fetch backend info file
  try {
    const response = await fetch(BACKEND_CONFIG_FILE, { cache: "no-store" });
    if (response.ok) {
      const config: BackendInfo = await response.json();
      const url = config.url;
      
      if (DEBUG) {
        console.log(`[Backend Discovery] Found via config file: ${url}`);
      }
      return url;
    }
  } catch (error) {
    if (DEBUG) {
      console.log(`[Backend Discovery] Config file unavailable, trying port probing...`);
    }
  }

  // Strategy 2: Port probing
  try {
    const port = await probeBackendPort();
    if (port !== null) {
      const url = `http://localhost:${port}`;
      if (DEBUG) {
        console.log(`[Backend Discovery] Found via port probing: ${url}`);
      }
      return url;
    }
  } catch (error) {
    if (DEBUG) {
      console.warn(`[Backend Discovery] Port probing failed, trying fallback...`);
    }
  }

  // Strategy 3: Environment variable
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    if (DEBUG) {
      console.log(`[Backend Discovery] Using env variable: ${envUrl}`);
    }
    return envUrl;
  }

  // Strategy 4: Default fallback
  const defaultUrl = `http://localhost:${PORT_RANGE_START}`;
  if (DEBUG) {
    console.log(`[Backend Discovery] Using default: ${defaultUrl}`);
  }
  return defaultUrl;
}

/**
 * Probe available ports to find the backend
 * Returns the first port that responds successfully to health check
 */
async function probeBackendPort(): Promise<number | null> {
  for (let port = PORT_RANGE_START; port <= PORT_RANGE_END; port++) {
    try {
      const response = await fetch(`http://localhost:${port}${HEALTH_CHECK_ENDPOINT}`, {
        method: "GET",
        signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
      });
      
      if (response.ok) {
        return port;
      }
    } catch {
      // Port not available, continue to next
      continue;
    }
  }
  return null;
}

/**
 * Cache the backend URL to avoid repeated lookups
 */
let cachedBackendUrl: string | null = null;

/**
 * Get backend URL with caching
 */
export async function getBackendUrlCached(): Promise<string> {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }
  cachedBackendUrl = await getBackendUrl();
  return cachedBackendUrl;
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearBackendUrlCache(): void {
  cachedBackendUrl = null;
}
