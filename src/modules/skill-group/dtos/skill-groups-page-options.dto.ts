import { IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class SkillGroupsPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  name: string;
}
