import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import MailService from '../../integrations/mail/mail.service';
import { TimeKeeperEntity } from '../../modules/timekeeper/entities/timekeeper.entity';
import { BuddyBuddeePairModule } from '../buddy-buddee-pair/buddy-buddee-pair.module';
import { TimeTrackingService } from '../timekeeper/services/time-tracking.service';
import { AdminUserController } from './controllers/admin-user.controller';
import { ProfileController } from './controllers/profile.controller';
import { CvEntity } from './entities/cv.entity';
import { LevelEntity } from './entities/level.entity';
import { PermissionEntity } from './entities/permission.entity';
import { PositionEntity } from './entities/position.entity';
import { UserEntity } from './entities/user.entity';
import LevelMapper from './mappers/level.mapper';
import PositionMapper from './mappers/position.mapper';
import UserMapper from './mappers/user.mapper';
import { CvService } from './services/cv.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PositionEntity,
      LevelEntity,
      PermissionEntity,
      CvEntity,
      TimeKeeperEntity,
    ]),
    forwardRef(() => BuddyBuddeePairModule),
  ],
  controllers: [AdminUserController, ProfileController],
  exports: [UserService, UserMapper],
  providers: [
    UserService,
    CvService,
    MailService,
    UserMapper,
    PositionMapper,
    LevelMapper,
    TimeTrackingService,
  ],
})
export class UserModule {}
