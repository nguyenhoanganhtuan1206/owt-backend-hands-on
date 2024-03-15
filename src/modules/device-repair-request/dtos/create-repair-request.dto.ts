import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRepairRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;
}
