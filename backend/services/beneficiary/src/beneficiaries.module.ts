import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { BeneficiariesService } from "./beneficiaries.service";
import { BeneficiariesController } from "./beneficiaries.controller";
import { ActivityLogger } from "@shared/activity-logger";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ANALYTICS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 5004,
        },
      },
    ]),
  ],
  controllers: [BeneficiariesController],
  providers: [BeneficiariesService, ActivityLogger],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {}
