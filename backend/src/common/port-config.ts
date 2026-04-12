import * as fs from "fs";
import * as path from "path";

// Write to public folder so frontend can access it
const PORT_CONFIG_FILE = path.join(
  process.cwd(),
  "..",
  "public",
  ".server-ports.json"
);

export interface ServerPorts {
  backend: number;
  frontendExpected?: number;
}

/**
 * Write the actual backend port to a config file
 * so frontend can read it dynamically
 */
export function writeBackendPort(port: number): void {
  try {
    const config: ServerPorts = {
      backend: port,
      frontendExpected: 3000,
    };

    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), "..", "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(PORT_CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`📝 Backend port ${port} written to .server-ports.json`);
  } catch (error) {
    console.error("⚠️  Could not write server ports config:", error);
  }
}

/**
 * Read the backend port from config file
 */
export function readBackendPort(): number | null {
  try {
    if (fs.existsSync(PORT_CONFIG_FILE)) {
      const content = fs.readFileSync(PORT_CONFIG_FILE, "utf-8");
      const config: ServerPorts = JSON.parse(content);
      return config.backend;
    }
  } catch (error) {
    console.error("⚠️  Could not read server ports config:", error);
  }
  return null;
}
