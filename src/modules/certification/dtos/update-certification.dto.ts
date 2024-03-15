import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCertificationDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'name must be less than 256 characters' })
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, {
    message: 'issuingOrganisation must be less than 256 characters',
  })
  issuingOrganisation: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issueDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expirationDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(256, { message: 'credentialId must be less than 256 characters' })
  credentialId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  credentialUrl: string;
}
