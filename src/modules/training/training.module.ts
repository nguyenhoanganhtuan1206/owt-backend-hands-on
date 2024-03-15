import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LevelEntity } from '../../modules/user/entities/level.entity';
import LevelMapper from '../../modules/user/mappers/level.mapper';
import PositionMapper from '../../modules/user/mappers/position.mapper';
import { PositionEntity } from '../user/entities/position.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AdminTrainingController } from './controllers/admin-training.controller';
import { TrainingController } from './controllers/training.controller';
import { TrainingEntity } from './entities/training.entity';
import { TrainingCoachEntity } from './entities/training-coach.entity';
import { TrainingLevelEntity } from './entities/training-level.entity';
import { TrainingTopicEntity } from './entities/training-topic.entity';
import TrainingMapper from './mappers/training.mapper';
import TrainingLevelMapper from './mappers/training-level.mapper';
import TrainingTopicMapper from './mappers/training-topic.mapper';
import { TrainingService } from './services/training.service';
import TrainingValidator from './validators/training.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingEntity,
      TrainingTopicEntity,
      TrainingLevelEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
      TrainingCoachEntity,
    ]),
    UserModule,
  ],
  controllers: [TrainingController, AdminTrainingController],
  exports: [TrainingService],
  providers: [
    TrainingService,
    TrainingLevelMapper,
    TrainingTopicMapper,
    TrainingMapper,
    PositionMapper,
    LevelMapper,
    TrainingValidator,
  ],
})
export class TrainingModule {}
