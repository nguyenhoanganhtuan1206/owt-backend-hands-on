import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { SkillGroupEntity } from '../../skill-group/entities/skill-group.entity';
import { SkillDto } from '../dtos/skill.dto';

@Entity({ name: 'skills' })
@UseDto(SkillDto)
export class SkillEntity extends AbstractEntity<SkillDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => SkillGroupEntity)
  @JoinColumn({
    name: 'skill_group_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_skills_skill_group_id',
  })
  group: SkillGroupEntity;
}
