/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { Repository } from 'typeorm';

import * as Utils from '../../../../common/utils';
import { RoleType } from '../../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidForbiddenException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import MailService from '../../../../integrations/mail/mail.service';
import { GeneratorProvider } from '../../../../providers/generator.provider';
import { BuddyBuddeePairService } from '../../../buddy-buddee-pair/services/buddy-buddee-pair.service';
import { BuddyBuddeePairFake } from '../../../buddy-buddee-pair/tests/fakes/buddy-budee-pair.fake';
import { TimeKeeperEntity } from '../../../timekeeper/entities/timekeeper.entity';
import { TimeTrackingService } from '../../../timekeeper/services/time-tracking.service';
import type { UpdateCustomPositionDto } from '../../dtos/update-custom-position.dto';
import type { UpdateIntroductionDto } from '../../dtos/update-introduction.dto';
import type { UserDto } from '../../dtos/user.dto';
import { LevelEntity } from '../../entities/level.entity';
import { PermissionEntity } from '../../entities/permission.entity';
import { PositionEntity } from '../../entities/position.entity';
import { UserEntity } from '../../entities/user.entity';
import LevelMapper from '../../mappers/level.mapper';
import PositionMapper from '../../mappers/position.mapper';
import UserMapper from '../../mappers/user.mapper';
import { UserService } from '../../services/user.service';
import { UserFake } from '../fakes/user.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;
  let mailService: MailService;
  let permissionRepository: Repository<PermissionEntity>;

  const userDto = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userDto);
  const userDtos = [UserFake.buildUserDto()];
  const userEntities = [UserEntity] as unknown as UserEntity[];
  const pageOptions = UserFake.buildUsersPageOptionsDto();
  const userPageDtos = UserFake.buildUsersPageDto();

  const userMapper = {
    toUserEntity: jest.fn(),
    toUserEntityToUpdate: jest.fn(),
  };

  const mockBuddyBuddeePairMapper = {
    getAllBuddeePairs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        MailService,
        UserMapper,
        PositionMapper,
        LevelMapper,
        TimeTrackingService,
        {
          provide: GeneratorProvider,
          useValue: { generatePassword: jest.fn() },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(() => ({
              to: 'test@example.com',
              subject: 'Test Subject',
              text: 'Test Message',
            })),
          },
        },
        {
          provide: MAILER_OPTIONS,
          useValue: 'MAILER_OPTIONS',
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PositionEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(LevelEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PermissionEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TimeKeeperEntity),
          useClass: Repository,
        },
        {
          provide: UserMapper,
          useValue: userMapper,
        },
        {
          provide: BuddyBuddeePairService,
          useValue: mockBuddyBuddeePairMapper,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    permissionRepository = module.get<Repository<PermissionEntity>>(
      getRepositoryToken(PermissionEntity),
    );
  });

  describe('forgotPassword', () => {
    it('should generate a new password and send a reset email', async () => {
      const mockedUserEntity = {
        id: userDto.id,
        permissions: [{ role: RoleType.USER }],
        toDto: jest.fn(() => userDto) as unknown,
      } as unknown as UserEntity;
      const newPassword = 'newPassword123';

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUserEntity);
      jest.spyOn(Utils, 'validateUserEndDate');
      jest
        .spyOn(GeneratorProvider, 'generatePassword')
        .mockReturnValueOnce(newPassword);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValueOnce(mockedUserEntity);
      jest.spyOn(mailService, 'send').mockImplementationOnce(jest.fn());

      await userService.forgotPassword(userDto.companyEmail);

      expect(userRepository.findOneBy).toBeCalledWith({
        companyEmail: userDto.companyEmail,
      });
      expect(Utils.validateUserEndDate).toBeCalled();
      expect(GeneratorProvider.generatePassword).toBeCalled();
      expect(userRepository.save).toBeCalled();
      expect(mailService.send).toBeCalled();
    });

    it('should throw BadRequestException for non-user accounts', async () => {
      const mockedUserEntity = {
        id: userDto.id,
        permissions: userDto.roles,
        toDto: jest.fn(() => userDto) as unknown,
      } as unknown as UserEntity;
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUserEntity);

      await expect(
        userService.forgotPassword(userDto.companyEmail),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(userRepository.findOneBy).toBeCalledWith({
        companyEmail: userDto.companyEmail,
      });
    });

    it('should throw InvalidNotFoundException if the email does not exist', async () => {
      const userEmail = 'nonexistent@example.com';
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(userService.forgotPassword(userEmail)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(userRepository.findOneBy).toBeCalledWith({
        companyEmail: userEmail,
      });
    });

    it('should throw InvalidForbiddenException for end date before current date', async () => {
      const mockedUserEntity = {
        id: userDto.id,
        permissions: [{ role: RoleType.USER }],
        toDto: jest.fn(() => userDto) as unknown,
      } as unknown as UserEntity;

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUserEntity);
      jest.spyOn(Utils, 'validateUserEndDate').mockImplementationOnce(() => {
        throw new InvalidForbiddenException(ErrorCode.ACCOUNT_EXPIRED);
      });

      await expect(
        userService.forgotPassword(userDto.companyEmail),
      ).rejects.toThrow(InvalidForbiddenException);

      expect(userRepository.findOneBy).toBeCalledWith({
        companyEmail: userDto.companyEmail,
      });
      expect(Utils.validateUserEndDate).toBeCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const profileUpdate = UserFake.buildUpdateProfileDto();

      userDto.phoneNo = profileUpdate.phoneNo;
      userDto.address = profileUpdate.address;

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(userEntity),
        } as never)
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(null),
        } as never);

      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(userEntity);

      const actual = await userService.updateProfile(userDto.id, profileUpdate);

      expect(actual.id).toEqual(userEntity.id);
      expect(actual.phoneNo).toEqual(userEntity.phoneNo);
      expect(actual.address).toEqual(userEntity.address);

      expect(userRepository.createQueryBuilder).toBeCalled();
      expect(userRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user is not found', async () => {
      const userId = 1;
      const profileUpdate = UserFake.buildUpdateProfileDto();

      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(null),
      } as never);

      await expect(
        userService.updateProfile(userId, profileUpdate),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(userRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('updateUser', () => {
    const userUpdateDto = UserFake.buildUpdateUserDto();
    it('should update user info successfully', async () => {
      jest
        .spyOn(userMapper, 'toUserEntityToUpdate')
        .mockImplementationOnce(() => Promise.resolve(userEntity));

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(userEntity),
        } as never)
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(null),
        } as never);

      jest
        .spyOn(userRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve(userEntity));

      const actual = await userService.updateUser(userEntity.id, userUpdateDto);

      expect(actual).toEqual(userEntity.toDto());
      expect(userRepository.createQueryBuilder).toBeCalled();
      expect(userMapper.toUserEntityToUpdate).toBeCalled();
      expect(userRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if the user not exists', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(null),
      } as never);
      await expect(
        userService.updateUser(userEntity.id, userUpdateDto),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(userRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidBadRequestException if end date is before start date', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(userEntity),
      } as never);

      userUpdateDto.endDate = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      userUpdateDto.startDate = tomorrow;

      await expect(
        userService.updateUser(userEntity.id, userUpdateDto),
      ).rejects.toThrowError(InvalidBadRequestException);

      expect(userRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidBadRequestException if the user email exists', async () => {
      userUpdateDto.startDate = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      userUpdateDto.endDate = tomorrow;

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(userEntity),
        } as never)
        .mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValue(userEntity),
        } as never);

      await expect(
        userService.updateUser(userEntity.id, userUpdateDto),
      ).rejects.toThrowError(InvalidBadRequestException);

      expect(userRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('createUser', () => {
    const userCreationDto = UserFake.buildUserCreationDto();
    it('should create new user profile successfully', async () => {
      const permission = UserFake.buildPermissionEntity(
        userEntity,
        UserFake.buildPermissionDto()[0],
      );

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest
        .spyOn(userMapper, 'toUserEntity')
        .mockImplementationOnce(() => Promise.resolve(userEntity));

      jest
        .spyOn(userRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve(userEntity));
      jest
        .spyOn(permissionRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve(permission));

      jest
        .spyOn(userRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve(userEntity));
      jest.spyOn(mailService, 'send').mockImplementationOnce(jest.fn());

      const actual = await userService.createUser(userCreationDto);

      expect(actual).toEqual(userEntity.toDto());
      expect(userRepository.findOneBy).toBeCalled();
      expect(userMapper.toUserEntity).toBeCalled();
      expect(permissionRepository.save).toBeCalled();
      expect(userRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if the user exists', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(userEntity);
      await expect(
        userService.createUser(userCreationDto),
      ).rejects.toThrowError(InvalidBadRequestException);

      expect(userRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidBadRequestException if end date is before start date', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      userCreationDto.endDate = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      userCreationDto.startDate = tomorrow;

      await expect(
        userService.createUser(userCreationDto),
      ).rejects.toThrowError(InvalidBadRequestException);

      expect(userRepository.findOneBy).toBeCalled();
    });
  });

  describe('update introduction', () => {
    const updateIntroductionDto: UpdateIntroductionDto = {
      introduction: 'hi im a free dancer',
    };

    it('update introduction successfully', async () => {
      userRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(userEntity),
      });

      const newEntity = UserFake.buildUserEntity({
        ...userDto,
        introduction: updateIntroductionDto.introduction,
      });

      userRepository.save = jest.fn().mockResolvedValue(newEntity);

      const result = await userService.updateIntroduction(
        1,
        updateIntroductionDto,
      );
      const expectation: UserDto = {
        ...userEntity.toDto(),
        introduction: updateIntroductionDto.introduction,
      };

      expect(result).toEqual(expectation);
    });

    it('update introduction fail because user not found', async () => {
      userRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(null),
      });

      await expect(
        userService.updateIntroduction(1, updateIntroductionDto),
      ).rejects.toThrowError(InvalidNotFoundException);
    });
  });

  describe('update custom position', () => {
    const updateCustomPositionDto: UpdateCustomPositionDto = {
      customPosition: 'free dancer',
    };

    it('update custom position successfully', async () => {
      userRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(userEntity),
      });

      const newEntity = UserFake.buildUserEntity({
        ...userDto,
        customPosition: updateCustomPositionDto.customPosition,
      });

      userRepository.save = jest.fn().mockResolvedValue(newEntity);

      const result = await userService.updateCustomPosition(
        1,
        updateCustomPositionDto,
      );
      const expectation: UserDto = {
        ...userEntity.toDto(),
        customPosition: updateCustomPositionDto.customPosition,
      };

      expect(result).toEqual(expectation);
    });

    it('update custom position fail because user not found', async () => {
      userRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(null),
      });

      await expect(
        userService.updateCustomPosition(1, updateCustomPositionDto),
      ).rejects.toThrowError(InvalidNotFoundException);
    });
  });

  describe('findAllPositions', () => {
    it('should be return all positions', async () => {
      const positionDtos = [UserFake.buildPositionDto()];

      jest
        .spyOn(userService, 'findAllPositions')
        .mockResolvedValueOnce(positionDtos);

      const result = await userService.findAllPositions();

      expect(result).toEqual(positionDtos);

      expect(userService.findAllPositions).toBeCalled();
    });
  });

  describe('findAllLevels', () => {
    it('should be return all levels', async () => {
      const levelDtos = [UserFake.buildLevelDto()];

      jest.spyOn(userService, 'findAllLevels').mockResolvedValueOnce(levelDtos);

      const result = await userService.findAllLevels();

      expect(result).toEqual(levelDtos);

      expect(userService.findAllLevels).toBeCalled();
    });
  });

  describe('getUsers', () => {
    it('should be return all users', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        paginate: jest
          .fn()
          .mockResolvedValue([userEntities, userPageDtos.meta]),
      } as never);
      jest.spyOn(userEntities, 'toPageDto').mockReturnValue(userPageDtos);

      const result = await userService.getUsers(pageOptions);

      expect(result).toEqual(userPageDtos);

      expect(userRepository.createQueryBuilder).toBeCalled();
      expect(userEntities.toPageDto).toBeCalled();
    });
  });

  describe('getUsersWithoutPageDto', () => {
    it('should return all users without pagination', async () => {
      const buddyBuddeePairs = [
        BuddyBuddeePairFake.buildBuddyBuddeePairEntity(userDto, userDto),
      ];

      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(userEntities),
      } as never);

      jest.spyOn(userEntities, 'toDtos').mockReturnValueOnce(userDtos);

      jest
        .spyOn(mockBuddyBuddeePairMapper, 'getAllBuddeePairs')
        .mockResolvedValueOnce(buddyBuddeePairs);

      const result = await userService.getUsersWithoutPageDto();

      expect(result).toEqual(userDtos);

      expect(userRepository.createQueryBuilder).toBeCalled();
      expect(userEntities.toDtos).toBeCalled();
      expect(mockBuddyBuddeePairMapper.getAllBuddeePairs).toBeCalled();
    });
  });

  describe('findUsersByKeyword', () => {
    it('should get users by name(fistName, lastName, companyEmail)', async () => {
      const keyword = 'keyword';

      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(userEntities),
      } as never);

      jest.spyOn(userEntities, 'toDtos').mockReturnValueOnce(userDtos);

      const result = await userService.findUsersByKeyword(keyword);

      expect(result).toEqual(userDtos);

      expect(userRepository.createQueryBuilder).toBeCalled();
      expect(userEntities.toDtos).toBeCalled();
    });
  });

  describe('getUserById', () => {
    it('should get profile details', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(userEntity),
      } as never);

      jest.spyOn(userEntity, 'toDto').mockReturnValueOnce(userDto);

      const result = await userService.getUserById(userDto.id);

      expect(result).toEqual(userDto);

      expect(userRepository.createQueryBuilder).toBeCalled();
      expect(userEntity.toDto).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);

      await expect(userService.getUserById(userDto.id)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(userRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('deactivatedUser', () => {
    it('should deactivate user profile', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(userEntity),
      } as never);

      const newEntity = { ...userEntity, isActive: false };

      userRepository.save = jest.fn().mockResolvedValue(newEntity);

      await userService.deactivatedUser(userDto.id);

      expect(userRepository.createQueryBuilder).toBeCalled();
      expect(userRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as never);

      await expect(userService.deactivatedUser(userDto.id)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(userRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('getUsersWithTimeoffRequestApproved', () => {
    it('should be return users with approved time-off request', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(userEntities),
      } as never);

      const result = await userService.getUsersWithTimeoffRequestApproved(
        new Date(),
      );

      expect(result[0].id).toEqual(userEntities[0].id);

      expect(userRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('getUsersInOffice', () => {
    it('should be return users in office', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(userEntities),
      } as never);

      const result = await userService.getUsersInOffice(new Date());

      expect(result[0].id).toEqual(userEntities[0].id);
      expect(userRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('getUsersWithWfhRequestApproved', () => {
    it('should be return users with approved wfh request', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(userEntities),
      } as never);

      const result = await userService.getUsersWithWfhRequestApproved(
        new Date(),
      );

      expect(result[0].id).toEqual(userEntities[0].id);

      expect(userRepository.createQueryBuilder).toBeCalled();
    });
  });
});
