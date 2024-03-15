/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { SkillGroupDto } from '../../skill-group/dtos/skill-group.dto';
import type { SkillEntity } from '../entities/skill.entity';

export class SkillDto extends AbstractDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  group?: SkillGroupDto;

  constructor(skillEntity: SkillEntity) {
    super(skillEntity);
    this.name = skillEntity.name;
    this.group = skillEntity.group ? skillEntity.group.toDto() : undefined;
  }
}
