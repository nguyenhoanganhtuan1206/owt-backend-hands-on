/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TouchpointStatus } from '../../../../constants/touchpoint-status';
import { BuddyService } from '../../../buddy/services/buddy.service';
import { BuddyFake } from '../../../buddy/tests/fakes/buddy.fake';
import type { BuddyBuddeePairEntity } from '../../../buddy-buddee-pair/entities/buddy-buddee-pair.entity';
import { BuddyBuddeePairService } from '../../../buddy-buddee-pair/services/buddy-buddee-pair.service';
import { BuddyBuddeePairFake } from '../../../buddy-buddee-pair/tests/fakes/buddy-budee-pair.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { BuddyBuddeeTouchpointEntity } from '../../entities/buddy-buddee-touchpoint.entity';
import BuddyBuddeeTouchpointMapper from '../../mappers/buddy-buddee-touchpoint.mapper';
import { BuddyBuddeeTouchpointService } from '../../services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../fakes/buddy-buddee-touchpoint.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('BuddyBuddeeTouchpointService', () => {
  let buddyBuddeeTouchpointSevice: BuddyBuddeeTouchpointService;
  let buddyBuddeeTouchpointRepository: Repository<BuddyBuddeeTouchpointEntity>;

  const userDto = UserFake.buildUserDto();
  const buddy = UserFake.buildUserEntity(userDto);
  const buddee = UserFake.buildUserEntity(
    UserFake.buildUserDtoBy(2, 'buddee@gmail.com'),
  );
  const buddyPageOptions = BuddyBuddeePairFake.buildBuddiesPageOptionsDto();
  const buddeeTouchpointDtoPageDto =
    BuddyBuddeeTouchpointFake.buildBuddiesPageDto();
  const buddyBuddeeTouchpointDto =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto();
  const buddyEntity = BuddyFake.buildBuddyEntityByUserDto(userDto);
  const buddyBuddeePairEntity = BuddyBuddeePairFake.buildBuddyBuddeePairEntity(
    buddy,
    buddee,
  );
  const buddyBuddeeTouchpointPageOptionsDto =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
  const buddyBuddeePairEntities = [buddyBuddeePairEntity];
  const buddyBuddeeTouchpointEntity =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointEntity(
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
        buddy,
        buddee,
        TouchpointStatus.SUBMITTED,
      ),
    );

  const buildBuddyBuddeeTouchpointEntity =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointEntity();
  const buddyBuddeeTouchpointEntities = [buddyBuddeeTouchpointEntity];
  const createBuddyBuddeeTouchpointRequestDto =
    BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto();
  const buddyBuddeeTouchpointDtoEmptyPage =
    BuddyBuddeeTouchpointFake.buildBuddiesPageDto(true);
  const myBuddyBuddeePairEntity =
    BuddyBuddeePairFake.buildBuddyBuddeePairEntity(buddy, buddee);

  const mockBuddyTouchpointMapper = {
    toBuddyBuddeeTouchpointEntity: jest.fn(),
    toDraftBuddyBuddeeTouchpointEntity: jest.fn(),
  };

  const mockBuddyService = {
    toBuddyEntityFromUserId: jest.fn(),
    createBuddyQueryBuilder: jest.fn(),
  };

  const mockBuddyBuddeePairService = {
    getBuddyBuddeePairs: jest.fn(),
    createBuddyBuddeePairQueryBuilder: jest.fn(),
    findBuddyBuddeePairById: jest.fn(),
    getBuddeePair: jest.fn(),
    validateBuddyBuddeePair: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuddyBuddeeTouchpointService,
        {
          provide: getRepositoryToken(BuddyBuddeeTouchpointEntity),
          useClass: Repository,
        },
        {
          provide: BuddyService,
          useValue: mockBuddyService,
        },
        {
          provide: BuddyBuddeePairService,
          useValue: mockBuddyBuddeePairService,
        },
        {
          provide: BuddyBuddeeTouchpointMapper,
          useValue: mockBuddyTouchpointMapper,
        },
      ],
    }).compile();

    buddyBuddeeTouchpointSevice = module.get<BuddyBuddeeTouchpointService>(
      BuddyBuddeeTouchpointService,
    );

    buddyBuddeeTouchpointRepository = module.get<
      Repository<BuddyBuddeeTouchpointEntity>
    >(getRepositoryToken(BuddyBuddeeTouchpointEntity));
  });

  describe('getTouchpointsByBuddyIdAndBuddeeId', () => {
    it('should return touch-points of a buddee in case there ARE touch-points by buddy and buddee ', async () => {
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    buddyBuddeeTouchpointEntities,
                    buddeeTouchpointDtoPageDto.meta,
                  ]),
                ),
            }) as never,
        );

      jest
        .spyOn(buddyBuddeeTouchpointEntities, 'toPageDto')
        .mockReturnValueOnce(buddeeTouchpointDtoPageDto);

      const result =
        await buddyBuddeeTouchpointSevice.getTouchpointsByBuddyIdAndBuddeeId(
          buddy.id,
          buddee.id,
          buddyBuddeeTouchpointPageOptionsDto,
        );

      expect(result).toEqual(buddeeTouchpointDtoPageDto);
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(buddyBuddeeTouchpointEntities.toPageDto).toBeCalled();
    });

    // eslint-disable-next-line max-len
    it('should return touch-points of a buddee in case there ARE NOT touch-points by buddy and buddee, also there ARE NOT buddee pair as well', async () => {
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    [] as BuddyBuddeeTouchpointEntity[],
                    buddeeTouchpointDtoPageDto.meta,
                  ]),
                ),
            }) as never,
        );

      jest
        .spyOn([], 'toPageDto')
        .mockReturnValueOnce(buddyBuddeeTouchpointDtoEmptyPage);

      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddeePair')
        .mockReturnValue(null);

      const result =
        await buddyBuddeeTouchpointSevice.getTouchpointsByBuddyIdAndBuddeeId(
          buddy.id,
          buddee.id,
          buddyBuddeeTouchpointPageOptionsDto,
        );

      expect(result).toEqual(buddyBuddeeTouchpointDtoEmptyPage);
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(mockBuddyBuddeePairService.getBuddeePair).toBeCalled();
    });

    it('should return touch-points of a buddy in case there ARE NOT touch-point by buddee and there ARE buddee pair', async () => {
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    [] as BuddyBuddeeTouchpointEntity[],
                    buddeeTouchpointDtoPageDto.meta,
                  ]),
                ),
            }) as never,
        );

      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddeePair')
        .mockReturnValueOnce(myBuddyBuddeePairEntity);

      const buddeeTouchpointDto = new BuddyBuddeeTouchpointEntity();
      buddeeTouchpointDto.buddy = myBuddyBuddeePairEntity.buddy;
      buddeeTouchpointDto.buddee = myBuddyBuddeePairEntity.buddee;

      const resultPage =
        BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDtoPageByTouchpointHasFiterNote(
          buddeeTouchpointDto,
        );

      const result =
        await buddyBuddeeTouchpointSevice.getTouchpointsByBuddyIdAndBuddeeId(
          buddy.id,
          buddee.id,
          buddyBuddeeTouchpointPageOptionsDto,
        );

      expect(result).toEqual(resultPage);
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(mockBuddyBuddeePairService.getBuddeePair).toBeCalled();
    });
  });

  describe('getTouchpointsByPairId', () => {
    const pageOptions =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
    const resultPage =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDtoPageByTouchpoint(
        buddyBuddeeTouchpointEntity,
      );

    it('should return touch-points of a pair', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'findBuddyBuddeePairById')
        .mockResolvedValueOnce(buddyBuddeePairEntity);
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          paginate: jest
            .fn()
            .mockResolvedValueOnce([
              buddyBuddeeTouchpointEntities,
              resultPage.meta,
            ]),
        } as never);
      jest
        .spyOn(buddyBuddeeTouchpointEntities, 'toPageDto')
        .mockReturnValue(resultPage);

      const result = await buddyBuddeeTouchpointSevice.getTouchpointsByPairId(
        buddyBuddeeTouchpointEntity.id,
        pageOptions,
      );

      expect(result.data[0].id).toEqual(resultPage.data[0].id);
      expect(result.data[0].buddy).toEqual(resultPage.data[0].buddy);
      expect(result.data[0].buddee).toEqual(resultPage.data[0].buddee);
      expect(result.data[0].note).toEqual(resultPage.data[0].note);

      expect(mockBuddyBuddeePairService.findBuddyBuddeePairById).toBeCalled();
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(buddyBuddeeTouchpointEntities.toPageDto).toBeCalled();
    });

    it('should throw NotFoundException if pair of buddy and buddee cannot be found', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'findBuddyBuddeePairById')
        .mockImplementationOnce(() => {
          throw new NotFoundException();
        });

      await expect(
        buddyBuddeeTouchpointSevice.getTouchpointsByPairId(
          buddyBuddeeTouchpointEntity.id,
          pageOptions,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockBuddyBuddeePairService.findBuddyBuddeePairById).toBeCalled();
    });
  });

  describe('getBuddyPairTouchpoints', () => {
    const pageOptions =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
    const resultPage =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDtoPageByTouchpoint(
        buddyBuddeeTouchpointEntity,
      );
    const buddyPairEntity = BuddyFake.buildBuddyEntity(
      BuddyFake.buildBuddyDto(),
    );
    const buddyPairEntities = [buddyPairEntity];

    it('should return latest touchpoint of buddy and buddee pair', async () => {
      jest
        .spyOn(mockBuddyService, 'createBuddyQueryBuilder')
        .mockReturnValueOnce({
          paginate: jest
            .fn()
            .mockResolvedValueOnce([buddyPairEntities, resultPage.meta]),
        } as never);
      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddyBuddeePairs')
        .mockReturnValueOnce(buddyBuddeePairEntities);
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve(buddyBuddeeTouchpointEntities),
            ),
        } as never);
      jest
        .spyOn(buddyBuddeeTouchpointEntities, 'toPageDto')
        .mockReturnValue(resultPage);

      const result =
        await buddyBuddeeTouchpointSevice.getBuddyPairTouchpoints(pageOptions);

      expect(result.data[0].id).toEqual(resultPage.data[0].id);
      expect(result.data[0].buddy).toEqual(resultPage.data[0].buddy);
      expect(result.data[0].buddee).toEqual(resultPage.data[0].buddee);
      expect(result.data[0].note).toEqual(resultPage.data[0].note);

      expect(mockBuddyService.createBuddyQueryBuilder).toBeCalled();
      expect(mockBuddyBuddeePairService.getBuddeePair).toBeCalled();
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(buddyBuddeeTouchpointEntities.toPageDto).toBeCalled();
    });
  });

  describe('getMyBuddees', () => {
    it('should return my buddees and latest touch-point in case there are not buddy by userId', async () => {
      jest
        .spyOn(mockBuddyService, 'toBuddyEntityFromUserId')
        .mockImplementationOnce(() => null);
      jest
        .spyOn([], 'toPageDto')
        .mockReturnValueOnce(buddyBuddeeTouchpointDtoEmptyPage);

      const result = await buddyBuddeeTouchpointSevice.getMyBuddees(
        buddy.id,
        buddyPageOptions,
      );

      expect(result).toEqual(buddyBuddeeTouchpointDtoEmptyPage);
    });

    it('should return my buddees and latest touch-point in case there are not buddy pair', async () => {
      jest
        .spyOn(mockBuddyService, 'toBuddyEntityFromUserId')
        .mockImplementationOnce(() => Promise.resolve(buddyEntity));

      jest
        .spyOn(mockBuddyBuddeePairService, 'createBuddyBuddeePairQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([[] as BuddyBuddeePairEntity[]]),
                ),
            }) as never,
        );

      const result = await buddyBuddeeTouchpointSevice.getMyBuddees(
        buddy.id,
        buddyPageOptions,
      );

      expect(result).toEqual(buddyBuddeeTouchpointDtoEmptyPage);
      expect(mockBuddyService.toBuddyEntityFromUserId).toBeCalled();
      expect(
        mockBuddyBuddeePairService.createBuddyBuddeePairQueryBuilder,
      ).toBeCalled();
    });

    it('should return my buddees and latest touch-point in case full data', async () => {
      const myBuddyEntity = BuddyFake.buildBuddyEntityByUserEntity(
        UserFake.buildUserEntity(userDto),
      );
      const buddyBuddeePairDtos =
        BuddyBuddeePairFake.buildBuddyBuddeePairDtosPageDto(buddy, buddee);

      jest
        .spyOn(mockBuddyService, 'toBuddyEntityFromUserId')
        .mockImplementationOnce(() => Promise.resolve(myBuddyEntity));

      jest
        .spyOn(mockBuddyBuddeePairService, 'createBuddyBuddeePairQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    buddyBuddeePairEntities,
                    buddyBuddeePairDtos.meta,
                  ]),
                ),
            }) as never,
        );

      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve(buddyBuddeeTouchpointEntities),
                ),
            }) as never,
        );

      const touchpoint =
        BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointEntityBy(
          myBuddyEntity,
          buddyBuddeePairEntity,
          buddyBuddeeTouchpointEntity,
        );

      const resultPage =
        BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDtoPageByTouchpoint(
          touchpoint,
        );

      const result = await buddyBuddeeTouchpointSevice.getMyBuddees(
        userDto.id,
        BuddyBuddeePairFake.buildBuddiesPageOptionsDto(false),
      );

      expect(result).toEqual(resultPage);
      expect(mockBuddyService.toBuddyEntityFromUserId).toBeCalled();
      expect(
        mockBuddyBuddeePairService.createBuddyBuddeePairQueryBuilder,
      ).toBeCalled();
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('createBuddyBuddeeTouchpoint', () => {
    it('should throw NotFoundException if buddy pair not found', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'validateBuddyBuddeePair')
        .mockImplementation(() => {
          throw new NotFoundException();
        });

      await expect(
        buddyBuddeeTouchpointSevice.createBuddyBuddeeTouchpoint(
          createBuddyBuddeeTouchpointRequestDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockBuddyBuddeePairService.validateBuddyBuddeePair).toBeCalled();
    });

    it('should create touch-point of buddy and buddee', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'validateBuddyBuddeePair')
        .mockResolvedValueOnce(buddyBuddeeTouchpointDto);

      jest
        .spyOn(mockBuddyTouchpointMapper, 'toBuddyBuddeeTouchpointEntity')
        .mockImplementationOnce(() =>
          Promise.resolve(buddyBuddeeTouchpointDto),
        );

      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'save')
        .mockImplementation(() =>
          Promise.resolve(buildBuddyBuddeeTouchpointEntity),
        );

      const result =
        await buddyBuddeeTouchpointSevice.createBuddyBuddeeTouchpoint(
          createBuddyBuddeeTouchpointRequestDto,
        );

      expect(result).toEqual(buddyBuddeeTouchpointDto);
      expect(mockBuddyBuddeePairService.validateBuddyBuddeePair).toBeCalled();
      expect(
        mockBuddyTouchpointMapper.toBuddyBuddeeTouchpointEntity,
      ).toBeCalled();
      expect(buddyBuddeeTouchpointRepository.save).toBeCalled();
    });
  });

  describe('createDraftBuddyBuddeeTouchpoint', () => {
    it('should throw NotFoundException if buddy pair not found', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'validateBuddyBuddeePair')
        .mockImplementation(() => {
          throw new NotFoundException();
        });

      await expect(
        buddyBuddeeTouchpointSevice.createDraftBuddyBuddeeTouchpoint(
          createBuddyBuddeeTouchpointRequestDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockBuddyBuddeePairService.validateBuddyBuddeePair).toBeCalled();
    });

    it('should create draft touch-point of buddy and buddee', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'validateBuddyBuddeePair')
        .mockResolvedValueOnce(buddyBuddeeTouchpointDto);

      jest
        .spyOn(mockBuddyTouchpointMapper, 'toBuddyBuddeeTouchpointEntity')
        .mockImplementationOnce(() =>
          Promise.resolve(buddyBuddeeTouchpointDto),
        );

      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'save')
        .mockImplementation(() =>
          Promise.resolve(buildBuddyBuddeeTouchpointEntity),
        );

      const result =
        await buddyBuddeeTouchpointSevice.createDraftBuddyBuddeeTouchpoint(
          createBuddyBuddeeTouchpointRequestDto,
        );

      expect(result).toEqual(buddyBuddeeTouchpointDto);
      expect(mockBuddyBuddeePairService.validateBuddyBuddeePair).toBeCalled();
      expect(
        mockBuddyTouchpointMapper.toBuddyBuddeeTouchpointEntity,
      ).toBeCalled();
      expect(buddyBuddeeTouchpointRepository.save).toBeCalled();
    });
  });

  describe('updateDraftBuddyBuddeeTouchpoint', () => {
    it('should update draft touch-point of buddy and buddee', async () => {
      jest
        .spyOn(mockBuddyTouchpointMapper, 'toDraftBuddyBuddeeTouchpointEntity')
        .mockImplementationOnce(() =>
          Promise.resolve(buddyBuddeeTouchpointDto),
        );

      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'save')
        .mockImplementation(() =>
          Promise.resolve(buildBuddyBuddeeTouchpointEntity),
        );

      const result =
        await buddyBuddeeTouchpointSevice.updateDraftBuddyBuddeeTouchpoint(
          buddyBuddeeTouchpointDto.id,
          createBuddyBuddeeTouchpointRequestDto,
        );

      expect(result).toEqual(buddyBuddeeTouchpointDto);
      expect(
        mockBuddyTouchpointMapper.toDraftBuddyBuddeeTouchpointEntity,
      ).toBeCalled();
      expect(buddyBuddeeTouchpointRepository.save).toBeCalled();
    });
  });

  describe('submitDraftBuddyBuddeeTouchpoint', () => {
    const buddyBuddeeTouchpointDtoSubmited =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
        buddy,
        buddee,
        TouchpointStatus.SUBMITTED,
      );

    const buildBuddyBuddeeTouchpointEntityFullSubmited =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointEntity(
        buddyBuddeeTouchpointDtoSubmited,
      );

    it('should submit touch-point of buddy and buddee', async () => {
      jest
        .spyOn(mockBuddyTouchpointMapper, 'toDraftBuddyBuddeeTouchpointEntity')
        .mockImplementationOnce(() =>
          Promise.resolve(buddyBuddeeTouchpointDtoSubmited),
        );

      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'save')
        .mockImplementation(() =>
          Promise.resolve(buildBuddyBuddeeTouchpointEntityFullSubmited),
        );

      const result =
        await buddyBuddeeTouchpointSevice.submitDraftBuddyBuddeeTouchpoint(
          buddyBuddeeTouchpointDto.id,
          createBuddyBuddeeTouchpointRequestDto,
        );

      expect(result).toEqual(buddyBuddeeTouchpointDtoSubmited);
      expect(
        mockBuddyTouchpointMapper.toDraftBuddyBuddeeTouchpointEntity,
      ).toBeCalled();
      expect(buddyBuddeeTouchpointRepository.save).toBeCalled();
    });
  });

  describe('getMyTouchpoints', () => {
    it('should return touch-points of a buddy in case there ARE touch-point by buddee', async () => {
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    buddyBuddeeTouchpointEntities,
                    buddeeTouchpointDtoPageDto.meta,
                  ]),
                ),
            }) as never,
        );

      jest
        .spyOn(buddyBuddeeTouchpointEntities, 'toPageDto')
        .mockReturnValueOnce(buddeeTouchpointDtoPageDto);

      const result = await buddyBuddeeTouchpointSevice.getMyTouchpoints(
        buddee.id,
        buddyBuddeeTouchpointPageOptionsDto,
      );

      expect(result).toEqual(buddeeTouchpointDtoPageDto);
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(buddyBuddeeTouchpointEntities.toPageDto).toBeCalled();
    });

    it('should return touch-points of a buddy in case there ARE NOT touch-point by buddee, also there ARE NOT buddee pair as well', async () => {
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    [] as BuddyBuddeeTouchpointEntity[],
                    buddeeTouchpointDtoPageDto.meta,
                  ]),
                ),
            }) as never,
        );

      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddeePair')
        .mockImplementationOnce(() => null);

      jest
        .spyOn([], 'toPageDto')
        .mockReturnValueOnce(buddyBuddeeTouchpointDtoEmptyPage);

      const result = await buddyBuddeeTouchpointSevice.getMyTouchpoints(
        buddee.id,
        buddyBuddeeTouchpointPageOptionsDto,
      );

      expect(result).toEqual(buddyBuddeeTouchpointDtoEmptyPage);
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(mockBuddyBuddeePairService.getBuddeePair).toBeCalled();
    });

    it('should return touch-points of a buddy in case there ARE NOT touch-point by buddee and there ARE buddee pair', async () => {
      jest
        .spyOn(buddyBuddeeTouchpointRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([
                    [] as BuddyBuddeeTouchpointEntity[],
                    buddeeTouchpointDtoPageDto.meta,
                  ]),
                ),
            }) as never,
        );

      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddeePair')
        .mockResolvedValueOnce(myBuddyBuddeePairEntity);

      const buddeeTouchpointDto = new BuddyBuddeeTouchpointEntity();
      buddeeTouchpointDto.buddy = myBuddyBuddeePairEntity.buddy;
      buddeeTouchpointDto.buddee = myBuddyBuddeePairEntity.buddee;

      const resultPage =
        BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDtoPageByTouchpointHasFiterNote(
          buddeeTouchpointDto,
        );

      const result = await buddyBuddeeTouchpointSevice.getMyTouchpoints(
        buddee.id,
        buddyBuddeeTouchpointPageOptionsDto,
      );

      expect(result).toEqual(resultPage);
      expect(buddyBuddeeTouchpointRepository.createQueryBuilder).toBeCalled();
      expect(mockBuddyBuddeePairService.getBuddeePair).toBeCalled();
    });
  });
});
