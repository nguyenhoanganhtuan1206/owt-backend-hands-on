import type { PageDto } from '../../../../common/dto/page.dto';
import { Order } from '../../../../constants';
import type { TimeOffRequestDto } from '../../../time-off-request/dtos/time-off-request.dto';
import { TimeOffRequestFake } from '../../../time-off-request/tests/fakes/time-off-request.fake';
import type { TimeOffCollaboratorDto } from '../../dtos/time-off-collaborator.dto';
import type { TimeOffCollaboratorPageOptionsDto } from '../../dtos/time-off-collaborator-page-options.dto';
import type { TimeOffCollaboratorEntity } from '../../entities/time-off-collaborator.entity';

export class TimeOffCollaboratorFake {
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

  static buildTimeOffCollaboratorPageDto(): PageDto<TimeOffCollaboratorDto> {
    const timeOffRequestDtos: PageDto<TimeOffCollaboratorDto> = {
      data: [TimeOffCollaboratorFake.buildTimeOffCollaboratorDto()],
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

  static buildTimeOffCollaboratorPageOptionsDto(): TimeOffCollaboratorPageOptionsDto {
    const pageOptions: TimeOffCollaboratorPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      employeeId: '0001',
      collaboratorEmail: 'collaborator.email@test.com',
      collaboratorName: 'collaborator name',
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
}
