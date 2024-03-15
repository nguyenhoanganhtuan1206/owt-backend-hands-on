/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TimeOffCollaboratorEntity } from '../../entities/time-off-collaborator.entity';
import { TimeOffCollaboratorMapper } from '../../mapper/time-off-collaborator.mapper';
import { TimeOffCollaboratorService } from '../../services/time-off-collaborator.service';
import { TimeOffCollaboratorFake } from '../fakes/time-off-collaborator.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('TimeOffCollaboratorService', () => {
  let timeOffCollaboratorService: TimeOffCollaboratorService;
  let timeOffCollaboratorRepository: Repository<TimeOffCollaboratorEntity>;

  const timeOffRequestDtos =
    TimeOffCollaboratorFake.buildTimeOffRequestPageDto();
  const pageOptionsCollaborators =
    TimeOffCollaboratorFake.buildTimeOffCollaboratorPageOptionsDto();
  const timeOffCollaboratorDtos =
    TimeOffCollaboratorFake.buildTimeOffCollaboratorPageDto();

  const mockTimeOffCollaboratorMapper = {
    toTimeOffCollaboratorEntityFromId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffCollaboratorService,
        {
          provide: TimeOffCollaboratorMapper,
          useValue: mockTimeOffCollaboratorMapper,
        },
        {
          provide: getRepositoryToken(TimeOffCollaboratorEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    timeOffCollaboratorService = module.get<TimeOffCollaboratorService>(
      TimeOffCollaboratorService,
    );
    timeOffCollaboratorRepository = module.get<
      Repository<TimeOffCollaboratorEntity>
    >(getRepositoryToken(TimeOffCollaboratorEntity));
  });

  describe('getAllCollaborators', () => {
    it('should be return all time off collaborators', async () => {
      const timeOffCollaboratorEntities = [TimeOffCollaboratorEntity];

      jest
        .spyOn(timeOffCollaboratorRepository, 'createQueryBuilder')
        .mockReturnValue({
          andWhere: jest.fn().mockReturnThis,
          addOrderBy: jest.fn().mockReturnThis,
          paginate: jest
            .fn()
            .mockResolvedValue([
              timeOffCollaboratorEntities,
              timeOffRequestDtos.meta,
            ]),
        } as never);
      jest
        .spyOn(timeOffCollaboratorEntities, 'toPageDto')
        .mockReturnValue(timeOffCollaboratorDtos);

      const result = await timeOffCollaboratorService.getAllCollaborators(
        pageOptionsCollaborators,
      );

      expect(result).toEqual(timeOffCollaboratorDtos);
      expect(timeOffCollaboratorRepository.createQueryBuilder).toBeCalled();
    });
  });
});
