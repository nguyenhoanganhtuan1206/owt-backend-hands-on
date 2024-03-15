import { skillDto, skillEntity } from '../../../skill/tests/fakes/skill.fake';
import type { ExperienceSkillDto } from '../../dtos/experience-skill.dto';
import type { ExperienceSkillEntity } from '../../entities/experience-skill.entity';
import { experienceDto, experienceEntity } from './experience.fake';

export const experienceSkillDto: ExperienceSkillDto = {
  experience: experienceDto,
  skill: skillDto,
  id: Math.random(),
  createdAt: new Date('2024-01-24 09:57:42.195356'),
  updatedAt: new Date('2024-01-24 09:57:42.195356'),
};

export const experienceSkillEntity: ExperienceSkillEntity = {
  experience: experienceEntity,
  experienceId: experienceEntity.id,
  skill: skillEntity,
  skillId: skillEntity.id,
  id: experienceSkillDto.id,
  createdAt: experienceSkillDto.createdAt,
  updatedAt: experienceSkillDto.updatedAt,
  toDto(): ExperienceSkillDto {
    return experienceSkillDto;
  },
};
