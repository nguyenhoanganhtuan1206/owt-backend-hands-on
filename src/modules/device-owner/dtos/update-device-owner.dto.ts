import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateDeviceOwnerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: "Device's owner name not exceed 100 characters" })
  name: string;
}
