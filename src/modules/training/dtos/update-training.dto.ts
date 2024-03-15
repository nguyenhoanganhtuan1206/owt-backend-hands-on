import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTrainingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  trainingDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  duration: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, {
    message: 'Title must be less than or equal to 256 characters',
  })
  trainingTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024, {
    message: 'Description must be less than or equal to 1024 characters',
  })
  trainingDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  levelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  topicId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  coachIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  trainingLink?: string;
}
