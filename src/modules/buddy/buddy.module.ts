import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BuddyBuddeePairModule } from '../buddy-buddee-pair/buddy-buddee-pair.module';
import { UserModule } from '../user/user.module';
import { AdminBuddyController } from './controllers/admin-buddy.controller';
import { BuddyEntity } from './entities/buddy.entity';
import BuddyMapper from './mappers/buddy.mapper';
import { BuddyService } from './services/buddy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuddyEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => BuddyBuddeePairModule),
  ],
  controllers: [AdminBuddyController],
  exports: [BuddyService, BuddyMapper],
  providers: [BuddyService, BuddyMapper],
})
export class BuddyModule {}
