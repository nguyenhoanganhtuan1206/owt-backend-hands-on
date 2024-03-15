import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import type { PageDto } from '../../../common/dto/page.dto';
import type { TimeOffCollaboratorDto } from '../dtos/time-off-collaborator.dto';
import type { TimeOffCollaboratorPageOptionsDto } from '../dtos/time-off-collaborator-page-options.dto';
import { TimeOffCollaboratorEntity } from '../entities/time-off-collaborator.entity';

@Injectable()
export class TimeOffCollaboratorService {
  constructor(
    @InjectRepository(TimeOffCollaboratorEntity)
    private collaboratorRepository: Repository<TimeOffCollaboratorEntity>,
  ) {}

  public async getAllCollaborators(
    pageOptionsDto: TimeOffCollaboratorPageOptionsDto,
  ): Promise<PageDto<TimeOffCollaboratorDto>> {
    const queryBuilder = this.getCollaboratorQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  private getCollaboratorQueryBuilder(
    pageOptionsDto: TimeOffCollaboratorPageOptionsDto,
  ): SelectQueryBuilder<TimeOffCollaboratorDto> {
    const { employeeId, collaboratorEmail, collaboratorName, orderBy } =
      pageOptionsDto;
    const currentDate = new Date();

    const queryBuilder = this.collaboratorRepository.createQueryBuilder(
      'timeOffCollaborator',
    );

    queryBuilder.andWhere('timeOffCollaborator.employeeId = :employeeId', {
      employeeId,
    });

    queryBuilder.andWhere(
      `(
        (timeOffCollaborator.startDate IS NULL OR timeOffCollaborator.startDate <= :currentDate)
        AND
        (timeOffCollaborator.endDate IS NULL OR timeOffCollaborator.endDate >= :currentDate)
      )`,
      { currentDate },
    );

    if (collaboratorEmail) {
      queryBuilder.andWhere('timeOffCollaborator.collaboratorEmail where ', {
        collaboratorEmail,
      });
    }

    if (collaboratorName) {
      queryBuilder.andWhere(
        [
          `LOWER(CONCAT(timeOffCollaborator.collaboratorFirstName, ' ', timeOffCollaborator.collaboratorLastName)) LIKE LOWER(:collaboratorName)`,
        ].join(' OR '),
        { collaboratorName: `%${collaboratorName}%` },
      );
    }

    queryBuilder.addOrderBy(
      'timeOffCollaborator.collaboratorFirstName',
      orderBy,
    );
    queryBuilder.addOrderBy(
      'timeOffCollaborator.collaboratorLastName',
      orderBy,
    );

    return queryBuilder;
  }
}
