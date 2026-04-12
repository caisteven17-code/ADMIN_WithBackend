import "reflect-metadata";
import path from "path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter, HttpExceptionFilter } from "./common/http-exception.filter";
import dotenv from "dotenv";

// Load environment from root .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function bootstrap() {
  try {
    console.log("🔄 Starting NestJS Backend...");
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    
    // Log SMTP configuration
    console.log("\n📧 SMTP Configuration Loaded:");
    console.log(`  SMTP_HOST: ${process.env.SMTP_HOST || "❌ NOT SET"}`);
    console.log(`  SMTP_PORT: ${process.env.SMTP_PORT || "❌ NOT SET"}`);
    console.log(`  SMTP_USER: ${process.env.SMTP_USER || "❌ NOT SET"}`);
    console.log(`  SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? "✓ Set" : "❌ NOT SET"}`);
    console.log(`  SMTP_FROM: ${process.env.SMTP_FROM || "❌ NOT SET"}`);
    console.log("");

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

    await app.listen(port);

    console.log(`✅ NestJS Backend running on http://localhost:${port}`);
    console.log(`🌐 Frontend allowed from: ${process.env.FRONTEND_URL}`);
    console.log(`🔐 JWT_SECRET loaded: ${process.env.JWT_SECRET ? "✓" : "✗ (using default)"}`);
  } catch (error) {
    console.error("❌ Failed to start backend:", error);
    process.exit(1);
  }
}

bootstrap();
