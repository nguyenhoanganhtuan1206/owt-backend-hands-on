import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdatePositionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  educationId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  position: number;
}
