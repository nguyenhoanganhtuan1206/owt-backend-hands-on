import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LevelEntity } from '../../modules/user/entities/level.entity';
import { PositionEntity } from '../../modules/user/entities/position.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import LevelMapper from '../../modules/user/mappers/level.mapper';
import PositionMapper from '../../modules/user/mappers/position.mapper';
import { UserModule } from '../user/user.module';
import { AdminCertificationController } from './controllers/admin-certification.controller';
import { MyCertificationController } from './controllers/my-certification.controller';
import { CertificationEntity } from './entities/certification.entity';
import CertificationMapper from './mappers/certification.mapper';
import { CertificationService } from './services/certification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CertificationEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
    ]),
    UserModule,
  ],
  controllers: [MyCertificationController, AdminCertificationController],
  exports: [CertificationService],
  providers: [
    CertificationService,
    CertificationMapper,
    PositionMapper,
    LevelMapper,
  ],
})
export class CertificationModule {}
