/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvalidNotFoundException } from '../../../../exceptions';
import { DeviceEntity } from '../../../device/entities/device.entity';
import { RepairRequestEntity } from '../../entities/repair-request.entity';
import RepairRequestMapper from '../../mappers/repair-request.mapper';
import { RepairRequestService } from '../../services/repair-request.service';
import { RepairRequestFake } from '../fakes/repair-request.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('RepairRequestService', () => {
  let repairRequestService: RepairRequestService;
  let repairRequestRepository: Repository<RepairRequestEntity>;

  const repairRequest = RepairRequestFake.buildRepairRequestDto();
  const repairRequestEntity =
    RepairRequestFake.buildRepairRequestEntity(repairRequest);
  const repairRequestEntities = [repairRequestEntity];
  const updateRepairRequest =
    RepairRequestFake.buildUpdateRepairRequestStatusDto();
  const pageOptions = RepairRequestFake.buildRepairRequestPageOptionsDto();
  const repairRequestDtosPageDto =
    RepairRequestFake.buildRepairRequestDtosPageDto();

  const mockRepairRequestMapper = {
    toRepairRequestEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairRequestService,
        {
          provide: RepairRequestMapper,
          useValue: mockRepairRequestMapper,
        },
        {
          provide: getRepositoryToken(RepairRequestEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeviceEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    repairRequestService =
      module.get<RepairRequestService>(RepairRequestService);

    repairRequestRepository = module.get<Repository<RepairRequestEntity>>(
      getRepositoryToken(RepairRequestEntity),
    );
  });

  describe('getAllRepairRequests', () => {
    it('should be return repair requests', async () => {
      jest
        .spyOn(repairRequestRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          paginate: jest
            .fn()
            .mockReturnValueOnce([
              repairRequestEntities,
              repairRequestDtosPageDto.meta,
            ]),
        } as never);
      jest
        .spyOn(repairRequestEntities, 'toPageDto')
        .mockReturnValueOnce(repairRequestDtosPageDto);

      const result =
        await repairRequestService.getAllRepairRequests(pageOptions);

      expect(result).toEqual(repairRequestDtosPageDto);

      expect(repairRequestRepository.createQueryBuilder).toBeCalled();
      expect(repairRequestEntities.toPageDto).toBeCalled();
    });
  });

  describe('getRepairRequestDetails', () => {
    it('should return details of a repair request by id', async () => {
      jest
        .spyOn(repairRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(repairRequestEntity);

      const result = await repairRequestService.getRepairRequestDetails(
        repairRequest.id,
      );

      expect(result).toEqual(repairRequest);

      expect(repairRequestRepository.findOneBy).toBeCalledWith({
        id: repairRequestEntity.id,
      });
    });

    it('should throw InvalidBadRequestException if repair request not found', async () => {
      jest
        .spyOn(repairRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        repairRequestService.getRepairRequestDetails(repairRequestEntity.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(repairRequestRepository.findOneBy).toBeCalledWith({
        id: repairRequestEntity.id,
      });
    });
  });

  describe('getPendingRequests', () => {
    it('should return information about pending repair requests', async () => {
      jest
        .spyOn(repairRequestRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockReturnThis(),
        } as never);

      const result = await repairRequestService.getPendingRequests();

      expect(result).toBeTruthy();
      expect(repairRequestRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('approveRepairRequest', () => {
    it('should approve a repair request', async () => {
      jest
        .spyOn(repairRequestRepository, 'findOneBy')
        .mockResolvedValue(repairRequestEntity);
      jest
        .spyOn(repairRequestRepository, 'save')
        .mockResolvedValue(repairRequestEntity);

      const result = await repairRequestService.approveRepairRequest(
        repairRequest.id,
        updateRepairRequest,
      );

      expect(result).toEqual(repairRequest);

      expect(repairRequestRepository.findOneBy).toBeCalledWith({
        id: repairRequest.id,
      });
      expect(repairRequestRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if repair request not found', async () => {
      jest.spyOn(repairRequestRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        repairRequestService.approveRepairRequest(
          repairRequest.id,
          updateRepairRequest,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(repairRequestRepository.findOneBy).toBeCalledWith({
        id: repairRequest.id,
      });
    });
  });

  describe('refuseRepairRequest', () => {
    it('should refuse a repair request', async () => {
      jest
        .spyOn(repairRequestRepository, 'findOneBy')
        .mockResolvedValue(repairRequestEntity);
      jest
        .spyOn(repairRequestRepository, 'save')
        .mockResolvedValue(repairRequestEntity);

      const result = await repairRequestService.refuseRepairRequest(
        repairRequest.id,
        updateRepairRequest,
      );

      expect(result).toEqual(repairRequest);

      expect(repairRequestRepository.findOneBy).toBeCalledWith({
        id: repairRequest.id,
      });
      expect(repairRequestRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if repair request not found', async () => {
      jest.spyOn(repairRequestRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        repairRequestService.refuseRepairRequest(
          repairRequest.id,
          updateRepairRequest,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(repairRequestRepository.findOneBy).toBeCalledWith({
        id: repairRequest.id,
      });
    });
  });
});
