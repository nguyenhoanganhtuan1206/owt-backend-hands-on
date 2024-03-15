/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { Repository } from 'typeorm';

import { TimeKeeperEntity } from '../../entities/timekeeper.entity';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { TimeTrackingFake } from '../fakes/time-tracking.fake';

jest.mock('axios');

describe('TimeTrackingService', () => {
  let timeTrackingService: TimeTrackingService;
  let timeKeeperRepository: Repository<TimeKeeperEntity>;

  const pageOptions = TimeTrackingFake.buildTimeTrackingsPageOptionsDto();
  const timeTrackingDtos = TimeTrackingFake.buildTimeTrackingDtosPageDto();

  const timeTracking = TimeTrackingFake.buildTimeTrackingDto();
  const timeTrackings = [timeTracking];
  const timeKeeperEntity = TimeTrackingFake.buildTimeKeeperEntity(timeTracking);
  const timeKeeperEntities = [timeKeeperEntity];
  const response = TimeTrackingFake.buildResponseDataAxios();
  const responses = [response];
  const userTimekeeper = TimeTrackingFake.buildUserTimekeeperDto();
  const userTimekeepers = [userTimekeeper];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeTrackingService,
        {
          provide: getRepositoryToken(TimeKeeperEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    timeTrackingService = module.get<TimeTrackingService>(TimeTrackingService);
    timeKeeperRepository = module.get<Repository<TimeKeeperEntity>>(
      getRepositoryToken(TimeKeeperEntity),
    );
  });

  describe('getTimeTrackings', () => {
    it('should return list of time trackings', async () => {
      jest.spyOn(timeKeeperRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addGroupBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(timeKeeperEntities),
          }) as never,
      );

      jest
        .spyOn(timeTrackingService as any, 'groupAndTransformItems')
        .mockImplementation(() => timeTrackings);

      const result = await timeTrackingService.getTimeTrackings(pageOptions);

      expect(result.data[0].date).toEqual(timeTrackingDtos.data[0].date);
      expect(result.data[0].user).toEqual(timeTrackingDtos.data[0].user);
      expect(result.data[0].checkIn).toEqual(timeTrackingDtos.data[0].checkIn);
      expect(result.data[0].checkOut).toEqual(
        timeTrackingDtos.data[0].checkOut,
      );
      expect(result.data[0].totalPresence).toEqual(
        timeTrackingDtos.data[0].totalPresence,
      );

      expect(timeKeeperRepository.createQueryBuilder).toBeCalledTimes(2);
    });
  });

  describe('getUserTimekeepers', () => {
    it('should return list users timekeeper', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: responses,
      } as AxiosResponse);

      const result = await timeTrackingService.getUserTimekeepers();

      expect(result).toEqual(userTimekeepers);
    });

    it('should handle error and return an empty array', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Server error'));

      await expect(timeTrackingService.getUserTimekeepers()).rejects.toThrow(
        Error,
      );
    });
  });
});
