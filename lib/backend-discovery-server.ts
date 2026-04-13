import * as fs from "fs";
import * as path from "path";

/**
 * Server-side backend URL discovery
 * Reads from backend-info.json file created by the backend on startup
 */
export async function getBackendUrlServer(): Promise<string> {
  try {
    // Try to read backend-info.json from the public folder
    const publicPath = path.join(process.cwd(), "public", "backend-info.json");
    
    if (fs.existsSync(publicPath)) {
      const data = fs.readFileSync(publicPath, "utf-8");
      const config = JSON.parse(data);
      const url = config.url;
      console.log(`🔍 Server: Backend discovered at ${url}`);
      return url;
    }
  } catch (error) {
    console.log(`ℹ️  Server: backend-info.json not found, using fallback...`);
  }

  // Fall back to environment variable
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    console.log(`🔍 Server: Using backend URL from environment: ${envUrl}`);
    return envUrl;
  }

  // Final fallback
  const defaultUrl = "http://localhost:5000";
  console.log(`🔍 Server: Using default backend URL: ${defaultUrl}`);
  return defaultUrl;
}

/**
 * Cache for the backend URL (per request)
 */
let cachedBackendUrlServer: string | null = null;

export async function getBackendUrlServerCached(): Promise<string> {
  if (cachedBackendUrlServer) {
    return cachedBackendUrlServer;
  }
  cachedBackendUrlServer = await getBackendUrlServer();
  return cachedBackendUrlServer;
}

/**
 * Clear the cache (useful for debugging/refreshing)
 */
export function clearBackendUrlServerCache(): void {
  cachedBackendUrlServer = null;
}
