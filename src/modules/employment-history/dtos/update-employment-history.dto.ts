import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateEmploymentHistoryDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'Must be less than 256 characters' })
  company: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateFrom: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiProperty()
  @IsBoolean()
  isCurrentlyWorking: boolean;
}
