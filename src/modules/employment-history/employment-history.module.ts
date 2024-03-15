import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminEmploymentHistoryController } from './controllers/admin-employment-history.controller';
import { MyEmploymentHistoryController } from './controllers/my-employment-history.controller';
import { EmploymentHistoryEntity } from './entities/employment-history.entity';
import EmploymentHistoryMapper from './mapper/employment-history.mapper';
import { EmploymentHistoryService } from './services/employment-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmploymentHistoryEntity])],
  controllers: [
    MyEmploymentHistoryController,
    AdminEmploymentHistoryController,
  ],
  exports: [EmploymentHistoryService],
  providers: [EmploymentHistoryService, EmploymentHistoryMapper],
})
export class EmploymentHistoryModule {}
