/* eslint-disable @typescript-eslint/unbound-method */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { TranslationService } from '../../../../shared/services/translation.service';
import { AdminUserController } from '../../controllers/admin-user.controller';
import type { UpdateCustomPositionDto } from '../../dtos/update-custom-position.dto';
import type { UpdateIntroductionDto } from '../../dtos/update-introduction.dto';
import UpdateUserDto from '../../dtos/update-user.dto';
import type { UserDto } from '../../dtos/user.dto';
import UserCreationDto from '../../dtos/user-creation.dto';
import type { UserEntity } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';
import { UserFake } from '../fakes/user.fake';

describe('AdminUserController', () => {
  let adminUserController: AdminUserController;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const mockUserService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    findAllPositions: jest.fn(),
    findAllLevels: jest.fn(),
    updateIntroduction: jest.fn(),
    updateCustomPosition: jest.fn(),
    getUsersWithoutPageDto: jest.fn(),
    getUsers: jest.fn(),
    findUsersByKeyword: jest.fn(),
    getUserById: jest.fn(),
    deactivatedUser: jest.fn(),
  };

  const mockTranslationService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    adminUserController = module.get<AdminUserController>(AdminUserController);
    userDto = UserFake.buildUserDto();
    userEntity = UserFake.buildUserEntity(userDto);
  });

  describe('createUser', () => {
    it('should create user info successfully', async () => {
      const userCreationDto = plainToInstance(UserCreationDto, userDto);
      jest.spyOn(mockUserService, 'createUser').mockReturnValue(userEntity);

      const result = await adminUserController.createUser(userCreationDto);

      expect(result).toEqual(userEntity);

      expect(mockUserService.createUser).toBeCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user info successfully', async () => {
      const userUpdateDto = plainToInstance(UpdateUserDto, userDto);
      jest.spyOn(mockUserService, 'updateUser').mockReturnValue(userEntity);

      const result = await adminUserController.updateUser(
        userEntity.id,
        userUpdateDto,
      );

      expect(result).toEqual(userEntity);

      expect(mockUserService.updateUser).toBeCalled();
    });
  });

  describe('update introduction', () => {
    const updateIntroductionDto: UpdateIntroductionDto = {
      introduction: 'hi im a free dancer',
    };

    it('update introduction successfully', async () => {
      mockUserService.updateIntroduction = jest.fn().mockResolvedValue(userDto);

      const result = await adminUserController.updateIntroduction(
        updateIntroductionDto,
        userEntity.id,
      );
      expect(result).toEqual(userDto);
      expect(mockUserService.updateIntroduction).toBeCalled();
    });
  });

  describe('update custom position', () => {
    const updateCustomPositionDto: UpdateCustomPositionDto = {
      customPosition: 'free dancer',
    };

    it('update custom position successfully', async () => {
      mockUserService.updateCustomPosition = jest
        .fn()
        .mockResolvedValue(userDto);

      const result = await adminUserController.updateCustomPosition(
        updateCustomPositionDto,
        userEntity.id,
      );
      expect(result).toEqual(userDto);
      expect(mockUserService.updateCustomPosition).toBeCalled();
    });
  });

  describe('getPositions', () => {
    it('should get positions list successfully', async () => {
      const positions = [UserFake.buildPositionDto()];
      jest
        .spyOn(mockUserService, 'findAllPositions')
        .mockReturnValue(positions);

      const result = await adminUserController.getPositions();

      expect(result).toEqual(positions);

      expect(mockUserService.findAllPositions).toBeCalled();
    });
  });

  describe('getLevels', () => {
    it('should get levels list successfully', async () => {
      const levels = [UserFake.buildLevelDto()];

      jest.spyOn(mockUserService, 'findAllLevels').mockReturnValue(levels);

      const result = await adminUserController.getLevels();

      expect(result).toEqual(levels);

      expect(mockUserService.findAllLevels).toBeCalled();
    });
  });

  describe('getUsersWithoutPageDto', () => {
    it('should return all users without pagination', async () => {
      const userDtos = [userDto];

      jest
        .spyOn(mockUserService, 'getUsersWithoutPageDto')
        .mockReturnValue(userDtos);

      const result = await adminUserController.getUsersWithoutPageDto();

      expect(result).toEqual(userDtos);

      expect(mockUserService.getUsersWithoutPageDto).toBeCalled();
    });
  });

  describe('getUsers', () => {
    it('should return a page of users', async () => {
      const pageOptions = UserFake.buildUsersPageOptionsDto();
      const expectedUserDtos = UserFake.buildUsersPageDto();

      jest.spyOn(mockUserService, 'getUsers').mockReturnValue(expectedUserDtos);

      const result = await adminUserController.getUsers(pageOptions);

      expect(result.data[0].id).toEqual(expectedUserDtos.data[0].id);
      expect(result.data[0].roles).toEqual(expectedUserDtos.data[0].roles);
      expect(result.data[0].firstName).toEqual(
        expectedUserDtos.data[0].firstName,
      );
      expect(result.data[0].lastName).toEqual(
        expectedUserDtos.data[0].lastName,
      );

      expect(mockUserService.getUsers).toBeCalled();
    });
  });

  describe('findUsers', () => {
    it('should return a users by name(fistName, lastName, companyEmail)', async () => {
      const keyword = 'keyword';
      const userDtos = [userDto];

      jest
        .spyOn(mockUserService, 'findUsersByKeyword')
        .mockReturnValue(userDtos);

      const result = await adminUserController.findUsers(keyword);

      expect(result[0].id).toEqual(userDtos[0].id);
      expect(result[0].roles).toEqual(userDtos[0].roles);
      expect(result[0].firstName).toEqual(userDtos[0].firstName);
      expect(result[0].lastName).toEqual(userDtos[0].lastName);

      expect(mockUserService.findUsersByKeyword).toBeCalled();
    });
  });

  describe('getUserDetails', () => {
    it('should get profile details', async () => {
      jest.spyOn(mockUserService, 'getUserById').mockReturnValue(userDto);

      const result = await adminUserController.getUserDetails(userDto.id);

      expect(result.id).toEqual(userDto.id);
      expect(result.roles).toEqual(userDto.roles);
      expect(result.firstName).toEqual(userDto.firstName);
      expect(result.lastName).toEqual(userDto.lastName);

      expect(mockUserService.getUserById).toBeCalled();
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user profile', async () => {
      const userAfterDeactivate: UserDto = { ...userDto, isActive: false };

      jest
        .spyOn(mockUserService, 'deactivatedUser')
        .mockReturnValueOnce(userAfterDeactivate);

      await adminUserController.deactivateUser(userDto.id);

      expect(userAfterDeactivate.isActive).toEqual(false);

      expect(mockUserService.deactivatedUser).toBeCalled();
    });
  });
});
