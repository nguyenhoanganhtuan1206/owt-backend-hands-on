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
import { DeviceOwnerEntity } from '../../entities/device-owner.entity';
import DeviceOwnerMapper from '../../mappers/device-owner.mapper';
import { DeviceOwnerService } from '../../services/device-owner.service';
import { DeviceOwnerFake } from '../fakes/device-owner.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('DeviceOwnerService', () => {
  let deviceOwnerService: DeviceOwnerService;
  let deviceOwnerRepository: Repository<DeviceOwnerEntity>;

  const deviceOwnerDto = DeviceOwnerFake.buildDeviceOwnerDto();
  const deviceOwnerEntity =
    DeviceOwnerFake.buildDeviceOwnerEntity(deviceOwnerDto);

  const mockDeviceOwnerMapper = {
    toDeviceOwnerEntity: jest.fn(),
    toDeviceOwnerEntityFromId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceOwnerService,
        {
          provide: DeviceOwnerMapper,
          useValue: mockDeviceOwnerMapper,
        },
        {
          provide: getRepositoryToken(DeviceOwnerEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    deviceOwnerService = module.get<DeviceOwnerService>(DeviceOwnerService);
    deviceOwnerRepository = module.get<Repository<DeviceOwnerEntity>>(
      getRepositoryToken(DeviceOwnerEntity),
    );
  });

  describe('getAllDeviceOwners', () => {
    it('should return all device owners', async () => {
      const deviceOwners = [deviceOwnerEntity];

      jest
        .spyOn(deviceOwnerRepository, 'find')
        .mockResolvedValueOnce(deviceOwners);

      const result = await deviceOwnerService.getAllDeviceOwners();

      expect(result[0].id).toEqual(deviceOwners[0].id);
      expect(result[0].name).toEqual(deviceOwners[0].name);

      expect(deviceOwnerRepository.find).toBeCalled();
    });
  });

  describe('createDeviceOwner', () => {
    const createDeviceOwner = DeviceOwnerFake.buildCreateDeviceOwnerDto();

    it('should create new device owner', async () => {
      jest
        .spyOn(deviceOwnerRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceOwnerMapper, 'toDeviceOwnerEntity')
        .mockResolvedValueOnce(deviceOwnerEntity);
      jest
        .spyOn(deviceOwnerRepository, 'save')
        .mockResolvedValueOnce(deviceOwnerEntity);

      const result =
        await deviceOwnerService.createDeviceOwner(createDeviceOwner);

      expect(result.id).toEqual(deviceOwnerDto.id);
      expect(result.name).toEqual(deviceOwnerDto.name);

      expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceOwnerMapper.toDeviceOwnerEntity).toBeCalled();
      expect(deviceOwnerRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if owner existed', async () => {
      jest
        .spyOn(deviceOwnerRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(deviceOwnerEntity),
        } as never);

      await expect(
        deviceOwnerService.createDeviceOwner(createDeviceOwner),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('updateDeviceOwner', () => {
    const updateDeviceOwner = DeviceOwnerFake.buildUpdateDeviceOwnerDto();

    it('should update device owner', async () => {
      jest
        .spyOn(deviceOwnerRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceOwnerMapper, 'toDeviceOwnerEntityFromId')
        .mockResolvedValueOnce(deviceOwnerEntity);
      jest
        .spyOn(deviceOwnerRepository, 'save')
        .mockResolvedValueOnce(deviceOwnerEntity);

      const result = await deviceOwnerService.updateDeviceOwner(
        deviceOwnerDto.id,
        updateDeviceOwner,
      );

      expect(result.id).toEqual(deviceOwnerDto.id);
      expect(result.name).toEqual(deviceOwnerDto.name);

      expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceOwnerMapper.toDeviceOwnerEntityFromId).toBeCalled();
      expect(deviceOwnerRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if owner existed', async () => {
      jest
        .spyOn(deviceOwnerRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(deviceOwnerEntity),
        } as never);

      await expect(
        deviceOwnerService.updateDeviceOwner(
          deviceOwnerDto.id,
          updateDeviceOwner,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if owner not found', async () => {
      jest
        .spyOn(deviceOwnerRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        } as never);
      jest
        .spyOn(mockDeviceOwnerMapper, 'toDeviceOwnerEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.DEVICE_OWNER_NOT_FOUND);
        });

      await expect(
        deviceOwnerService.updateDeviceOwner(
          deviceOwnerDto.id,
          updateDeviceOwner,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
      expect(mockDeviceOwnerMapper.toDeviceOwnerEntityFromId).toBeCalled();
    });

    describe('deleteDeviceOwner', () => {
      it('should delete device owner', async () => {
        jest
          .spyOn(deviceOwnerRepository, 'createQueryBuilder')
          .mockImplementation(
            () =>
              ({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValueOnce(0),
              }) as never,
          );
        jest
          .spyOn(mockDeviceOwnerMapper, 'toDeviceOwnerEntityFromId')
          .mockResolvedValueOnce(deviceOwnerEntity);
        jest
          .spyOn(deviceOwnerRepository, 'remove')
          .mockImplementation(jest.fn());

        await deviceOwnerService.deleteDeviceOwner(deviceOwnerDto.id);

        expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
        expect(mockDeviceOwnerMapper.toDeviceOwnerEntityFromId).toBeCalled();
        expect(deviceOwnerRepository.remove).toBeCalled();
      });

      it('should throw InvalidBadRequestException if owner has assigned for device', async () => {
        jest
          .spyOn(deviceOwnerRepository, 'createQueryBuilder')
          .mockImplementation(
            () =>
              ({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValueOnce(1),
              }) as never,
          );

        await expect(
          deviceOwnerService.deleteDeviceOwner(deviceOwnerDto.id),
        ).rejects.toThrow(InvalidBadRequestException);

        expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
      });

      it('should throw InvalidNotFoundException if owner not found', async () => {
        jest
          .spyOn(deviceOwnerRepository, 'createQueryBuilder')
          .mockImplementation(
            () =>
              ({
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValueOnce(0),
              }) as never,
          );
        jest
          .spyOn(mockDeviceOwnerMapper, 'toDeviceOwnerEntityFromId')
          .mockImplementationOnce(() => {
            throw new InvalidNotFoundException(
              ErrorCode.DEVICE_OWNER_NOT_FOUND,
            );
          });

        await expect(
          deviceOwnerService.deleteDeviceOwner(deviceOwnerDto.id),
        ).rejects.toThrow(InvalidNotFoundException);

        expect(deviceOwnerRepository.createQueryBuilder).toBeCalled();
        expect(mockDeviceOwnerMapper.toDeviceOwnerEntityFromId).toBeCalled();
      });
    });
  });
});
