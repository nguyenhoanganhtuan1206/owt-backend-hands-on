import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { validateIsCurrentlyWorking } from '../../../common/utils';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { ExperienceDto } from '../dtos/experience.dto';
import { ExperienceSkillEntity } from './experience-skill.entity';

@Entity('experiences')
@UseDto(ExperienceDto)
export class ExperienceEntity extends AbstractEntity<ExperienceDto> {
  @BeforeInsert()
  @BeforeUpdate()
  validate() {
    validateIsCurrentlyWorking(this);
  }

  @Column({ name: 'project_name', length: '256' })
  projectName: string;

  @Column({ type: 'date' })
  dateFrom: Date;

  @Column({ type: 'date', nullable: true })
  dateTo?: Date;

  @Column({ length: '256' })
  domain: string;

  @Column({ length: '1024' })
  description: string;

  @Column({ name: 'roles_and_responsibilities', type: 'text' })
  rolesAndResponsibilities: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ name: 'is_selected', type: 'boolean', default: false })
  isSelected: boolean;

  @ManyToOne(() => UserEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'experiences_user_id_fkey',
  })
  user: UserEntity;

  @Column({ name: 'is_currently_working', type: 'boolean', default: false })
  isCurrentlyWorking: boolean;

  @OneToMany(
    () => ExperienceSkillEntity,
    (experienceSkill) => experienceSkill.experience,
  )
  experienceSkills: ExperienceSkillEntity[];
}
