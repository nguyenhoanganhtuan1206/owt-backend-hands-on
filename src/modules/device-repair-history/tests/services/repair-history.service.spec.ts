/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import { DeviceService } from '../../../device/services/device.service';
import { DeviceFake } from '../../../device/tests/fakes/device.fake';
import type { CreateDeviceRepairHistoryDto } from '../../dtos/create-device-repair-history.dto';
import { RepairHistoryEntity } from '../../entities/repair-history.entity';
import RepairHistoryMapper from '../../mappers/repair-history.mapper';
import { RepairHistoryService } from '../../services/repair-history.service';
import { RepairHistoryFake } from '../fakes/repair-history.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('RepairHistoryService', () => {
  let repairHistoryService: RepairHistoryService;
  let repairHistoryRepository: Repository<RepairHistoryEntity>;

  const device = DeviceFake.buildDeviceDto();
  const repairHistory = RepairHistoryFake.buildRepairHistoryDto();
  const repairHistoryEntity =
    RepairHistoryFake.buildRepairHistoryEntity(repairHistory);
  const repairHistoryEntities = [repairHistoryEntity];
  const repairHistoryPageOptions =
    RepairHistoryFake.buildRepairHistoryPageOptionsDto();
  const repairHistoryDtosPageDto =
    RepairHistoryFake.buildRepairHistoryDtosPageDto();

  const mockDeviceService = {
    findDeviceById: jest.fn(),
  };

  const mockRepairHistoryMapper = {
    toRepairHistoryEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairHistoryService,
        {
          provide: DeviceService,
          useValue: mockDeviceService,
        },
        {
          provide: RepairHistoryMapper,
          useValue: mockRepairHistoryMapper,
        },
        {
          provide: getRepositoryToken(RepairHistoryEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    repairHistoryService =
      module.get<RepairHistoryService>(RepairHistoryService);
    repairHistoryRepository = module.get<Repository<RepairHistoryEntity>>(
      getRepositoryToken(RepairHistoryEntity),
    );
  });

  describe('getAllDeviceRepairHistories', () => {
    const deviceEntity = DeviceFake.buildDeviceEntity(device);

    it('should return list of current users logged into the currently repair history', async () => {
      jest
        .spyOn(repairHistoryRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          paginate: jest
            .fn()
            .mockResolvedValueOnce([
              repairHistoryEntities,
              repairHistoryDtosPageDto.meta,
            ]),
        } as never);
      jest
        .spyOn(repairHistoryEntities, 'toPageDto')
        .mockReturnValueOnce(repairHistoryDtosPageDto);
      jest
        .spyOn(mockDeviceService, 'findDeviceById')
        .mockResolvedValueOnce(deviceEntity);

      const result = await repairHistoryService.getAllDeviceRepairHistories(
        repairHistory.device.id,
        repairHistoryPageOptions,
      );

      expect(result).toEqual(repairHistoryDtosPageDto);

      expect(repairHistoryRepository.createQueryBuilder).toBeCalled();
      expect(repairHistoryEntities.toPageDto).toBeCalled();
      expect(mockDeviceService.findDeviceById).toBeCalled();
    });
  });

  describe('createDeviceRepairHistory', () => {
    const deviceEntity = DeviceFake.buildDeviceEntity(device);
    const createRepairHistory =
      RepairHistoryFake.buildCreateDeviceRepairHistoryDto();

    it('should create a new device repair history', async () => {
      jest
        .spyOn(mockDeviceService, 'findDeviceById')
        .mockResolvedValueOnce(deviceEntity);
      jest
        .spyOn(mockRepairHistoryMapper, 'toRepairHistoryEntity')
        .mockImplementation(() => Promise.resolve(repairHistoryEntity));
      jest
        .spyOn(repairHistoryRepository, 'save')
        .mockImplementation(() => Promise.resolve(repairHistoryEntity));

      const result =
        await repairHistoryService.createDeviceRepairHistory(
          createRepairHistory,
        );

      expect(result).toEqual(repairHistory);

      expect(mockDeviceService.findDeviceById).toBeCalled();
      expect(mockRepairHistoryMapper.toRepairHistoryEntity).toBeCalled();
      expect(repairHistoryRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if find device not found', async () => {
      jest
        .spyOn(mockDeviceService, 'findDeviceById')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_NOT_FOUND);
        });

      await expect(
        repairHistoryService.createDeviceRepairHistory(createRepairHistory),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockDeviceService.findDeviceById).toBeCalled();
    });

    it('should throw InvalidBadRequestException if repairDate greater than currentDate', async () => {
      const createRepairHistoryDto = {
        ...RepairHistoryFake.buildCreateDeviceRepairHistoryDto(),
        repairDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      } as CreateDeviceRepairHistoryDto;

      jest
        .spyOn(mockDeviceService, 'findDeviceById')
        .mockResolvedValueOnce(deviceEntity);

      await expect(
        repairHistoryService.createDeviceRepairHistory(createRepairHistoryDto),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockDeviceService.findDeviceById).toBeCalled();
    });
  });

  describe('deleteDeviceRepairHistory', () => {
    it('should delete device repair history', async () => {
      jest
        .spyOn(repairHistoryRepository, 'findOneBy')
        .mockResolvedValueOnce(repairHistoryEntity);
      jest
        .spyOn(repairHistoryRepository, 'remove')
        .mockImplementation(jest.fn());

      await repairHistoryService.deleteDeviceRepairHistory(repairHistory.id);

      expect(repairHistoryRepository.findOneBy).toHaveBeenCalledWith({
        id: repairHistory.id,
      });
      expect(repairHistoryRepository.remove).toBeCalled();
    });

    it('should throw InvalidBadRequestException if currentRepairHistory not found', async () => {
      jest
        .spyOn(repairHistoryRepository, 'findOneBy')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(
            ErrorCode.DEVICE_REPAIR_HISTORY_NOT_FOUND,
          );
        });

      await expect(
        repairHistoryService.deleteDeviceRepairHistory(repairHistoryEntity.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(repairHistoryRepository.findOneBy).toHaveBeenCalledWith({
        id: repairHistory.id,
      });
    });
  });
});
