import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 NestJS Backend running on http://localhost:${port}`);
  console.log(`Frontend allowed from: ${process.env.FRONTEND_URL}`);
}

bootstrap();
