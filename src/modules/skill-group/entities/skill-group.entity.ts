import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { SkillEntity } from '../../skill/entities/skill.entity';
import { SkillGroupDto } from '../dtos/skill-group.dto';

@Entity({ name: 'skill_groups' })
@UseDto(SkillGroupDto)
export class SkillGroupEntity extends AbstractEntity<SkillGroupDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => SkillEntity, (skillEntity) => skillEntity.group, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'skill_group_id' })
  skills: SkillEntity[];
}
