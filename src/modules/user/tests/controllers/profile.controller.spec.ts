import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import * as fileValidator from '../../../../validators/file.validator';
import { ProfileController } from '../../controllers/profile.controller';
import type { UpdateCustomPositionDto } from '../../dtos/update-custom-position.dto';
import type { UpdateIntroductionDto } from '../../dtos/update-introduction.dto';
import { CvService } from '../../services/cv.service';
import { UserService } from '../../services/user.service';
import { UserFake } from '../fakes/user.fake';

describe('ProfileController', () => {
  let profileController: ProfileController;

  const expectedPhotoUrl = 'https://s3/avatar/test.png';
  const expectedCvUrl = 'https://s3/cv/test.pdf';
  const userDto = UserFake.buildUserDto();
  const mockUpdateProfile = UserFake.buildUpdateProfileDto();
  const mockAvatar = UserFake.buildAvatarIFile();
  const mockCv = UserFake.buildCvIFile();
  const mockPassword = UserFake.buildPasswordDto();
  const userEntity = UserFake.buildUserEntity(userDto);

  userDto.phoneNo = mockUpdateProfile.phoneNo;
  userDto.address = mockUpdateProfile.address;

  const mockUserService = {
    getUserById: jest.fn(),
    updateProfile: jest.fn(),
    updateUserPhoto: jest.fn(),
    changePassword: jest.fn(),
    updateIntroduction: jest.fn(),
    updateCustomPosition: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  const mockCvService = {
    updateUserCv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CvService,
          useValue: mockCvService,
        },
        {
          provide: AwsS3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    profileController = module.get<ProfileController>(ProfileController);
  });

  describe('getUser', () => {
    it('should get user profile', async () => {
      jest.spyOn(mockUserService, 'getUserById').mockReturnValue(userDto);

      const result = await profileController.getUser(userEntity);

      expect(result.id).toEqual(userDto.id);
      expect(result.photo).toEqual(expectedPhotoUrl);
      expect(result.cv?.cv).toEqual(expectedCvUrl);

      expect(mockUserService.getUserById).toBeCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      jest.spyOn(mockUserService, 'updateProfile').mockReturnValue(userDto);

      const result = await profileController.updateProfile(
        userEntity,
        mockUpdateProfile,
      );

      expect(result.id).toEqual(userEntity.id);
      expect(result.phoneNo).toEqual(mockUpdateProfile.phoneNo);
      expect(result.address).toEqual(mockUpdateProfile.address);

      expect(mockUserService.updateProfile).toBeCalled();
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      jest.spyOn(fileValidator, 'validateImage');
      jest.spyOn(mockS3Service, 'uploadFile').mockReturnValue(expectedPhotoUrl);
      jest.spyOn(mockUserService, 'updateUserPhoto');

      const result = await profileController.updateAvatar(
        userEntity,
        mockAvatar,
      );

      expect(result.s3Path).toEqual(expectedPhotoUrl);

      expect(mockS3Service.uploadFile).toBeCalled();
      expect(mockUserService.updateUserPhoto).toBeCalled();
      expect(fileValidator.validateImage).toBeCalled();
    });
  });

  describe('updateCv', () => {
    it('should update user CV', async () => {
      jest.spyOn(fileValidator, 'validateDocument');
      jest.spyOn(mockS3Service, 'uploadFile').mockReturnValue(expectedCvUrl);
      jest.spyOn(mockCvService, 'updateUserCv');

      const result = await profileController.updateCv(userEntity, mockCv);

      expect(result.s3Path).toEqual(expectedCvUrl);

      expect(mockS3Service.uploadFile).toBeCalled();
      expect(mockCvService.updateUserCv).toBeCalled();
      expect(fileValidator.validateDocument).toBeCalled();
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      jest.spyOn(mockUserService, 'changePassword');

      await profileController.changePassword(userEntity, mockPassword);

      expect(mockUserService.changePassword).toBeCalled();
    });
  });

  describe('update introduction', () => {
    const updateIntroductionDto: UpdateIntroductionDto = {
      introduction: 'hi im a free dancer',
    };

    it('update introduction successfully', async () => {
      mockUserService.updateIntroduction = jest.fn().mockResolvedValue(userDto);

      const result = await profileController.updateIntroduction(
        userEntity,
        updateIntroductionDto,
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

      const result = await profileController.updateCustomPosition(
        userEntity,
        updateCustomPositionDto,
      );
      expect(result).toEqual(userDto);
      expect(mockUserService.updateCustomPosition).toBeCalled();
    });
  });
});
