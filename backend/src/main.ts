import "reflect-metadata";
import path from "path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter, HttpExceptionFilter } from "./common/http-exception.filter";
import dotenv from "dotenv";

// Load environment from backend .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function bootstrap() {
  try {
    console.log("🔄 Starting NestJS Backend...");
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    
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
    app.useGlobalFilters(new AllExceptionsFilter());

    const port = 5000;

    console.log("\n🚀 Starting HTTP server on port " + port + "...");
    await app.listen(port);

    console.log("\n✅ Backend Server Running!");
    console.log(`   URL: http://localhost:${port}`);
    console.log(`   Health: http://localhost:${port}/api/health`);
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
    console.error("   4. Check if port 5000 is already in use - try: lsof -i :5000\n");
    process.exit(1);
  }
}

bootstrap();
