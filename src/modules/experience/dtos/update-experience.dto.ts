import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateExperienceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'projectName must be less than 256 characters' })
  projectName: string;

  @ApiProperty()
  @IsDateString()
  dateFrom: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'domain must be less than 256 characters' })
  domain: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024, { message: 'description must be less than 1024 characters' })
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rolesAndResponsibilities: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  skillIds: number[];

  @ApiProperty()
  @IsBoolean()
  isCurrentlyWorking: boolean;
}
