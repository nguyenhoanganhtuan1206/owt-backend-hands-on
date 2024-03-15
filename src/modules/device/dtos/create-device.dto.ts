import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { DeviceStatus } from '../../../constants';

export class CreateDeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  modelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Serial number is too long' })
  serialNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  detail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  assigneeId: number | null;

  @ApiProperty({ enum: DeviceStatus })
  @IsNotEmpty()
  status: DeviceStatus;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ownerId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  purchasedAt: Date;
}
