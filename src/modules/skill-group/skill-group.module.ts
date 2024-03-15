import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminSkillGroupController } from '../skill-group/controllers/admin-skill-group.controller';
import { SkillGroupEntity } from '../skill-group/entities/skill-group.entity';
import SkillGroupMapper from '../skill-group/mappers/skill-group.mapper';
import { SkillGroupService } from '../skill-group/services/skill-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([SkillGroupEntity])],
  controllers: [AdminSkillGroupController],
  exports: [SkillGroupService, SkillGroupMapper],
  providers: [SkillGroupService, SkillGroupMapper],
})
export class SkillGroupModule {}
