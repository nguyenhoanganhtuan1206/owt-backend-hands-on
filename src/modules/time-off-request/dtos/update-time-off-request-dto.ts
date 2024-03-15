import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTimeOffRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  collaboratorId?: number | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  assistantId?: number | undefined;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assistantAttachFile?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024, {
    message: 'adminNote must be less than or equal to 1024 characters',
  })
  adminNote?: string;
}
