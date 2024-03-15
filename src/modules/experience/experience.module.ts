import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LevelEntity } from '../../modules/user/entities/level.entity';
import { PositionEntity } from '../../modules/user/entities/position.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { SkillEntity } from '../skill/entities/skill.entity';
import { UserSkillEntity } from '../skill/entities/user-skill.entity';
import SkillMapper from '../skill/mappers/skill.mapper';
import { SkillService } from '../skill/services/skill.service';
import { SkillGroupEntity } from '../skill-group/entities/skill-group.entity';
import SkillGroupMapper from '../skill-group/mappers/skill-group.mapper';
import { SkillGroupModule } from '../skill-group/skill-group.module';
import { UserModule } from '../user/user.module';
import { AdminExperienceController } from './controllers/admin-experience.controller';
import { MyExperienceController } from './controllers/my-experience.controller';
import { ExperienceEntity } from './entities/experience.entity';
import { ExperienceSkillEntity } from './entities/experience-skill.entity';
import ExperienceMapper from './mappers/experience.mapper';
import { ExperienceService } from './services/experience.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExperienceEntity,
      ExperienceSkillEntity,
      SkillEntity,
      SkillGroupEntity,
      UserSkillEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
    ]),
    UserModule,
    SkillGroupModule,
  ],
  controllers: [MyExperienceController, AdminExperienceController],
  exports: [ExperienceService],
  providers: [
    ExperienceService,
    ExperienceMapper,
    SkillMapper,
    SkillGroupMapper,
    SkillService,
  ],
})
export class ExperienceModule {}
