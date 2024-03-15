import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEducationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'University/Institution is too long' })
  institution: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'Degree is too long' })
  degree: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateFrom: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateTo: Date;
}
