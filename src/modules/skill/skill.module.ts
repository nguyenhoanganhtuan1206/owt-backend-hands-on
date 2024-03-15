import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SkillGroupEntity } from '../skill-group/entities/skill-group.entity';
import { SkillGroupModule } from '../skill-group/skill-group.module';
import { UserModule } from '../user/user.module';
import { AdminSkillController } from './controllers/admin-skill.controller';
import { MySkillController } from './controllers/my-skill.controller';
import { SkillEntity } from './entities/skill.entity';
import { UserSkillEntity } from './entities/user-skill.entity';
import SkillMapper from './mappers/skill.mapper';
import { SkillService } from './services/skill.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillEntity, SkillGroupEntity, UserSkillEntity]),
    UserModule,
    SkillGroupModule,
  ],
  controllers: [MySkillController, AdminSkillController],
  exports: [SkillService],
  providers: [SkillService, SkillMapper],
})
export class SkillModule {}
