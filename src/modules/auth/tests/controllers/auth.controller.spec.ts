/* eslint-disable @typescript-eslint/unbound-method */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { RoleType } from '../../../../constants';
import type { UserEntity } from '../../../user/entities/user.entity';
import { CvService } from '../../../user/services/cv.service';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { AuthFake } from '../fakes/auth.fake';

describe('AuthController', () => {
  let authController: AuthController;

  const expectedPhotoUrl = 'https://s3/avatar/test.png';
  const expectedCvUrl = 'https://s3/cv/test.pdf';
  const userLogin = UserFake.buildAdminDto();
  const userLoginDto = AuthFake.buildUserLoginDto();
  const tokenPayload = AuthFake.buildTokenPayloadDto();
  const forgotPasswordDto = AuthFake.buildForgotPasswordDto();

  const mockedUserEntity = {
    id: userLogin.id,
    permissions: userLogin.roles,
    toDto: jest.fn(() => userLogin) as unknown,
  } as unknown as UserEntity;

  const mockAuthService = {
    validateUser: jest.fn(),
    validateAdmin: jest.fn(),
    createAccessToken: jest.fn(),
    createExternalUserAccessToken: jest.fn(),
    createExternalUserAccessTokenToPM: jest.fn(),
    decodeToken: jest.fn(),
  };

  const mockUserService = {
    forgotPassword: jest.fn(),
  };

  const mockCvService = {
    updateUserCv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CvService,
          useValue: mockCvService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('userLogin', () => {
    it('should return user info with access token', async () => {
      jest
        .spyOn(mockAuthService, 'validateUser')
        .mockReturnValue(mockedUserEntity);
      jest
        .spyOn(mockAuthService, 'createAccessToken')
        .mockReturnValue(tokenPayload);

      const result = await authController.userLogin(userLoginDto);

      expect(result.user.id).toEqual(userLogin.id);
      expect(result.user.photo).toEqual(expectedPhotoUrl);
      expect(result.user.cv?.cv).toEqual(expectedCvUrl);
      expect(result.token).toEqual(tokenPayload);

      expect(mockAuthService.validateUser).toBeCalled();
      expect(mockAuthService.createAccessToken).toBeCalled();
    });
  });

  describe('adminLogin', () => {
    it('should return admin info with access token', async () => {
      const adminLogin = { ...userLogin, roles: [RoleType.ADMIN] };
      const mockAdminEntity = {
        id: adminLogin.id,
        permissions: adminLogin.roles,
        toDto: jest.fn(() => adminLogin) as unknown,
      } as unknown as UserEntity;

      jest
        .spyOn(mockAuthService, 'validateAdmin')
        .mockReturnValue(mockAdminEntity);
      jest
        .spyOn(mockAuthService, 'createAccessToken')
        .mockReturnValue(tokenPayload);

      const result = await authController.adminLogin(userLoginDto);

      expect(result.user.id).toEqual(userLogin.id);
      expect(result.user.photo).toEqual(expectedPhotoUrl);
      expect(result.user.cv?.cv).toEqual(expectedCvUrl);
      expect(result.token).toEqual(tokenPayload);

      expect(mockAuthService.validateAdmin).toBeCalled();
      expect(mockAuthService.createAccessToken).toBeCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email', async () => {
      jest.spyOn(mockUserService, 'forgotPassword');

      await authController.forgotPassword(forgotPasswordDto);

      expect(mockUserService.forgotPassword).toBeCalled();
    });
  });
});
