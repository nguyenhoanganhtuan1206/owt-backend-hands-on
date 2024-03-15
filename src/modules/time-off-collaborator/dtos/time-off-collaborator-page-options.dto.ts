import { IsEmail, IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class TimeOffCollaboratorPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  collaboratorEmail: string;

  @IsOptional()
  @IsString()
  collaboratorName: string;
}
