import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateSkillLevelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  skillId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  level: number;
}
