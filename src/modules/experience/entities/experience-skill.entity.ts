import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { SkillEntity } from '../../skill/entities/skill.entity';
import { ExperienceSkillDto } from '../dtos/experience-skill.dto';
import { ExperienceEntity } from './experience.entity';

@Entity('experience_skills')
@UseDto(ExperienceSkillDto)
export class ExperienceSkillEntity extends AbstractEntity<ExperienceSkillDto> {
  @ManyToOne(() => ExperienceEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'experience_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'experience_skills_experience_id_fkey',
  })
  experience: ExperienceEntity;

  @Column({ name: 'experience_id' })
  experienceId: number;

  @ManyToOne(() => SkillEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'skill_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'experience_skills_skill_id_fkey',
  })
  skill: SkillEntity;

  @Column({ name: 'skill_id' })
  skillId: number;
}
