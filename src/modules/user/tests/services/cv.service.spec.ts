/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvalidNotFoundException } from '../../../../exceptions';
import { CvEntity } from '../../entities/cv.entity';
import { UserEntity } from '../../entities/user.entity';
import { CvService } from '../../services/cv.service';
import { CvFake } from '../fakes/cv.fake';
import { UserFake } from '../fakes/user.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('CvService', () => {
  let cvService: CvService;
  let cvRepository: Repository<CvEntity>;
  let userRepository: Repository<UserEntity>;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const cvDto = CvFake.buildCvDto();
  const cvEntity = CvFake.buildCvEntity(cvDto);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        {
          provide: getRepositoryToken(CvEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    cvService = module.get<CvService>(CvService);
    cvRepository = module.get<Repository<CvEntity>>(
      getRepositoryToken(CvEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  describe('updateUserCv', () => {
    it('should update cv by user', async () => {
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(userEntity));
      jest.spyOn(cvRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(cvEntity),
          }) as never,
      );
      jest
        .spyOn(cvRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve(cvEntity));

      await cvService.updateUserCv(userEntity.id, cvEntity.cv);

      expect(userRepository.findOneBy).toBeCalledWith({ id: userEntity.id });
      expect(cvRepository.createQueryBuilder).toBeCalled();
      expect(cvRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockImplementationOnce(() => Promise.resolve(null));

      await expect(
        cvService.updateUserCv(userEntity.id, cvEntity.cv),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(userRepository.findOneBy).toBeCalledWith({ id: userEntity.id });
    });
  });
});
