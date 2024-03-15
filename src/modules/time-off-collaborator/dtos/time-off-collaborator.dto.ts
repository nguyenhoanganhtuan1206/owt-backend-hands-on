import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { TimeOffCollaboratorEntity } from '../entities/time-off-collaborator.entity';

export class TimeOffCollaboratorDto extends AbstractDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  collaboratorEmail: string;

  @ApiProperty()
  collaboratorFirstName: string;

  @ApiProperty()
  collaboratorLastName: string;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  constructor(timeOffCollaboratorEntity: TimeOffCollaboratorEntity) {
    super(timeOffCollaboratorEntity);
    this.employeeId = timeOffCollaboratorEntity.employeeId;
    this.collaboratorEmail = timeOffCollaboratorEntity.collaboratorEmail;
    this.collaboratorFirstName =
      timeOffCollaboratorEntity.collaboratorFirstName;
    this.collaboratorLastName = timeOffCollaboratorEntity.collaboratorLastName;
    this.startDate = timeOffCollaboratorEntity.startDate;
    this.endDate = timeOffCollaboratorEntity.endDate;
  }
}
