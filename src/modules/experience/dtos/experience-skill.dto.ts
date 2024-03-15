import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { SkillDto } from '../../skill/dtos/skill.dto';
import type { ExperienceSkillEntity } from '../entities/experience-skill.entity';
import type { ExperienceDto } from './experience.dto';

export class ExperienceSkillDto extends AbstractDto {
  experience: ExperienceDto;

  skill: SkillDto;

  constructor(experienceSkillEntity: ExperienceSkillEntity) {
    super(experienceSkillEntity);
    this.experience = experienceSkillEntity.experience.toDto();
    this.skill = experienceSkillEntity.skill.toDto();
  }
}
