import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { DateType } from '../../../constants';

export class CreateTimeOffRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateFrom: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateTo: Date;

  @ApiProperty({ enum: DateType })
  @IsNotEmpty()
  dateType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  totalDays: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024, {
    message: 'details must be less than or equal to 1024 characters',
  })
  details: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  attachedFile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  collaboratorId?: number | undefined;
}
