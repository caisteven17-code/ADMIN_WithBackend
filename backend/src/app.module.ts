import { Module } from "@nestjs/common";
import { DashboardModule } from "./dashboard/dashboard.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { BeneficiariesModule } from "./beneficiaries/beneficiaries.module";
import { ActivityModule } from "./activity/activity.module";
import { ApprovalsModule } from "./approvals/approvals.module";

@Module({
  imports: [
    DashboardModule,
    AuthModule,
    HealthModule,
    BeneficiariesModule,
    ActivityModule,
    ApprovalsModule,
  ],
})
export class AppModule {}
