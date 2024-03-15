import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateExperiencePositionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  experienceId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  position: number;
}
