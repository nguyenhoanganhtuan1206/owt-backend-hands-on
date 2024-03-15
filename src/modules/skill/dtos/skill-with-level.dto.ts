import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { SkillEntity } from '../entities/skill.entity';

export class SkillWithLevelDto extends AbstractDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  level: number;

  @ApiPropertyOptional()
  isSelected: boolean;

  constructor(skillEntity: SkillEntity, level?: number, isSelected?: boolean) {
    super(skillEntity);
    this.name = skillEntity.name;
    this.level = level === undefined ? 0 : level;
    this.isSelected = isSelected === undefined ? false : isSelected;
  }
}
