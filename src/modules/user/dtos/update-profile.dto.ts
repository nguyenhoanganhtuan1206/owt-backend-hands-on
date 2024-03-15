import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export default class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  phoneNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}
