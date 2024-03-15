import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LevelEntity } from '../../modules/user/entities/level.entity';
import { PositionEntity } from '../../modules/user/entities/position.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import LevelMapper from '../../modules/user/mappers/level.mapper';
import PositionMapper from '../../modules/user/mappers/position.mapper';
import { UserModule } from '../user/user.module';
import { AdminEducationController } from './controllers/admin-education.controller';
import { MyEducationController } from './controllers/my-education.controller';
import { EducationEntity } from './entities/education.entity';
import EducationMapper from './mappers/education.mapper';
import { EducationService } from './services/education.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EducationEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
    ]),
    UserModule,
  ],
  controllers: [MyEducationController, AdminEducationController],
  exports: [EducationService],
  providers: [EducationService, EducationMapper, PositionMapper, LevelMapper],
})
export class EducationModule {}
