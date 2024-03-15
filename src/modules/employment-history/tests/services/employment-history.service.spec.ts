/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidBadRequestException } from '../../../../exceptions';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { EmploymentHistoryDto } from '../../dtos/employment-history.dto';
import { EmploymentHistoryEntity } from '../../entities/employment-history.entity';
import EmploymentHistoryMapper from '../../mapper/employment-history.mapper';
import { EmploymentHistoryService } from '../../services/employment-history.service';
import { EmploymentHistoryFake } from '../fakes/employment-history.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('EmploymentHistoryService', () => {
  let employmentHistoryService: EmploymentHistoryService;
  let employmentHistoryRepository: Repository<EmploymentHistoryEntity>;

  const userDto = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userDto);
  const employmentHistory =
    EmploymentHistoryFake.buildEmploymentHistoryEntity(userEntity);

  const mockEmploymentHistoryMapper = {
    createEmploymentHistory: jest.fn(),
    updateEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmploymentHistoryService,
        {
          provide: EmploymentHistoryMapper,
          useValue: mockEmploymentHistoryMapper,
        },
        {
          provide: getRepositoryToken(EmploymentHistoryEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    employmentHistoryService = module.get<EmploymentHistoryService>(
      EmploymentHistoryService,
    );

    employmentHistoryRepository = module.get<
      Repository<EmploymentHistoryEntity>
    >(getRepositoryToken(EmploymentHistoryEntity));
  });

  describe('getEmploymentHistoryByUserId', () => {
    it('should return list of my employment histories successfully in case of full data', async () => {
      employmentHistoryRepository.find = jest
        .fn()
        .mockReturnValue([employmentHistory]);

      const result =
        await employmentHistoryService.getEmploymentHistoryEntitiesByUserId(
          userEntity.id,
        );

      expect(result).toEqual([employmentHistory]);
    });

    it('should return list of my employment histories empty in case of empty data', async () => {
      employmentHistoryRepository.find = jest.fn().mockReturnValue([]);

      const result =
        await employmentHistoryService.getEmploymentHistoryEntitiesByUserId(
          userEntity.id,
        );

      expect(result).toEqual([]);
    });
  });

  describe('createEmploymentHistory', () => {
    const createEmploymentHistoryDto =
      EmploymentHistoryFake.buildCreateEmploymentHistoryDto();

    it('should create my employment history successfully', async () => {
      mockEmploymentHistoryMapper.createEmploymentHistory = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue(employmentHistory);
      employmentHistoryRepository.save = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      const result = await employmentHistoryService.createEmploymentHistory(
        userEntity.id,
        createEmploymentHistoryDto,
      );

      expect(result).toEqual(employmentHistory.toDto());
    });

    it('should throw InvalidBadRequestException in case of dateFrom is after dateTo', async () => {
      createEmploymentHistoryDto.dateFrom = new Date('2024-02-02');
      createEmploymentHistoryDto.dateTo = new Date('2024-02-01');

      await expect(
        employmentHistoryService.createEmploymentHistory(
          userEntity.id,
          createEmploymentHistoryDto,
        ),
      ).rejects.toThrow(
        new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM),
      );
    });

    it('should throw BadRequestException in case of having both dateTo and isCurrentlyWorking fields at the same time', async () => {
      createEmploymentHistoryDto.isCurrentlyWorking = true;

      await expect(
        employmentHistoryService.createEmploymentHistory(
          userEntity.id,
          createEmploymentHistoryDto,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'Cannot have both dateTo and isCurrentlyWorking fields at the same time',
        ),
      );
    });

    it('should throw BadRequestException in case of dateTo is outside the allowed range', async () => {
      const dateTo = new Date();
      dateTo.setFullYear(dateTo.getFullYear() + 11);
      createEmploymentHistoryDto.dateTo = dateTo;
      createEmploymentHistoryDto.isCurrentlyWorking = false;

      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      await expect(
        employmentHistoryService.createEmploymentHistory(
          userEntity.id,
          createEmploymentHistoryDto,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Year ${dateTo.getFullYear()} is outside the allowed range`,
        ),
      );
    });

    it('should throw BadRequestException in case of dateFrom is outside the allowed range', async () => {
      const dateFrom = new Date();
      dateFrom.setFullYear(dateFrom.getFullYear() - 51);
      createEmploymentHistoryDto.dateFrom = dateFrom;
      createEmploymentHistoryDto.isCurrentlyWorking = false;

      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      await expect(
        employmentHistoryService.createEmploymentHistory(
          userEntity.id,
          createEmploymentHistoryDto,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Year ${dateFrom.getFullYear()} is outside the allowed range`,
        ),
      );
    });
  });

  describe('updateEmploymentHistories', () => {
    const updateEmploymentHistoryDto =
      EmploymentHistoryFake.buildUpdateEmploymentHistoryDto(
        employmentHistory.id,
      );

    it('should update my employment history successfully', async () => {
      mockEmploymentHistoryMapper.updateEntity = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      employmentHistoryRepository.findOne = jest
        .fn()
        .mockResolvedValue(employmentHistory);
      employmentHistoryRepository.save = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      const result = await employmentHistoryService.updateEmploymentHistories(
        userEntity.id,
        [updateEmploymentHistoryDto],
      );

      expect(result).toEqual([employmentHistory.toDto()]);
    });

    it('should throw InvalidBadRequestException in case of dateFrom is after dateTo', async () => {
      updateEmploymentHistoryDto.dateFrom = new Date('2024-02-02');
      updateEmploymentHistoryDto.dateTo = new Date('2024-02-01');

      await expect(
        employmentHistoryService.updateEmploymentHistories(userEntity.id, [
          updateEmploymentHistoryDto,
        ]),
      ).rejects.toThrow(
        new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM),
      );
    });

    it('should throw BadRequestException in case of having both dateTo and isCurrentlyWorking fields at the same time', async () => {
      updateEmploymentHistoryDto.isCurrentlyWorking = true;

      await expect(
        employmentHistoryService.updateEmploymentHistories(userEntity.id, [
          updateEmploymentHistoryDto,
        ]),
      ).rejects.toThrow(
        new BadRequestException(
          'Cannot have both dateTo and isCurrentlyWorking fields at the same time',
        ),
      );
    });

    it('should throw BadRequestException in case of dateTo is outside the allowed range', async () => {
      const dateTo = new Date();
      dateTo.setFullYear(dateTo.getFullYear() + 11);
      updateEmploymentHistoryDto.dateTo = dateTo;
      updateEmploymentHistoryDto.isCurrentlyWorking = false;

      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      await expect(
        employmentHistoryService.updateEmploymentHistories(userEntity.id, [
          updateEmploymentHistoryDto,
        ]),
      ).rejects.toThrow(
        new BadRequestException(
          `Year ${dateTo.getFullYear()} is outside the allowed range`,
        ),
      );
    });

    it('should throw BadRequestException in case of dateFrom is outside the allowed range', async () => {
      const dateFrom = new Date();
      dateFrom.setFullYear(dateFrom.getFullYear() - 51);
      updateEmploymentHistoryDto.dateFrom = dateFrom;
      updateEmploymentHistoryDto.isCurrentlyWorking = false;

      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      await expect(
        employmentHistoryService.updateEmploymentHistories(userEntity.id, [
          updateEmploymentHistoryDto,
        ]),
      ).rejects.toThrow(
        new BadRequestException(
          `Year ${dateFrom.getFullYear()} is outside the allowed range`,
        ),
      );
    });

    it('should throw NotFoundException in case of employment history not found', async () => {
      updateEmploymentHistoryDto.dateFrom = new Date();
      updateEmploymentHistoryDto.dateTo = new Date();
      updateEmploymentHistoryDto.isCurrentlyWorking = false;

      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue(employmentHistory);
      employmentHistoryRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        employmentHistoryService.updateEmploymentHistories(userEntity.id, [
          updateEmploymentHistoryDto,
        ]),
      ).rejects.toThrow(new NotFoundException('Employment history not found'));
    });
  });

  describe('deleteEmploymentHistory', () => {
    it('should delete employment history successfully', async () => {
      employmentHistoryRepository.findOne = jest
        .fn()
        .mockResolvedValue(employmentHistory);
      employmentHistoryRepository.remove = jest.fn();
      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue([employmentHistory]);
      employmentHistoryRepository.save = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      await employmentHistoryService.deleteEmploymentHistory(
        userEntity.id,
        employmentHistory.id,
      );

      expect(employmentHistoryRepository.findOne).toBeCalled();
      expect(employmentHistoryRepository.remove).toBeCalled();
      expect(employmentHistoryRepository.find).toBeCalled();
      expect(employmentHistoryRepository.save).toBeCalled();
    });

    it('should throw NotFoundException in case of Employment history not found', async () => {
      employmentHistoryRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        employmentHistoryService.deleteEmploymentHistory(
          userEntity.id,
          employmentHistory.id,
        ),
      ).rejects.toThrow(new NotFoundException('Employment history not found'));

      expect(employmentHistoryRepository.findOne).toBeCalled();
    });
  });

  describe('updateToggleEmploymentHistory', () => {
    it('should update toggle employment history successfully', async () => {
      employmentHistoryRepository.findOneBy = jest
        .fn()
        .mockResolvedValue(employmentHistory);
      employmentHistoryRepository.save = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      const result =
        await employmentHistoryService.updateToggleEmploymentHistory(
          employmentHistory.id,
        );

      expect(result).toEqual(employmentHistory.toDto());
      expect(employmentHistoryRepository.findOneBy).toBeCalled();
      expect(employmentHistoryRepository.save).toBeCalled();
    });

    it('should throw NotFoundException in case of Employment history not found', async () => {
      employmentHistoryRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(
        employmentHistoryService.updateToggleEmploymentHistory(
          employmentHistory.id,
        ),
      ).rejects.toThrow(new NotFoundException('Employment history not found'));

      expect(employmentHistoryRepository.findOneBy).toBeCalled();
    });
  });

  describe('updateEmploymentHistoriesPositions', () => {
    const updateEmploymentHistoryPositionDto =
      EmploymentHistoryFake.buildUpdateEmploymentHistoryPositionDto(
        employmentHistory.id,
      );

    it('should update employment history potitions successfully', async () => {
      const employmentHistoryDto =
        EmploymentHistoryFake.buildEmploymentHistoryDto(
          userDto,
          employmentHistory.id,
        );

      const expectation: EmploymentHistoryDto[] = [
        {
          ...employmentHistoryDto,
          id: employmentHistory.id,
          position: 2,
        },
      ];

      const employmentHistoryEntities: EmploymentHistoryEntity[] = [
        EmploymentHistoryFake.buildEmploymentHistoryEntityFromDto(
          userEntity,
          employmentHistoryDto,
        ),
      ];

      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue(employmentHistoryEntities);
      employmentHistoryRepository.save = jest
        .fn()
        .mockResolvedValue(employmentHistoryEntities);

      const result =
        await employmentHistoryService.updateEmploymentHistoriesPositions(
          employmentHistory.id,
          [updateEmploymentHistoryPositionDto],
        );

      expect(result).toEqual(expectation);
    });

    it('should throw BadRequestException in case of employment history id not found', async () => {
      employmentHistoryRepository.find = jest.fn().mockResolvedValue([]);

      await expect(
        employmentHistoryService.updateEmploymentHistoriesPositions(
          employmentHistory.id,
          [updateEmploymentHistoryPositionDto],
        ),
      ).rejects.toThrow(
        new NotFoundException('Employment history with ID 1 not found'),
      );

      expect(employmentHistoryRepository.find).toBeCalled();
    });

    it('should throw BadRequestException in case of duplicate position', async () => {
      employmentHistoryRepository.find = jest
        .fn()
        .mockResolvedValue([employmentHistory]);

      await expect(
        employmentHistoryService.updateEmploymentHistoriesPositions(
          employmentHistory.id,
          [
            updateEmploymentHistoryPositionDto,
            updateEmploymentHistoryPositionDto,
          ],
        ),
      ).rejects.toThrow(
        new NotFoundException(
          'Duplicate position 2 found for user ID 1 in the update request',
        ),
      );

      expect(employmentHistoryRepository.find).toBeCalled();
    });
  });
});
