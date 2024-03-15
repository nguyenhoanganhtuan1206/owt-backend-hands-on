import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DateType, RequestStatusType } from '../../../constants';
import { DateProvider } from '../../../providers';
import type { TimeOffCollaboratorDto } from '../../time-off-collaborator/dtos/time-off-collaborator.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { AllowanceDto } from '../../vacation-balance/dtos/allowance.dto';
import type { TimeOffRequestEntity } from '../entities/time-off-request.entity';

export class TimeOffRequestDto extends AbstractDto {
  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  dateFrom: Date;

  @ApiProperty()
  dateTo: Date;

  @ApiProperty({ enum: DateType })
  dateType: string;

  @ApiProperty()
  totalDays: number;

  @ApiProperty()
  details: string;

  @ApiPropertyOptional({ type: String })
  attachedFile?: string | null;

  @ApiPropertyOptional({ type: String })
  assistantAttachFile?: string | null;

  @ApiPropertyOptional()
  collaborator?: TimeOffCollaboratorDto | undefined;

  @ApiPropertyOptional()
  assistant?: UserDto | undefined;

  @ApiPropertyOptional({ enum: RequestStatusType })
  status?: string;

  @ApiPropertyOptional()
  adminNote?: string | null;

  @ApiPropertyOptional()
  pmNote?: string | undefined;

  @ApiPropertyOptional()
  allowance?: AllowanceDto | undefined;

  constructor(
    timeOffRequestEntity: TimeOffRequestEntity,
    allowance?: AllowanceDto,
  ) {
    super(timeOffRequestEntity);
    this.user = timeOffRequestEntity.user.toDto();
    timeOffRequestEntity.user.password = undefined;
    this.dateFrom = DateProvider.formatDate(timeOffRequestEntity.dateFrom);
    this.dateTo = DateProvider.formatDate(timeOffRequestEntity.dateTo);
    this.dateType = timeOffRequestEntity.dateType;
    this.totalDays = timeOffRequestEntity.totalDays;
    this.details = timeOffRequestEntity.details;
    this.attachedFile = timeOffRequestEntity.attachedFile;
    this.assistantAttachFile = timeOffRequestEntity.assistantAttachFile;
    this.collaborator = timeOffRequestEntity.collaborator
      ? timeOffRequestEntity.collaborator.toDto()
      : undefined;
    this.assistant = timeOffRequestEntity.assistant
      ? timeOffRequestEntity.assistant.toDto()
      : undefined;
    this.adminNote = timeOffRequestEntity.adminNote;
    this.status = timeOffRequestEntity.status;
    this.pmNote = timeOffRequestEntity.pmNote || undefined;
    this.allowance = allowance;
  }
}
