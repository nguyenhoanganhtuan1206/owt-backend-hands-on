/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import { DeviceEntity } from '../../../device/entities/device.entity';
import { DeviceFake } from '../../../device/tests/fakes/device.fake';
import { DeviceTypeEntity } from '../../entities/device-type.entity';
import DeviceTypeMapper from '../../mappers/device-type.mapper';
import { DeviceTypeService } from '../../services/device-type.service';
import { DeviceTypeFake } from '../fakes/device-type.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('DeviceTypeService', () => {
  let deviceTypeService: DeviceTypeService;
  let deviceTypeRepository: Repository<DeviceTypeEntity>;
  let deviceRepository: Repository<DeviceEntity>;

  const deviceTypeDto = DeviceTypeFake.buildDeviceTypeDto();
  const deviceTypeEntity = DeviceTypeFake.buildDeviceTypeEntity(deviceTypeDto);
  const device = DeviceFake.buildDeviceDto();
  const deviceEntity = DeviceFake.buildDeviceEntity(device);

  const mockDeviceTypeMapper = {
    toDeviceTypeEntityFromId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceTypeService,
        {
          provide: DeviceTypeMapper,
          useValue: mockDeviceTypeMapper,
        },
        {
          provide: getRepositoryToken(DeviceTypeEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeviceEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    deviceTypeService = module.get<DeviceTypeService>(DeviceTypeService);
    deviceTypeRepository = module.get<Repository<DeviceTypeEntity>>(
      getRepositoryToken(DeviceTypeEntity),
    );
    deviceRepository = module.get<Repository<DeviceEntity>>(
      getRepositoryToken(DeviceEntity),
    );
  });

  describe('getAllDeviceTypes', () => {
    it('should return all device types', async () => {
      const deviceTypes = [deviceTypeEntity];

      jest
        .spyOn(deviceTypeRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(deviceTypes),
        } as never);

      const result = await deviceTypeService.getAllDeviceTypes();

      expect(result[0].id).toEqual(deviceTypes[0].id);
      expect(result[0].name).toEqual(deviceTypes[0].name);

      expect(deviceTypeRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('createDeviceType', () => {
    const createDeviceType = DeviceTypeFake.buildCreateDeviceTypeDto();

    it('should create new device type', async () => {
      jest
        .spyOn(deviceTypeRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(deviceTypeRepository, 'save')
        .mockResolvedValueOnce(deviceTypeEntity);

      const result = await deviceTypeService.createDeviceType(createDeviceType);

      expect(result.id).toEqual(deviceTypeDto.id);
      expect(result.name).toEqual(deviceTypeDto.name);

      expect(deviceTypeRepository.createQueryBuilder).toBeCalled();
      expect(deviceTypeRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if type existed', async () => {
      jest
        .spyOn(deviceTypeRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(deviceTypeEntity),
        } as never);

      await expect(
        deviceTypeService.createDeviceType(createDeviceType),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceTypeRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('updateDeviceType', () => {
    const updateDeviceType = DeviceTypeFake.buildUpdateDeviceTypeDto();

    it('should update device type', async () => {
      jest
        .spyOn(deviceTypeRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceTypeMapper, 'toDeviceTypeEntityFromId')
        .mockResolvedValueOnce(deviceTypeEntity);
      jest
        .spyOn(deviceTypeRepository, 'save')
        .mockResolvedValueOnce(deviceTypeEntity);
      jest
        .spyOn(deviceTypeRepository, 'findOneOrFail')
        .mockResolvedValueOnce(deviceTypeEntity);

      const result = await deviceTypeService.updateDeviceType(
        deviceTypeDto.id,
        updateDeviceType,
      );

      expect(result.id).toEqual(deviceTypeDto.id);
      expect(result.name).toEqual(deviceTypeDto.name);

      expect(deviceTypeRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceTypeMapper.toDeviceTypeEntityFromId).toBeCalled();
      expect(deviceTypeRepository.save).toBeCalled();
      expect(deviceTypeRepository.findOneOrFail).toBeCalledWith({
        relations: {
          models: true,
        },
        where: { id: deviceTypeEntity.id },
      });
    });

    it('should throw InvalidBadRequestException if type existed', async () => {
      jest
        .spyOn(deviceTypeRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(deviceTypeEntity),
        } as never);

      await expect(
        deviceTypeService.updateDeviceType(deviceTypeDto.id, updateDeviceType),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceTypeRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if type not found', async () => {
      jest
        .spyOn(deviceTypeRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceTypeMapper, 'toDeviceTypeEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_TYPE_NOT_FOUND);
        });

      await expect(
        deviceTypeService.updateDeviceType(deviceTypeDto.id, updateDeviceType),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceTypeRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceTypeMapper.toDeviceTypeEntityFromId).toBeCalled();
    });

    it('should throw EntityNotFoundError if find type fail', async () => {
      jest
        .spyOn(deviceTypeRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceTypeMapper, 'toDeviceTypeEntityFromId')
        .mockResolvedValueOnce(deviceTypeEntity);
      jest
        .spyOn(deviceTypeRepository, 'save')
        .mockResolvedValueOnce(deviceTypeEntity);
      jest
        .spyOn(deviceTypeRepository, 'findOneOrFail')
        .mockRejectedValueOnce(
          new EntityNotFoundError(DeviceTypeEntity, deviceTypeEntity.id),
        );

      await expect(
        deviceTypeService.updateDeviceType(deviceTypeDto.id, updateDeviceType),
      ).rejects.toThrow(EntityNotFoundError);

      expect(deviceTypeRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceTypeMapper.toDeviceTypeEntityFromId).toBeCalled();
      expect(deviceTypeRepository.save).toBeCalled();
      expect(deviceTypeRepository.findOneOrFail).toBeCalledWith({
        relations: {
          models: true,
        },
        where: { id: deviceTypeEntity.id },
      });
    });
  });

  describe('deleteDeviceType', () => {
    it('should delete device type', async () => {
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(mockDeviceTypeMapper, 'toDeviceTypeEntityFromId')
        .mockResolvedValueOnce(deviceTypeEntity);
      jest.spyOn(deviceTypeRepository, 'remove').mockImplementation(jest.fn());

      await deviceTypeService.deleteDeviceType(deviceTypeDto.id);

      expect(deviceRepository.findOne).toBeCalledWith({
        where: {
          type: { id: deviceTypeDto.id },
        },
      });
      expect(mockDeviceTypeMapper.toDeviceTypeEntityFromId).toBeCalled();
      expect(deviceTypeRepository.remove).toBeCalled();
    });

    it('should throw InvalidBadRequestException if type has assigned for device', async () => {
      jest
        .spyOn(deviceRepository, 'findOne')
        .mockResolvedValueOnce(deviceEntity);

      await expect(
        deviceTypeService.deleteDeviceType(deviceTypeDto.id),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: {
          type: { id: deviceTypeDto.id },
        },
      });
    });

    it('should throw InvalidNotFoundException if type not found', async () => {
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(mockDeviceTypeMapper, 'toDeviceTypeEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_TYPE_NOT_FOUND);
        });

      await expect(
        deviceTypeService.deleteDeviceType(deviceTypeDto.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: {
          type: { id: deviceTypeDto.id },
        },
      });
      expect(mockDeviceTypeMapper.toDeviceTypeEntityFromId).toBeCalled();
    });
  });
});
