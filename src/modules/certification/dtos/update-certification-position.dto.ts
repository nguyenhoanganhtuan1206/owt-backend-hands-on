import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateCertificationPositionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  certificationId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  position: number;
}
