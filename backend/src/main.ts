import "reflect-metadata";
import path from "path";
import fs from "fs";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter, HttpExceptionFilter } from "./common/http-exception.filter";
import { findAvailablePort } from "./common/port-finder";
import dotenv from "dotenv";

// Configuration constants
const PORT_RANGE_START = 5000;
const BACKEND_INFO_FILE = "backend-info.json";
const DEBUG = process.env.NODE_ENV === "development";

// Load environment from backend .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function bootstrap() {
  try {
    console.log("\n🔄 Starting NestJS Backend...");
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    
    if (DEBUG) {
      // Log Supabase configuration
      console.log("\n🗄️  Supabase Configuration:");
      console.log(`  URL: ${process.env.SUPABASE_URL ? "✓ Set" : "❌ NOT SET"}`);
      console.log(`  Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "❌ NOT SET"}`);
      console.log(`  Anon Key: ${process.env.SUPABASE_ANON_KEY ? "✓ Set" : "❌ NOT SET"}`);
      
      // Log SMTP configuration
      console.log("\n📧 SMTP Configuration Loaded:");
      console.log(`  SMTP_HOST: ${process.env.SMTP_HOST || "❌ NOT SET"}`);
      console.log(`  SMTP_PORT: ${process.env.SMTP_PORT || "❌ NOT SET"}`);
      console.log(`  SMTP_USER: ${process.env.SMTP_USER || "❌ NOT SET"}`);
      console.log(`  SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? "✓ Set" : "❌ NOT SET"}`);
      console.log(`  SMTP_FROM: ${process.env.SMTP_FROM || "❌ NOT SET"}`);
    }
    
    // Validate critical environment variables
    if (!process.env.SUPABASE_URL) {
      throw new Error("❌ SUPABASE_URL is not set in backend/.env");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
      throw new Error("❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set in backend/.env");
    }

    console.log("\n⚙️  Creating NestJS application...");
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    // Global exception filters
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalFilters(new AllExceptionPORT_RANGE_START);

    console.log(`\n🚀 Starting HTTP server on port ${port}...`);
    await app.listen(port);

    // Write port info to public folder for frontend discovery
    writeBackendInfo(port);

    // Success message
    console.log("\n✅ Backend Server Running!");
    console.log(`   URL: http://localhost:${port}`);
    console.log(`   Health: http://localhost:${port}/api/health`);
    console.log(`   Frontend: ${process.env.FRONTEND_URL}`);
    if (DEBUG) {
      console.log(`   JWT Secret: ${process.env.JWT_SECRET ? "✓ Configured" : "✗ Using default"}`);
    }
    console.log(`   Frontend: ${process.env.FRONTEND_URL}`);
    console.log(`   JWT Secret: ${process.env.JWT_SECRET ? "✓ Configured" : "✗ Using default"}`);
    console.log("\n✨ Backend is ready to receive requests\n");
  } catch (error) {
    console.error("\n❌ Failed to start backend");
    console.error("━".repeat(50));
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    console.error("━".repeat(50));
    console.error("\n💡 Troubleshooting steps:");
    console.error("   1. Check backend/.env exists and has required variables");
    console.error("   2. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set");
    console.error("   3. Run: npm install (to install dependencies)");
    console.error("   4. Ensure at least one port is available (tried 5000-5009)\n");
    process.exit(1);
  }
}

bootstrap();
`   4. Ensure at least one port is available (tried ${PORT_RANGE_START}-${PORT_RANGE_START + 9})\n`);
    process.exit(1);
  }
}

/**
 * Write backend port and URL to public/backend-info.json for frontend discovery
 */
function writeBackendInfo(port: number): void {
  try {
    const backendInfoPath = path.resolve(__dirname, "../../public", BACKEND_INFO_FILE);
    const backendInfo = {
      port,
      url: `http://localhost:${port}`,
      timestamp: new Date().toISOString(),
    };
    
    fs.mkdirSync(path.dirname(backendInfoPath), { recursive: true });
    fs.writeFileSync(backendInfoPath, JSON.stringify(backendInfo, null, 2));
    
    if (DEBUG) {
      console.log(`📝 Backend info written to: ${backendInfoPath}`);
    }
  } catch (error) {
    console.warn(
      `⚠️  Could not write backend info: ${error instanceof Error ? error.message : error}`
    