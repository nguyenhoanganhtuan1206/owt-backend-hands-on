/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../../exceptions';
import { BuddyBuddeePairService } from '../../../buddy-buddee-pair/services/buddy-buddee-pair.service';
import { BuddyBuddeePairFake } from '../../../buddy-buddee-pair/tests/fakes/buddy-budee-pair.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { BuddyEntity } from '../../entities/buddy.entity';
import BuddyMapper from '../../mappers/buddy.mapper';
import { BuddyService } from '../../services/buddy.service';
import { BuddyFake } from '../fakes/buddy.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('BuddyService', () => {
  let buddyService: BuddyService;
  let buddyRepository: Repository<BuddyEntity>;

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

  const mockBuddyMapper = {
    toBuddyEntity: jest.fn(),
  };

  const mockBuddyBuddeePairService = {
    getAllBuddyPairs: jest.fn(),
    getBuddyBuddeePairs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuddyService,
        {
          provide: BuddyMapper,
          useValue: mockBuddyMapper,
        },
        {
          provide: BuddyBuddeePairService,
          useValue: mockBuddyBuddeePairService,
        },
        {
          provide: getRepositoryToken(BuddyEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    buddyService = module.get<BuddyService>(BuddyService);
    buddyRepository = module.get<Repository<BuddyEntity>>(
      getRepositoryToken(BuddyEntity),
    );
  });

  describe('getBuddies', () => {
    const buddyPageOptions = BuddyFake.buildBuddyPageOptionsDto();
    const buddyDtosPageDto = BuddyFake.buildBuddyDtosPageDto();
    const buddyEntities = [buddyEntity];

    it('should return list buddies', async () => {
      jest.spyOn(buddyRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        paginate: jest
          .fn()
          .mockResolvedValueOnce([buddyEntities, buddyDtosPageDto.meta]),
      } as never);
      jest
        .spyOn(mockBuddyBuddeePairService, 'getAllBuddyPairs')
        .mockImplementation(() => Promise.resolve(buddyBuddeePairEntities));

      const result = await buddyService.getBuddies(buddyPageOptions);

      expect(result.data[0].id).toEqual(buddyDtosPageDto.data[0].id);
      expect(result.data[0].buddy.id).toEqual(
        buddyDtosPageDto.data[0].buddy.id,
      );

      expect(buddyRepository.createQueryBuilder).toBeCalled();
      expect(mockBuddyBuddeePairService.getAllBuddyPairs).toBeCalled();
    });
  });

  describe('createBuddy', () => {
    const createBuddy = BuddyFake.buildCreateBuddyRequestDto();

    it('should create buddy', async () => {
      jest.spyOn(buddyRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null),
      } as never);
      jest
        .spyOn(mockBuddyMapper, 'toBuddyEntity')
        .mockImplementation(() => Promise.resolve(buddyEntity));
      jest
        .spyOn(buddyRepository, 'save')
        .mockImplementation(() => Promise.resolve(buddyEntity));

      const result = await buddyService.createBuddy(createBuddy);

      expect(result.id).toEqual(buddyEntity.id);
      expect(result.buddy.id).toEqual(buddyEntity.user.id);

      expect(buddyRepository.createQueryBuilder).toBeCalled();
      expect(mockBuddyMapper.toBuddyEntity).toBeCalled();
      expect(buddyRepository.save).toBeCalled();
    });

    it('should throw ConflictException if buddy already exists', async () => {
      jest.spyOn(buddyRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(buddyEntity),
      } as never);

      await expect(buddyService.createBuddy(createBuddy)).rejects.toThrow(
        ConflictException,
      );

      expect(buddyRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(buddyRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null),
      } as never);
      jest
        .spyOn(mockBuddyMapper, 'toBuddyEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(buddyService.createBuddy(createBuddy)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(buddyRepository.createQueryBuilder).toBeCalled();
      expect(mockBuddyMapper.toBuddyEntity).toBeCalled();
    });
  });

  describe('deleteBuddy', () => {
    it('should delete buddy', async () => {
      jest
        .spyOn(buddyRepository, 'findOneBy')
        .mockResolvedValueOnce(buddyEntity);
      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddyBuddeePairs')
        .mockImplementation(() => []);

      jest.spyOn(buddyRepository, 'remove').mockImplementation(jest.fn());

      await buddyService.deleteBuddy(buddyDto.id);

      expect(buddyRepository.findOneBy).toBeCalledWith({ id: buddyDto.id });
      expect(mockBuddyBuddeePairService.getBuddyBuddeePairs).toBeCalled();
      expect(buddyRepository.remove).toBeCalledWith(buddyEntity);
    });

    it('should throw NotFoundException if buddy not found', async () => {
      jest.spyOn(buddyRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(buddyService.deleteBuddy(buddyDto.id)).rejects.toThrowError(
        NotFoundException,
      );

      expect(buddyRepository.findOneBy).toBeCalledWith({ id: buddyDto.id });
    });

    it('should throw BadRequestException if buddy can not be remove', async () => {
      jest
        .spyOn(buddyRepository, 'findOneBy')
        .mockResolvedValueOnce(buddyEntity);
      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddyBuddeePairs')
        .mockResolvedValueOnce(buddyBuddeePairEntities);

      await expect(buddyService.deleteBuddy(buddyDto.id)).rejects.toThrowError(
        BadRequestException,
      );

      expect(buddyRepository.findOneBy).toBeCalledWith({ id: buddyDto.id });
      expect(mockBuddyBuddeePairService.getBuddyBuddeePairs).toBeCalled();
    });
  });
});
