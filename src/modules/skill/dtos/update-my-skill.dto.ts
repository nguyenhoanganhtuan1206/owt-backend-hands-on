import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

import { UpdateSkillLevelDto } from './update-skill-level.dto';

export default class UpdateMySkillDto {
  @ApiProperty({ type: [UpdateSkillLevelDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateSkillLevelDto)
  skills: UpdateSkillLevelDto[];
}
