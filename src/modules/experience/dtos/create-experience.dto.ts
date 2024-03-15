import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateExperienceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'projectName must be less than 256 characters' })
  projectName: string;

  @ApiProperty()
  @IsNotEmpty()
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
  @MaxLength(1024, {
    message: 'description must be less than or equal to 1024 characters',
  })
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rolesAndResponsibilities: string;

  @ApiProperty()
  @IsNotEmpty()
  skillIds: number[];

  @ApiProperty()
  @IsBoolean()
  isCurrentlyWorking: boolean;
}
