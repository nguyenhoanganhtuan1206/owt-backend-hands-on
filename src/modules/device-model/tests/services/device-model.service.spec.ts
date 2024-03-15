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
import { DeviceModelEntity } from '../../entities/device-model.entity';
import DeviceModelMapper from '../../mappers/device-model.mapper';
import { DeviceModelService } from '../../services/device-model.service';
import { DeviceModelFake } from '../fakes/device-model.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('DeviceModelService', () => {
  let deviceModelService: DeviceModelService;
  let deviceModelRepository: Repository<DeviceModelEntity>;

  const deviceModelDto = DeviceModelFake.buildDeviceModelDto();
  const deviceModelEntity =
    DeviceModelFake.buildDeviceModelEntity(deviceModelDto);
  const device = DeviceFake.buildDeviceDto();
  const deviceEntity = DeviceFake.buildDeviceEntity(device);

  const mockDeviceModelMapper = {
    toDeviceModelEntity: jest.fn(),
    toDeviceModelEntityFromId: jest.fn(),
  };

  const mockDeviceService = {
    findDevicesByModelId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceModelService,
        {
          provide: DeviceModelMapper,
          useValue: mockDeviceModelMapper,
        },
        {
          provide: DeviceService,
          useValue: mockDeviceService,
        },
        {
          provide: getRepositoryToken(DeviceModelEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    deviceModelService = module.get<DeviceModelService>(DeviceModelService);
    deviceModelRepository = module.get<Repository<DeviceModelEntity>>(
      getRepositoryToken(DeviceModelEntity),
    );
  });

  describe('getAllDeviceModels', () => {
    it('should return all device models', async () => {
      const deviceModels = [deviceModelEntity];

      jest
        .spyOn(deviceModelRepository, 'find')
        .mockResolvedValueOnce(deviceModels);

      const result = await deviceModelService.getAllDeviceModels();

      expect(result[0].id).toEqual(deviceModels[0].id);
      expect(result[0].name).toEqual(deviceModels[0].name);

      expect(deviceModelRepository.find).toBeCalled();
    });
  });

  describe('createDeviceModel', () => {
    const createDeviceModel = DeviceModelFake.buildCreateDeviceModelDto();

    it('should create new device model', async () => {
      jest
        .spyOn(deviceModelRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntity')
        .mockResolvedValueOnce(deviceModelEntity);
      jest
        .spyOn(deviceModelRepository, 'save')
        .mockResolvedValueOnce(deviceModelEntity);

      const result =
        await deviceModelService.createDeviceModel(createDeviceModel);

      expect(result.id).toEqual(deviceModelDto.id);
      expect(result.name).toEqual(deviceModelDto.name);

      expect(deviceModelRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceModelMapper.toDeviceModelEntity).toBeCalled();
      expect(deviceModelRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if model existed', async () => {
      jest
        .spyOn(deviceModelRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(deviceModelEntity),
        } as never);

      await expect(
        deviceModelService.createDeviceModel(createDeviceModel),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceModelRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if type owning model is not found', async () => {
      jest
        .spyOn(deviceModelRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_TYPE_NOT_FOUND);
        });

      await expect(
        deviceModelService.createDeviceModel(createDeviceModel),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceModelRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceModelMapper.toDeviceModelEntity).toBeCalled();
    });
  });

  describe('updateDeviceModel', () => {
    const updateDeviceModel = DeviceModelFake.buildUpdateDeviceModelDto();

    it('should update device model', async () => {
      jest
        .spyOn(deviceModelRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntityFromId')
        .mockResolvedValueOnce(deviceModelEntity);
      jest
        .spyOn(deviceModelRepository, 'save')
        .mockResolvedValueOnce(deviceModelEntity);

      const result = await deviceModelService.updateDeviceModel(
        deviceModelDto.id,
        updateDeviceModel,
      );

      expect(result.id).toEqual(deviceModelDto.id);
      expect(result.name).toEqual(deviceModelDto.name);

      expect(deviceModelRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceModelMapper.toDeviceModelEntityFromId).toBeCalled();
      expect(deviceModelRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if model existed', async () => {
      jest
        .spyOn(deviceModelRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(deviceModelEntity),
        } as never);

      await expect(
        deviceModelService.updateDeviceModel(
          deviceModelDto.id,
          updateDeviceModel,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceModelRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if model not found', async () => {
      jest
        .spyOn(deviceModelRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
        });

      await expect(
        deviceModelService.updateDeviceModel(
          deviceModelDto.id,
          updateDeviceModel,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceModelRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceModelMapper.toDeviceModelEntityFromId).toBeCalled();
    });
  });

  describe('deleteDeviceModel', () => {
    const deviceEntities = [deviceEntity];

    it('should delete device model', async () => {
      jest
        .spyOn(mockDeviceService, 'findDevicesByModelId')
        .mockResolvedValueOnce([]);
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntityFromId')
        .mockResolvedValueOnce(deviceModelEntity);
      jest.spyOn(deviceModelRepository, 'remove').mockImplementation(jest.fn());

      await deviceModelService.deleteDeviceModel(deviceModelDto.id);

      expect(mockDeviceService.findDevicesByModelId).toBeCalled();
      expect(mockDeviceModelMapper.toDeviceModelEntityFromId).toBeCalled();
      expect(deviceModelRepository.remove).toBeCalled();
    });

    it('should throw InvalidBadRequestException if model has assigned for device', async () => {
      jest
        .spyOn(mockDeviceService, 'findDevicesByModelId')
        .mockResolvedValueOnce(deviceEntities);

      await expect(
        deviceModelService.deleteDeviceModel(deviceModelDto.id),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockDeviceService.findDevicesByModelId).toBeCalled();
    });

    it('should throw InvalidNotFoundException if model not found', async () => {
      jest
        .spyOn(mockDeviceService, 'findDevicesByModelId')
        .mockResolvedValueOnce([]);
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
        });

      await expect(
        deviceModelService.deleteDeviceModel(deviceModelDto.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockDeviceService.findDevicesByModelId).toBeCalled();
      expect(mockDeviceModelMapper.toDeviceModelEntityFromId).toBeCalled();
    });
  });

  describe('validateDeviceModel', () => {
    it('should validate device model', async () => {
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntityFromId')
        .mockResolvedValueOnce(deviceModelEntity);

      await deviceModelService.validateDeviceModel(
        deviceEntity.model.id,
        deviceEntity.type.id,
      );

      expect(mockDeviceModelMapper.toDeviceModelEntityFromId).toBeCalled();
    });

    it('should throw InvalidNotFoundException if model not found', async () => {
      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
        });

      await expect(
        deviceModelService.validateDeviceModel(
          deviceEntity.model.id,
          deviceEntity.type.id,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockDeviceModelMapper.toDeviceModelEntityFromId).toBeCalled();
    });

    it('should throw InvalidBadRequestException if model not belong to type', async () => {
      const invalidTypeId = 2;

      jest
        .spyOn(mockDeviceModelMapper, 'toDeviceModelEntityFromId')
        .mockResolvedValueOnce(deviceModelEntity);

      await expect(
        deviceModelService.validateDeviceModel(
          deviceEntity.model.id,
          invalidTypeId,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockDeviceModelMapper.toDeviceModelEntityFromId).toBeCalled();
    });
  });
});
