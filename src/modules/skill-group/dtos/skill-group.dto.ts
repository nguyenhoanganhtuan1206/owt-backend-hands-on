import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { SkillWithLevelDto } from '../../skill/dtos/skill-with-level.dto';
import type { SkillGroupEntity } from '../entities/skill-group.entity';

export class SkillGroupDto extends AbstractDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional({ type: () => [SkillWithLevelDto] })
  skills?: SkillWithLevelDto[];

  constructor(skillGroupEntity: SkillGroupEntity) {
    super(skillGroupEntity);
    this.name = skillGroupEntity.name;
    this.skills =
      Array.isArray(skillGroupEntity.skills) &&
      skillGroupEntity.skills.length > 0
        ? skillGroupEntity.skills.map(
            (skillEntity) => new SkillWithLevelDto(skillEntity),
          )
        : [];
  }
}
