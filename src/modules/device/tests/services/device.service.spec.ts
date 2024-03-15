/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DeviceStatus } from '../../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import { DeviceModelService } from '../../../device-model/services/device-model.service';
import UserMapper from '../../../user/mappers/user.mapper';
import { DeviceEntity } from '../../entities/device.entity';
import { DeviceAssigneeHistoryEntity } from '../../entities/device-assiginee-history.entity';
import DeviceMapper from '../../mappers/device.mapper';
import { DeviceService } from '../../services/device.service';
import { DeviceFake } from '../fakes/device.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('DeviceService', () => {
  let deviceService: DeviceService;
  let deviceAssigneeHistoryRepository: Repository<DeviceAssigneeHistoryEntity>;
  let deviceRepository: Repository<DeviceEntity>;

  const device = DeviceFake.buildDeviceDto();
  const deviceEntity = DeviceFake.buildDeviceEntity(device);
  const deviceAssigneeHistory = DeviceFake.buildDeviceAssigneeHistoryDto();
  const devicePageOptions = DeviceFake.buildDevicesPageOptionsDto();
  const assigneeHistoryPageOptions =
    DeviceFake.buildDevicesAssigneeHistoryPageOptionsDto();
  const deviceDtosPageDto = DeviceFake.buildDeviceDtosPageDto();
  const assigneeHistoryDtosPageDto =
    DeviceFake.buildDeviceAssigneeHistoryDtosPageDto();

  const mockDeviceMapper = {
    toDeviceEntity: jest.fn(),
    toDeviceEntityToUpdate: jest.fn(),
    toRepairHistoryEntity: jest.fn(),
  };

  const mockDeviceModelService = {
    validateDeviceModel: jest.fn(),
  };

  const mockUserMapper = {
    toUserEntityFromId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: DeviceModelService,
          useValue: mockDeviceModelService,
        },
        {
          provide: DeviceMapper,
          useValue: mockDeviceMapper,
        },
        {
          provide: UserMapper,
          useValue: mockUserMapper,
        },
        {
          provide: getRepositoryToken(DeviceAssigneeHistoryEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeviceEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    deviceService = module.get<DeviceService>(DeviceService);
    deviceAssigneeHistoryRepository = module.get<
      Repository<DeviceAssigneeHistoryEntity>
    >(getRepositoryToken(DeviceAssigneeHistoryEntity));
    deviceRepository = module.get<Repository<DeviceEntity>>(
      getRepositoryToken(DeviceEntity),
    );
  });

  describe('getMyDevicesCurrentlyAssigned', () => {
    const deviceAssigneeHistoryEntity =
      DeviceFake.buildDeviceAssigneeHistoryEntity(deviceAssigneeHistory);
    const deviceAssigneeHistoryEntities = [deviceAssigneeHistoryEntity];

    it('should return list of current users logged into the currently assigned device', async () => {
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          paginate: jest
            .fn()
            .mockResolvedValueOnce([
              deviceAssigneeHistoryEntities,
              assigneeHistoryDtosPageDto.meta,
            ]),
        } as never);
      jest
        .spyOn(deviceAssigneeHistoryEntities, 'toPageDto')
        .mockReturnValueOnce(assigneeHistoryDtosPageDto);

      const result =
        await deviceService.getMyDevicesCurrentlyAssigned(devicePageOptions);

      expect(result).toEqual(assigneeHistoryDtosPageDto);

      expect(deviceAssigneeHistoryRepository.createQueryBuilder).toBeCalled();
      expect(deviceAssigneeHistoryEntities.toPageDto).toBeCalled();
    });
  });

  describe('getDeviceAssignHistoryDetail', () => {
    const deviceAssigneeHistoryEntity = {
      ...DeviceFake.buildDeviceAssigneeHistoryEntity(deviceAssigneeHistory),
      returnedAt: null,
    } as DeviceAssigneeHistoryEntity;

    it('should return device assign detail by id', async () => {
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'findOne')
        .mockResolvedValueOnce(deviceAssigneeHistoryEntity);

      const result = await deviceService.getDeviceAssignHistoryDetail(
        deviceAssigneeHistoryEntity.user,
        deviceAssigneeHistory.id,
      );

      expect(result).toEqual(deviceAssigneeHistory);

      expect(deviceAssigneeHistoryRepository.findOne).toBeCalledWith({
        where: {
          id: deviceAssigneeHistory.id,
          user: { id: deviceAssigneeHistoryEntity.user.id },
        },
      });
    });

    it('should throw InvalidBadRequestException if repair history not found', async () => {
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'findOne')
        .mockResolvedValueOnce(null);

      await expect(
        deviceService.getDeviceAssignHistoryDetail(
          deviceAssigneeHistoryEntity.user,
          deviceAssigneeHistory.id,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceAssigneeHistoryRepository.findOne).toBeCalledWith({
        where: {
          id: deviceAssigneeHistory.id,
          user: { id: deviceAssigneeHistoryEntity.user.id },
        },
      });
    });
  });

  describe('getAllDevices', () => {
    it('should return devices', async () => {
      const deviceEntities = [deviceEntity];

      jest.spyOn(deviceRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            addSelect: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            paginate: jest
              .fn()
              .mockImplementation(() =>
                Promise.resolve([deviceEntities, deviceDtosPageDto.meta]),
              ),
          }) as never,
      );
      jest
        .spyOn(deviceEntities, 'toPageDto')
        .mockReturnValue(deviceDtosPageDto);

      const result = await deviceService.getAllDevices(devicePageOptions);

      expect(result).toEqual(deviceDtosPageDto);

      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(deviceEntities.toPageDto).toBeCalled();
    });
  });

  describe('getDeviceDetails', () => {
    it('should return device details by id', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(deviceEntity));

      const result = await deviceService.getDeviceDetails(device.id);

      expect(result).toEqual(device);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });

    it('should throw InvalidNotFoundException if device not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));

      await expect(deviceService.getDeviceDetails(device.id)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });
  });

  describe('getAllDeviceAssignHistoriesById', () => {
    const deviceAssigneeHistoryEntity =
      DeviceFake.buildDeviceAssigneeHistoryEntity(deviceAssigneeHistory);
    const deviceAssigneeHistoryEntities = [deviceAssigneeHistoryEntity];

    it('should return all assignee history of device', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    deviceAssigneeHistoryEntities,
                    assigneeHistoryDtosPageDto.meta,
                  ]),
                ),
            }) as never,
        );
      jest
        .spyOn(deviceAssigneeHistoryEntities, 'toPageDto')
        .mockReturnValueOnce(assigneeHistoryDtosPageDto);

      const result = await deviceService.getAllDeviceAssignHistoriesById(
        device.id,
        assigneeHistoryPageOptions,
      );

      expect(result).toEqual(assigneeHistoryDtosPageDto);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(deviceAssigneeHistoryRepository.createQueryBuilder).toBeCalled();
      expect(deviceAssigneeHistoryEntities.toPageDto).toBeCalled();
    });

    it('should throw InvalidNotFoundException if device not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));

      await expect(
        deviceService.getAllDeviceAssignHistoriesById(
          device.id,
          assigneeHistoryPageOptions,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });
  });

  describe('createDevice', () => {
    const deviceAssigneeHistoryEntity =
      DeviceFake.buildDeviceAssigneeHistoryEntity(deviceAssigneeHistory);
    const createDevice = DeviceFake.buildCreateDeviceDto();

    it('should create a new device', async () => {
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntity')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceRepository, 'save')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'countBy')
        .mockResolvedValueOnce(0);
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'createQueryBuilder')
        .mockImplementation(
          () =>
            ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(null),
            }) as never,
        );
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'save')
        .mockImplementation(() => Promise.resolve(deviceAssigneeHistoryEntity));

      const result = await deviceService.createDevice(createDevice);

      expect(result).toEqual(device);

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.findOneBy).toBeCalledWith({
        code: createDevice.code,
      });
      expect(mockDeviceMapper.toDeviceEntity).toBeCalled();
      expect(deviceRepository.save).toBeCalled();
      expect(deviceAssigneeHistoryRepository.countBy).toBeCalled();
      expect(deviceAssigneeHistoryRepository.createQueryBuilder).toBeCalled();
      expect(deviceAssigneeHistoryRepository.save).toBeCalled();
    });

    it('should create a new device without new history', async () => {
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntity')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceRepository, 'save')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'countBy')
        .mockResolvedValueOnce(1);
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'createQueryBuilder')
        .mockImplementation(
          () =>
            ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(deviceAssigneeHistoryEntity),
            }) as never,
        );

      const result = await deviceService.createDevice(createDevice);

      expect(result).toEqual(device);

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.findOneBy).toBeCalledWith({
        code: createDevice.code,
      });
      expect(mockDeviceMapper.toDeviceEntity).toBeCalled();
      expect(deviceRepository.save).toBeCalled();
      expect(deviceAssigneeHistoryRepository.countBy).toBeCalled();
      expect(deviceAssigneeHistoryRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if device model not found', async () => {
      jest
        .spyOn(mockDeviceModelService, 'validateDeviceModel')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
        });

      await expect(deviceService.createDevice(createDevice)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
    });

    it('should throw InvalidBadRequestException if model not belong to type', async () => {
      const createDeviceError = {
        ...DeviceFake.buildCreateDeviceDto(),
        typeId: 2,
      };

      jest
        .spyOn(mockDeviceModelService, 'validateDeviceModel')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.DEVICE_MODEL_DOES_NOT_BELONG_TO_DEVICE_TYPE,
          );
        });

      await expect(
        deviceService.createDevice(createDeviceError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
    });

    it('should throw InvalidBadRequestException if update status scrapped with assignee', async () => {
      const createDeviceError = {
        ...DeviceFake.buildCreateDeviceDto(),
        status: DeviceStatus.SCRAPPED,
      };

      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');

      await expect(
        deviceService.createDevice(createDeviceError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
    });

    it('should throw InvalidBadRequestException if device code is existing', async () => {
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(deviceEntity));

      await expect(deviceService.createDevice(createDevice)).rejects.toThrow(
        InvalidBadRequestException,
      );

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.findOneBy).toBeCalledWith({
        code: createDevice.code,
      });
    });

    it('should throw InvalidNotFoundException if type not found', async () => {
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_TYPE_NOT_FOUND);
        });

      await expect(deviceService.createDevice(createDevice)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.findOneBy).toBeCalledWith({
        code: createDevice.code,
      });
      expect(mockDeviceMapper.toDeviceEntity).toBeCalled();
    });

    it('should throw InvalidNotFoundException if model not found', async () => {
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
        });

      await expect(deviceService.createDevice(createDevice)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.findOneBy).toBeCalledWith({
        code: createDevice.code,
      });
      expect(mockDeviceMapper.toDeviceEntity).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(deviceService.createDevice(createDevice)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.findOneBy).toBeCalledWith({
        code: createDevice.code,
      });
      expect(mockDeviceMapper.toDeviceEntity).toBeCalled();
    });

    it('should throw InvalidNotFoundException if owner not found', async () => {
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_OWNER_NOT_FOUND);
        });

      await expect(deviceService.createDevice(createDevice)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.findOneBy).toBeCalledWith({
        code: createDevice.code,
      });
      expect(mockDeviceMapper.toDeviceEntity).toBeCalled();
    });
  });

  describe('updateDevice', () => {
    const deviceAssigneeHistoryEntity =
      DeviceFake.buildDeviceAssigneeHistoryEntity(deviceAssigneeHistory);
    const updateDevice = DeviceFake.buildUpdateDeviceDto();

    it('should update device without create new assign history', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntityToUpdate')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceRepository, 'save')
        .mockImplementation(() => Promise.resolve(deviceEntity));

      const result = await deviceService.updateDevice(device.id, updateDevice);

      expect(result).toEqual(device);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceMapper.toDeviceEntityToUpdate).toBeCalled();
      expect(deviceRepository.save).toBeCalled();
    });

    it('should update device & update assign history when return & create new assign history', async () => {
      const updateDeviceReturn = {
        ...DeviceFake.buildUpdateDeviceDto(),
        assigneeId: 2,
      };

      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntityToUpdate')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceRepository, 'save')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'createQueryBuilder')
        .mockImplementation(
          () =>
            ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(deviceAssigneeHistoryEntity),
            }) as never,
        );
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'save')
        .mockImplementation(() => Promise.resolve(deviceAssigneeHistoryEntity));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'countBy')
        .mockResolvedValueOnce(0);
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'createQueryBuilder')
        .mockImplementation(
          () =>
            ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(null),
            }) as never,
        );
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'save')
        .mockImplementation(() => Promise.resolve(deviceAssigneeHistoryEntity));

      const result = await deviceService.updateDevice(
        device.id,
        updateDeviceReturn,
      );

      expect(result).toEqual(device);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceMapper.toDeviceEntityToUpdate).toBeCalled();
      expect(deviceRepository.save).toBeCalled();
      expect(deviceAssigneeHistoryRepository.createQueryBuilder).toBeCalled();
      expect(deviceAssigneeHistoryRepository.save).toBeCalled();
      expect(deviceAssigneeHistoryRepository.countBy).toBeCalled();
      expect(deviceAssigneeHistoryRepository.createQueryBuilder).toBeCalled();
      expect(deviceAssigneeHistoryRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if device not found', async () => {
      jest.spyOn(deviceRepository, 'findOneBy').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.DEVICE_NOT_FOUND);
      });

      await expect(
        deviceService.updateDevice(device.id, updateDevice),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });

    it('should throw InvalidNotFoundException if device model not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(mockDeviceModelService, 'validateDeviceModel')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
        });

      await expect(
        deviceService.updateDevice(device.id, updateDevice),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
    });

    it('should throw InvalidBadRequestException if model not belong to type', async () => {
      const updateDeviceError = {
        ...DeviceFake.buildUpdateDeviceDto(),
        typeId: 2,
      };

      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest
        .spyOn(mockDeviceModelService, 'validateDeviceModel')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.DEVICE_MODEL_DOES_NOT_BELONG_TO_DEVICE_TYPE,
          );
        });

      await expect(
        deviceService.updateDevice(device.id, updateDeviceError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
    });

    it('should throw InvalidBadRequestException if update status scrapped with assignee', async () => {
      const updateDeviceError = {
        ...DeviceFake.buildUpdateDeviceDto(),
        status: DeviceStatus.SCRAPPED,
      };

      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');

      await expect(
        deviceService.updateDevice(device.id, updateDeviceError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
    });

    it('should throw InvalidNotFoundException if type not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_TYPE_NOT_FOUND);
        });

      await expect(
        deviceService.updateDevice(device.id, updateDevice),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceMapper.toDeviceEntityToUpdate).toBeCalled();
    });

    it('should throw InvalidNotFoundException if model not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
        });

      await expect(
        deviceService.updateDevice(device.id, updateDevice),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceMapper.toDeviceEntityToUpdate).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        deviceService.updateDevice(device.id, updateDevice),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceMapper.toDeviceEntityToUpdate).toBeCalled();
    });

    it('should throw InvalidNotFoundException if owner not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));
      jest.spyOn(mockDeviceModelService, 'validateDeviceModel');
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);
      jest
        .spyOn(mockDeviceMapper, 'toDeviceEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_OWNER_NOT_FOUND);
        });

      await expect(
        deviceService.updateDevice(device.id, updateDevice),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(mockDeviceModelService.validateDeviceModel).toBeCalled();
      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceMapper.toDeviceEntityToUpdate).toBeCalled();
    });
  });

  describe('deleteDevice', () => {
    const unassignedDevice = { ...deviceEntity, user: null } as DeviceEntity;

    it('should delete device', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(unassignedDevice));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'countBy')
        .mockResolvedValueOnce(0);
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getCount: jest.fn().mockResolvedValueOnce(0),
          }) as never,
      );
      jest.spyOn(deviceRepository, 'remove').mockImplementation(jest.fn());

      await deviceService.deleteDevice(device.id);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(deviceAssigneeHistoryRepository.countBy).toBeCalledWith({
        device: { id: deviceEntity.id },
      });
      expect(deviceRepository.createQueryBuilder).toBeCalled();
      expect(deviceRepository.remove).toBeCalled();
    });

    it('should throw InvalidNotFoundException if device not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(null));

      await expect(deviceService.deleteDevice(device.id)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });

    it('should throw InvalidBadRequestException if device has assignee', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(deviceEntity));

      await expect(deviceService.deleteDevice(device.id)).rejects.toThrow(
        InvalidBadRequestException,
      );

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });

    it('should throw InvalidBadRequestException if device has assign history', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(unassignedDevice));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'countBy')
        .mockResolvedValueOnce(1);

      await expect(deviceService.deleteDevice(device.id)).rejects.toThrow(
        InvalidBadRequestException,
      );

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(deviceAssigneeHistoryRepository.countBy).toBeCalledWith({
        device: { id: deviceEntity.id },
      });
    });

    it('should throw InvalidBadRequestException if device has repair history', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(unassignedDevice));
      jest
        .spyOn(deviceAssigneeHistoryRepository, 'countBy')
        .mockResolvedValueOnce(0);
      jest.spyOn(deviceRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getCount: jest.fn().mockResolvedValueOnce(1),
          }) as never,
      );

      await expect(deviceService.deleteDevice(device.id)).rejects.toThrow(
        InvalidBadRequestException,
      );

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
      expect(deviceAssigneeHistoryRepository.countBy).toBeCalledWith({
        device: { id: deviceEntity.id },
      });
      expect(deviceRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('findDeviceById', () => {
    it('should return device by id', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(deviceEntity));

      const result = await deviceService.findDeviceById(device.id);

      expect(result).toEqual(deviceEntity);

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });

    it('should throw InvalidNotFoundException if device not found', async () => {
      jest
        .spyOn(deviceRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));

      await expect(deviceService.findDeviceById(device.id)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(deviceRepository.findOneBy).toBeCalledWith({
        id: device.id,
      });
    });
  });

  describe('findDevicesByModelId', () => {
    it('should return devices by model id', async () => {
      const deviceEntities = [deviceEntity];

      jest
        .spyOn(deviceRepository, 'find')
        .mockImplementationOnce(() => Promise.resolve(deviceEntities));

      const result = await deviceService.findDevicesByModelId(device.model.id);

      expect(result).toEqual(deviceEntities);

      expect(deviceRepository.find).toBeCalledWith({
        where: {
          model: { id: device.model.id },
        },
      });
    });
  });
});
