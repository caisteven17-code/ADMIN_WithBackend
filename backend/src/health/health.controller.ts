import { Controller, Get } from "@nestjs/common";

@Controller("api/health")
export class HealthController {
  @Get()
  checkHealth() {
    return {
      status: "ok",
      message: "Backend is running",
      timestamp: new Date().toISOString(),
    };
  }
}
