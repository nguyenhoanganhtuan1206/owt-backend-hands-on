import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BuddyModule } from '../buddy/buddy.module';
import { BuddyBuddeePairModule } from '../buddy-buddee-pair/buddy-buddee-pair.module';
import BuddyBuddeeTouchpointMapper from '../buddy-buddee-touchpoint/mappers/buddy-buddee-touchpoint.mapper';
import { BuddyBuddeeTouchpointService } from '../buddy-buddee-touchpoint/services/buddy-buddee-touchpoint.service';
import { UserModule } from '../user/user.module';
import { AdminBuddyBuddeeTouchpointController } from './controllers/admin-buddy-buddee-touchpoint.controller';
import { BuddyBuddeeTouchpointController } from './controllers/buddy-buddee-touchpoint.controller';
import { MyBuddeeController } from './controllers/my-buddee.controller';
import { BuddyBuddeeTouchpointEntity } from './entities/buddy-buddee-touchpoint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuddyBuddeeTouchpointEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => BuddyModule),
    forwardRef(() => BuddyBuddeePairModule),
  ],
  controllers: [
    AdminBuddyBuddeeTouchpointController,
    BuddyBuddeeTouchpointController,
    MyBuddeeController,
  ],
  exports: [BuddyBuddeeTouchpointService, BuddyBuddeeTouchpointMapper],
  providers: [BuddyBuddeeTouchpointService, BuddyBuddeeTouchpointMapper],
})
export class BuddyBuddeeTouchpointModule {}
