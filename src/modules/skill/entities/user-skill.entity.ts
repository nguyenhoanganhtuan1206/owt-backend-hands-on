import { IsInt, Max, Min } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { UserSkillDto } from '../dtos/user-skill.dto';
import { SkillEntity } from './skill.entity';

@Entity('user_skills')
@UseDto(UserSkillDto)
export class UserSkillEntity extends AbstractEntity<UserSkillDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_skills_user_id',
  })
  user: UserEntity;

  @ManyToOne(() => SkillEntity, { eager: true })
  @JoinColumn({
    name: 'skill_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_skills_skill_id',
  })
  skill: SkillEntity;

  @Column({ default: 0 })
  @IsInt()
  @Min(0)
  @Max(5)
  level: number;

  @Column({ default: true })
  isSelected: boolean;
}
