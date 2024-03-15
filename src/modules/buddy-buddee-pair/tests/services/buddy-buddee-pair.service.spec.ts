/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { DeepPartial } from 'typeorm';
import { Repository } from 'typeorm';

import { TouchpointStatus } from '../../../../constants/touchpoint-status';
import { BuddyService } from '../../../buddy/services/buddy.service';
import { BuddyFake } from '../../../buddy/tests/fakes/buddy.fake';
import { BuddyBuddeeTouchpointService } from '../../../buddy-buddee-touchpoint/services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../../../buddy-buddee-touchpoint/tests/fakes/buddy-buddee-touchpoint.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { BuddyBuddeePairEntity } from '../../entities/buddy-buddee-pair.entity';
import BuddyBuddeePairMapper from '../../mappers/buddy-buddee-pair.mapper';
import { BuddyBuddeePairService } from '../../services/buddy-buddee-pair.service';
import { BuddyBuddeePairFake } from '../fakes/buddy-budee-pair.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('BuddyBuddeePairService', () => {
  let buddyBuddeePairService: BuddyBuddeePairService;
  let buddyPairRepository: Repository<BuddyBuddeePairEntity>;

  const buddyDto = BuddyFake.buildBuddyDto();
  const buddyEntity = BuddyFake.buildBuddyEntity(buddyDto);
  const userDto = UserFake.buildUserDto();
  const buddy = UserFake.buildUserEntity(userDto);
  const buddee = UserFake.buildUserEntity(
    UserFake.buildUserDtoBy(2, 'buddee@gmail.com'),
  );
  const buddyBuddeePairEntity = BuddyBuddeePairFake.buildBuddyBuddeePairEntity(
    buddy,
    buddee,
  );
  const buddyBuddeePairEntities = [buddyBuddeePairEntity];
  const buddyBuddeeTouchpointEntity =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointEntity(
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
        buddy,
        buddee,
        TouchpointStatus.SUBMITTED,
      ),
    );
  const buddyBuddeeTouchpointEntities = [buddyBuddeeTouchpointEntity];

  const mockBuddyService = {
    createBuddyQueryBuilder: jest.fn(),
    validateBuddyByUserId: jest.fn(),
  };

  const mockBuddyBuddeeTouchpointService = {
    getAllTouchpoints: jest.fn(),
    saveTouchpoints: jest.fn(),
  };

  const mockBuddyBuddeePairMapper = {
    toBuddyBuddeePairEntities: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuddyBuddeePairService,
        {
          provide: BuddyService,
          useValue: mockBuddyService,
        },
        {
          provide: BuddyBuddeeTouchpointService,
          useValue: mockBuddyBuddeeTouchpointService,
        },
        {
          provide: BuddyBuddeePairMapper,
          useValue: mockBuddyBuddeePairMapper,
        },
        {
          provide: getRepositoryToken(BuddyBuddeePairEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    buddyBuddeePairService = module.get<BuddyBuddeePairService>(
      BuddyBuddeePairService,
    );
    buddyPairRepository = module.get<Repository<BuddyBuddeePairEntity>>(
      getRepositoryToken(BuddyBuddeePairEntity),
    );

    jest.clearAllMocks();
  });

  describe('getBuddyPairs', () => {
    const buddyBuddeePairDtosPageDto =
      BuddyBuddeePairFake.buildBuddyBuddeePairDtosPageDto(buddy, buddee);
    const pageOptionsDto = BuddyFake.buildBuddyPageOptionsDto();
    const buddyEntities = [buddyEntity];

    it('should return list buddies', async () => {
      jest
        .spyOn(mockBuddyService, 'createBuddyQueryBuilder')
        .mockReturnValueOnce({
          paginate: jest
            .fn()
            .mockResolvedValueOnce([
              buddyEntities,
              buddyBuddeePairDtosPageDto.meta,
            ]),
        } as never);
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest
            .fn()
            .mockImplementation(() => Promise.resolve(buddyBuddeePairEntities)),
        } as never);
      jest
        .spyOn(buddyBuddeePairEntities, 'toPageDto')
        .mockReturnValueOnce(buddyBuddeePairDtosPageDto);

      const result = await buddyBuddeePairService.getBuddyPairs(pageOptionsDto);

      expect(result.data[0].id).toEqual(buddyBuddeePairDtosPageDto.data[0].id);
      expect(result.data[0].buddy.id).toEqual(
        buddyBuddeePairDtosPageDto.data[0].buddy.id,
      );
      expect(result.data[0].buddee?.id).toEqual(
        buddyBuddeePairDtosPageDto.data[0].buddee?.id,
      );

      expect(mockBuddyService.createBuddyQueryBuilder).toBeCalled();
      expect(buddyPairRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('createBuddyPairs', () => {
    const createBuddyBuddeesPairRequestDto =
      BuddyBuddeePairFake.buildCreateBuddyBuddeesPairRequestDto();

    it('should create pairs of buddy and buddees', async () => {
      jest.spyOn(mockBuddyService, 'validateBuddyByUserId');
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(null),
        } as never);
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(null),
        } as never);
      jest
        .spyOn(mockBuddyBuddeePairMapper, 'toBuddyBuddeePairEntities')
        .mockResolvedValueOnce(buddyBuddeePairEntities);
      const mockBuddyBuddeePairEntity = jest.fn();
      mockBuddyBuddeePairEntity.mockReturnValue([
        buddyBuddeePairEntity,
      ] as DeepPartial<BuddyBuddeePairEntity>);

      jest
        .spyOn(buddyPairRepository, 'save')
        .mockImplementation(mockBuddyBuddeePairEntity);
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'getAllTouchpoints')
        .mockReturnValueOnce(Promise.resolve(buddyBuddeeTouchpointEntities));
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'saveTouchpoints')
        .mockResolvedValueOnce(buddyBuddeeTouchpointEntities[0]);

      const result = await buddyBuddeePairService.createBuddyPairs(
        createBuddyBuddeesPairRequestDto,
      );

      expect(result[0].id).toEqual(buddyBuddeePairEntities[0].id);
      expect(result[0].buddy.id).toEqual(buddyBuddeePairEntities[0].buddy.id);
      expect(result[0].buddee?.id).toEqual(
        buddyBuddeePairEntities[0].buddee.id,
      );

      expect(mockBuddyService.validateBuddyByUserId).toBeCalled();
      expect(buddyPairRepository.createQueryBuilder).toBeCalledTimes(2);
      expect(mockBuddyBuddeePairMapper.toBuddyBuddeePairEntities).toBeCalled();
      expect(buddyPairRepository.save).toBeCalled();
      expect(mockBuddyBuddeeTouchpointService.getAllTouchpoints).toBeCalled();
      expect(mockBuddyBuddeeTouchpointService.saveTouchpoints).toBeCalled();
    });

    it('should throw NotFoundException if buddy cannot be found', async () => {
      jest
        .spyOn(mockBuddyService, 'validateBuddyByUserId')
        .mockImplementationOnce(() => {
          throw new NotFoundException();
        });

      await expect(
        buddyBuddeePairService.createBuddyPairs(
          createBuddyBuddeesPairRequestDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockBuddyService.validateBuddyByUserId).toBeCalled();
    });

    it('should throw BadRequestException if pairing buddy and buddee with the same id', async () => {
      const createBuddyBuddeesPairError = {
        ...BuddyBuddeePairFake.buildCreateBuddyBuddeesPairRequestDto(),
        buddeeIds: [1, 2],
      };
      jest.spyOn(mockBuddyService, 'validateBuddyByUserId');

      await expect(
        buddyBuddeePairService.createBuddyPairs(createBuddyBuddeesPairError),
      ).rejects.toThrow(BadRequestException);

      expect(mockBuddyService.validateBuddyByUserId).toBeCalled();
    });

    it('should throw ConflictException if at least one pair of buddy and buddee already exists', async () => {
      jest.spyOn(mockBuddyService, 'validateBuddyByUserId');
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(buddyBuddeePairEntity),
        } as never);

      await expect(
        buddyBuddeePairService.createBuddyPairs(
          createBuddyBuddeesPairRequestDto,
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockBuddyService.validateBuddyByUserId).toBeCalled();
      expect(buddyPairRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw ConflictException if at least one buddee already paired with another buddy', async () => {
      jest.spyOn(mockBuddyService, 'validateBuddyByUserId');
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(null),
        } as never);
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(buddyBuddeePairEntity),
        } as never);

      await expect(
        buddyBuddeePairService.createBuddyPairs(
          createBuddyBuddeesPairRequestDto,
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockBuddyService.validateBuddyByUserId).toBeCalled();
      expect(buddyPairRepository.createQueryBuilder).toBeCalledTimes(2);
    });

    it('should throw BadRequestException if Buddee not found', async () => {
      jest.spyOn(mockBuddyService, 'validateBuddyByUserId');
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(null),
        } as never);
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(null),
        } as never);
      jest
        .spyOn(mockBuddyBuddeePairMapper, 'toBuddyBuddeePairEntities')
        .mockImplementationOnce(() => {
          throw new BadRequestException();
        });

      await expect(
        buddyBuddeePairService.createBuddyPairs(
          createBuddyBuddeesPairRequestDto,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockBuddyService.validateBuddyByUserId).toBeCalled();
      expect(buddyPairRepository.createQueryBuilder).toBeCalledTimes(2);
      expect(mockBuddyBuddeePairMapper.toBuddyBuddeePairEntities).toBeCalled();
    });
  });

  describe('deleteBuddyPair', () => {
    it('should delete a pair of buddy and buddee by id', async () => {
      jest
        .spyOn(buddyPairRepository, 'findOneBy')
        .mockResolvedValueOnce(buddyBuddeePairEntity);
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'getAllTouchpoints')
        .mockReturnValueOnce(Promise.resolve(buddyBuddeeTouchpointEntities));
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'saveTouchpoints')
        .mockResolvedValueOnce(buddyBuddeeTouchpointEntity);
      jest.spyOn(buddyPairRepository, 'remove').mockImplementation(jest.fn());

      await buddyBuddeePairService.deleteBuddyPair(buddyBuddeePairEntity.id);

      expect(buddyPairRepository.findOneBy).toBeCalledWith({
        id: buddyBuddeePairEntity.id,
      });
      expect(mockBuddyBuddeeTouchpointService.getAllTouchpoints).toBeCalled();
      expect(mockBuddyBuddeeTouchpointService.saveTouchpoints).toBeCalled();
      expect(buddyPairRepository.remove).toBeCalled();
    });

    it('should throw NotFoundException if buddy pair cannot be found', async () => {
      jest.spyOn(buddyPairRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(
        buddyBuddeePairService.deleteBuddyPair(buddyBuddeePairEntity.id),
      ).rejects.toThrow(NotFoundException);

      expect(buddyPairRepository.findOneBy).toBeCalledWith({
        id: buddyBuddeePairEntity.id,
      });
    });
  });

  describe('getAllBuddyPairs', () => {
    it('should return all pairs of buddy', async () => {
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockReturnValue(buddyBuddeePairEntities),
        } as never);

      const result = await buddyBuddeePairService.getAllBuddyPairs();

      expect(result).toEqual(buddyBuddeePairEntities);

      expect(buddyPairRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('getAllBuddeePairs', () => {
    it('should return all pairs of buddee', async () => {
      jest
        .spyOn(buddyPairRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockReturnValue(buddyBuddeePairEntities),
        } as never);

      const result = await buddyBuddeePairService.getAllBuddeePairs();

      expect(result).toEqual(buddyBuddeePairEntities);

      expect(buddyPairRepository.createQueryBuilder).toBeCalled();
    });
  });
});
