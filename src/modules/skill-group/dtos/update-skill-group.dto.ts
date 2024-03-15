import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSkillGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
