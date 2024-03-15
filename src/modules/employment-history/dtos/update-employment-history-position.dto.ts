import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateEmploymentHistoryPositionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  employmentHistoryId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  position: number;
}
