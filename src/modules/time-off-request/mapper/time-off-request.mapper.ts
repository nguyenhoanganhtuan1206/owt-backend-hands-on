import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { UserEntity } from 'modules/user/entities/user.entity';

import type { TimeOffCollaboratorEntity } from '../../time-off-collaborator/entities/time-off-collaborator.entity';
import { TimeOffCollaboratorMapper } from '../../time-off-collaborator/mapper/time-off-collaborator.mapper';
import UserMapper from '../../user/mappers/user.mapper';
import type { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';
import type { UpdateTimeOffRequestDto } from '../dtos/update-time-off-request-dto';
import { TimeOffRequestEntity } from '../entities/time-off-request.entity';

@Injectable()
export default class TimeOffRequestMapper {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly collaboratorMapper: TimeOffCollaboratorMapper,
  ) {}

  async toTimeOffRequestEntity(
    userId: number,
    createTimeOffRequestDto: CreateTimeOffRequestDto,
  ): Promise<TimeOffRequestEntity> {
    const timeOffRequestEntity = plainToInstance(
      TimeOffRequestEntity,
      createTimeOffRequestDto,
    );

    if (createTimeOffRequestDto.collaboratorId) {
      timeOffRequestEntity.collaborator = await this.toCollaboratorFromId(
        createTimeOffRequestDto.collaboratorId,
      );
    }

    timeOffRequestEntity.user =
      await this.userMapper.toUserEntityFromId(userId);

    return timeOffRequestEntity;
  }

  async toTimeOffRequestEntityToUpdate(
    timeOffRequest: TimeOffRequestEntity,
    updateTimeOffRequest: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestEntity> {
    if (updateTimeOffRequest.collaboratorId) {
      timeOffRequest.collaborator = await this.toCollaboratorFromId(
        updateTimeOffRequest.collaboratorId,
      );
    }

    if (updateTimeOffRequest.assistantId) {
      timeOffRequest.assistant = await this.toAssistantFromId(
        updateTimeOffRequest.assistantId,
      );
    }

    timeOffRequest.adminNote = updateTimeOffRequest.adminNote;
    timeOffRequest.assistantAttachFile =
      updateTimeOffRequest.assistantAttachFile;

    return timeOffRequest;
  }

  private async toCollaboratorFromId(
    collaboratorId: number | null,
  ): Promise<TimeOffCollaboratorEntity | null> {
    return collaboratorId == null
      ? null
      : this.collaboratorMapper.toTimeOffCollaboratorEntityFromId(
          collaboratorId,
        );
  }

  private async toAssistantFromId(
    assistantId: number | null,
  ): Promise<UserEntity | null> {
    return assistantId == null
      ? null
      : this.userMapper.toUserEntityFromId(assistantId);
  }
}
