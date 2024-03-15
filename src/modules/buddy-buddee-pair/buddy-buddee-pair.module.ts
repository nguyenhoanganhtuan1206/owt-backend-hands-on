import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BuddyModule } from '../buddy/buddy.module';
import { UserModule } from '../user/user.module';
import { BuddyBuddeeTouchpointModule } from './../buddy-buddee-touchpoint/buddy-buddee-touchpoint.module';
import { AdminBuddyBuddeePairController } from './controllers/admin-buddy-buddee-pair.controller';
import { BuddyBuddeePairEntity } from './entities/buddy-buddee-pair.entity';
import BuddyBuddeePairMapper from './mappers/buddy-buddee-pair.mapper';
import { BuddyBuddeePairService } from './services/buddy-buddee-pair.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuddyBuddeePairEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => BuddyModule),
    forwardRef(() => BuddyBuddeeTouchpointModule),
  ],
  controllers: [AdminBuddyBuddeePairController],
  exports: [BuddyBuddeePairService, BuddyBuddeePairMapper],
  providers: [BuddyBuddeePairService, BuddyBuddeePairMapper],
})
export class BuddyBuddeePairModule {}
