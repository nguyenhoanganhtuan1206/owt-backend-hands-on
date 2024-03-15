import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCertificationDto {
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
  issueDate: Date | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expirationDate: Date | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(256, { message: 'credentialId must be less than 256 characters' })
  credentialId: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  credentialUrl: string | null;
}
