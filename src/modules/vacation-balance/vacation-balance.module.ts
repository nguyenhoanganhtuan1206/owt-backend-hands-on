import { Module } from '@nestjs/common';

import { TimeOffRequestModule } from '../time-off-request/time-off-request.module';
import { UserModule } from '../user/user.module';
import { AdminVacationBalanceController } from './controllers/admin-vacation-balance.controller';
import { VacationBalanceService } from './services/vacation-balance.service';

@Module({
  imports: [UserModule, TimeOffRequestModule],
  controllers: [AdminVacationBalanceController],
  exports: [VacationBalanceService],
  providers: [VacationBalanceService],
})
export class VacationBalanceModule {}
