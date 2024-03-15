import type { PageDto } from 'common/dto/page.dto';
import type { IFile } from 'interfaces/IFile';

import { Order, RequestStatusType } from '../../../../constants';
import type { ExternalUserAccessDto } from '../../../auth/dto/ExternalUserAccessDto';
import type { TimeOffCollaboratorDto } from '../../../time-off-collaborator/dtos/time-off-collaborator.dto';
import type { TimeOffCollaboratorEntity } from '../../../time-off-collaborator/entities/time-off-collaborator.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateTimeOffRequestDto } from '../../dtos/create-time-off-request.dto';
import type { TimeOffRequestDto } from '../../dtos/time-off-request.dto';
import type { TimeOffRequestsPageOptionsDto } from '../../dtos/time-off-requests-page-options.dto';
import type { UpdateTimeOffRequestDto } from '../../dtos/update-time-off-request-dto';
import type { TimeOffRequestEntity } from '../../entities/time-off-request.entity';

export class TimeOffRequestFake {
  static buildTimeOffCollaboratorDto(): TimeOffCollaboratorDto {
    const timeOffCollaborator: TimeOffCollaboratorDto = {
      id: 1,
      employeeId: '00001',
      collaboratorEmail: 'collaborator@test.gmail',
      collaboratorFirstName: 'First name',
      collaboratorLastName: 'Last name',
      startDate: new Date(),
      endDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return timeOffCollaborator;
  }

  static buildTimeOffCollaboratorEntity(
    timeOffCollaborator: TimeOffCollaboratorDto,
  ): TimeOffCollaboratorEntity {
    return {
      id: timeOffCollaborator.id,
      employeeId: timeOffCollaborator.employeeId,
      collaboratorEmail: timeOffCollaborator.collaboratorEmail,
      collaboratorFirstName: timeOffCollaborator.collaboratorFirstName,
      collaboratorLastName: timeOffCollaborator.collaboratorLastName,
      toDto: jest.fn(() => timeOffCollaborator) as unknown,
    } as TimeOffCollaboratorEntity;
  }

  static buildTimeOffRequestDto(): TimeOffRequestDto {
    const timeOffRequestDto: TimeOffRequestDto = {
      id: 1,
      user: UserFake.buildUserDto(),
      dateFrom: new Date(),
      dateTo: new Date(),
      dateType: 'FULL_DAY',
      totalDays: 1,
      details: 'detail',
      attachedFile: 'https://s3/time-off-attach/test.png',
      assistantAttachFile: 'https://s3/assistant-attach/test.png',
      collaborator: TimeOffRequestFake.buildTimeOffCollaboratorDto(),
      assistant: UserFake.buildUserDto(),
      status: RequestStatusType.PENDING,
      adminNote: 'note',
      pmNote: 'note',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return timeOffRequestDto;
  }

  static buildUpdateTimeOffRequestDto(): UpdateTimeOffRequestDto {
    const updateTimeOffRequestDto: UpdateTimeOffRequestDto = {
      collaboratorId: 1,
      assistantId: UserFake.buildUserDto().id,
      assistantAttachFile: 'https://s3/assistant-attach/test.png',
      adminNote: 'note',
    };

    return updateTimeOffRequestDto;
  }

  static buildTimeOffRequestEntity(
    timeOffRequest: TimeOffRequestDto,
  ): TimeOffRequestEntity {
    return {
      id: timeOffRequest.id,
      user: timeOffRequest.user,
      dateType: timeOffRequest.dateType,
      dateFrom: timeOffRequest.dateFrom,
      dateTo: timeOffRequest.dateTo,
      details: timeOffRequest.details,
      assistant: timeOffRequest.assistant,
      attachedFile: timeOffRequest.attachedFile,
      collaborator: timeOffRequest.collaborator,
      status: timeOffRequest.status,
      toDto: jest.fn(() => timeOffRequest) as unknown,
    } as TimeOffRequestEntity;
  }

  static buildTimeOffRequestEntityAfterUpdate(
    timeOffRequest: TimeOffRequestDto,
    statusUpdate: RequestStatusType,
  ): TimeOffRequestEntity {
    return {
      id: timeOffRequest.id,
      user: timeOffRequest.user,
      dateType: timeOffRequest.dateType,
      dateFrom: timeOffRequest.dateFrom,
      dateTo: timeOffRequest.dateTo,
      totalDays: timeOffRequest.totalDays,
      details: timeOffRequest.details,
      attachedFile: timeOffRequest.attachedFile,
      assistantAttachFile: timeOffRequest.assistantAttachFile,
      collaborator: timeOffRequest.collaborator,
      assistant: timeOffRequest.assistant,
      adminNote: timeOffRequest.adminNote,
      pmNote: timeOffRequest.pmNote,
      status: statusUpdate,
      createdAt: timeOffRequest.createdAt,
      updatedAt: timeOffRequest.updatedAt,
      toDto: jest.fn(() => ({
        ...timeOffRequest,
        status: statusUpdate,
      })) as unknown,
    } as TimeOffRequestEntity;
  }

  static buildExternalUserAccessDto(): ExternalUserAccessDto {
    const externalUserAccessDto: ExternalUserAccessDto = {
      accessToken: 'accessToken',
      pmNote: 'pm Note',
    };

    return externalUserAccessDto;
  }

  static buildTimeOffRequestsPageOptionsDto(): TimeOffRequestsPageOptionsDto {
    const pageOptions: TimeOffRequestsPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
    };

    return pageOptions;
  }

  static buildTimeOffRequestPageDto(): PageDto<TimeOffRequestDto> {
    const timeOffRequestDtos: PageDto<TimeOffRequestDto> = {
      data: [TimeOffRequestFake.buildTimeOffRequestDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return timeOffRequestDtos;
  }

  static buildCreateTimeOffRequestDto(): CreateTimeOffRequestDto {
    const createTimeOffRequestDto: CreateTimeOffRequestDto = {
      dateFrom: new Date(),
      dateTo: new Date(),
      dateType: 'FULL_DAY',
      collaboratorId: 1,
      totalDays: 3,
      details: 'detail',
    };

    return createTimeOffRequestDto;
  }

  static buildTimeOffRequestIFile(): IFile {
    const file: IFile = {
      encoding: 'encoding',
      buffer: Buffer.from('bufferContent'),
      fieldname: 'attachFile',
      mimetype: 'image/jpeg',
      originalname: 'test.jpeg',
      size: 1,
    };

    return file;
  }
}
