/* eslint-disable unicorn/numeric-separators-style */
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import * as Utils from '../../../../common/utils';
import { RoleType } from '../../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidForbiddenException,
} from '../../../../exceptions';
import { ApiConfigService } from '../../../../shared/services/api-config.service';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AuthService } from '../../services/auth.service';
import { AuthFake } from '../fakes/auth.fake';

const mockUserService = {
  findOne: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verify: jest.fn(),
};

const mockApiConfigService = {
  authConfig: {
    jwtExpirationTime: 3600,
    jwtConfirmExpirationTime: 172800,
    privateKey: 'privateKey',
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ApiConfigService, useValue: mockApiConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('createAccessToken', () => {
    it('should create an access token', async () => {
      const data = { roles: [RoleType.USER], userId: 1 };
      const tokenPayload = AuthFake.buildTokenPayloadDto();

      jest
        .spyOn(mockJwtService, 'signAsync')
        .mockReturnValue(tokenPayload.accessToken);

      const actual = await service.createAccessToken(data);

      expect(actual).toEqual(tokenPayload);

      expect(mockJwtService.signAsync).toBeCalled();
    });
  });

  describe('validateUser', () => {
    const userLogin = UserFake.buildUserDto();
    const userLoginDto = AuthFake.buildUserLoginDto();
    const mockedUserEntity = {
      id: userLogin.id,
      permissions: userLogin.roles,
      password: 'password',
      toDto: jest.fn(() => userLogin) as unknown,
    } as unknown as UserEntity;

    it('should validate user credentials and return user entity', async () => {
      jest
        .spyOn(mockUserService, 'findOne')
        .mockResolvedValueOnce(mockedUserEntity);
      jest.spyOn(Utils, 'validateUserEndDate');
      jest
        .spyOn(Utils, 'validateHash')
        .mockImplementation(() => Promise.resolve(true));

      const actual = await service.validateUser(userLoginDto);

      expect(actual).toEqual(mockedUserEntity);

      expect(mockUserService.findOne).toBeCalled();
      expect(Utils.validateUserEndDate).toBeCalled();
      expect(Utils.validateHash).toBeCalled();
    });

    it('should throw InvalidBadRequestException for invalid user', async () => {
      jest.spyOn(mockUserService, 'findOne').mockResolvedValueOnce(null);

      await expect(service.validateUser(userLoginDto)).rejects.toThrow(
        InvalidBadRequestException,
      );

      expect(mockUserService.findOne).toBeCalled();
    });

    it('should throw InvalidForbiddenException for end date before current date', async () => {
      jest
        .spyOn(mockUserService, 'findOne')
        .mockResolvedValueOnce(mockedUserEntity);
      jest.spyOn(Utils, 'validateUserEndDate').mockImplementationOnce(() => {
        throw new InvalidForbiddenException(ErrorCode.ACCOUNT_EXPIRED);
      });

      await expect(service.validateUser(userLoginDto)).rejects.toThrow(
        InvalidForbiddenException,
      );

      expect(mockUserService.findOne).toBeCalled();
      expect(Utils.validateUserEndDate).toBeCalled();
    });

    it('should throw InvalidBadRequestException for invalid credentials', async () => {
      jest
        .spyOn(mockUserService, 'findOne')
        .mockResolvedValueOnce(mockedUserEntity);
      jest.spyOn(Utils, 'validateUserEndDate');
      jest
        .spyOn(Utils, 'validateHash')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.validateUser(userLoginDto)).rejects.toThrow(
        InvalidBadRequestException,
      );

      expect(mockUserService.findOne).toBeCalled();
      expect(Utils.validateUserEndDate).toBeCalled();
      expect(Utils.validateHash).toBeCalled();
    });
  });

  describe('validateAdmin', () => {
    const userLogin = UserFake.buildUserDto();
    const userLoginDto = AuthFake.buildUserLoginDto();

    it('should validate admin credentials and return user entity', async () => {
      const mockAdminEntity = {
        id: userLogin.id,
        permissions: [
          {
            id: 7,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: RoleType.ADMIN,
          },
        ],
        password: 'password',
        toDto: jest.fn(() => userLogin) as unknown,
      } as unknown as UserEntity;

      jest
        .spyOn(mockUserService, 'findOne')
        .mockResolvedValueOnce(mockAdminEntity);
      jest
        .spyOn(Utils, 'validateHash')
        .mockImplementationOnce(() => Promise.resolve(true));
      jest.spyOn(Utils, 'validateUserEndDate');

      const actual = await service.validateAdmin(userLoginDto);

      expect(actual).toEqual(mockAdminEntity);

      expect(mockUserService.findOne).toBeCalledWith({
        companyEmail: userLoginDto.email,
      });
      expect(Utils.validateHash).toBeCalled();
      expect(Utils.validateUserEndDate).toBeCalled();
    });

    it('should throw InvalidBadRequestException for invalid credentials', async () => {
      jest.spyOn(mockUserService, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(Utils, 'validateHash')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.validateAdmin(userLoginDto)).rejects.toThrow(
        InvalidBadRequestException,
      );

      expect(mockUserService.findOne).toBeCalledWith({
        companyEmail: userLoginDto.email,
      });
      expect(Utils.validateHash).toBeCalled();
    });

    it('should throw ForbiddenException if user not authorized for action', async () => {
      const mockUserEntity = {
        id: userLogin.id,
        permissions: userLogin.roles,
        password: 'password',
        toDto: jest.fn(() => userLogin) as unknown,
      } as unknown as UserEntity;

      jest
        .spyOn(mockUserService, 'findOne')
        .mockResolvedValueOnce(mockUserEntity);
      jest
        .spyOn(Utils, 'validateHash')
        .mockImplementation(() => Promise.resolve(true));

      await expect(service.validateAdmin(userLoginDto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockUserService.findOne).toBeCalledWith({
        companyEmail: userLoginDto.email,
      });
      expect(Utils.validateHash).toBeCalled();
    });

    it('should throw InvalidForbiddenException for end date before current day', async () => {
      const mockAdminEntity = {
        id: userLogin.id,
        permissions: [
          {
            id: 7,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: RoleType.ADMIN,
          },
        ],
        password: 'password',
        toDto: jest.fn(() => userLogin) as unknown,
      } as unknown as UserEntity;

      jest
        .spyOn(mockUserService, 'findOne')
        .mockResolvedValueOnce(mockAdminEntity);
      jest
        .spyOn(Utils, 'validateHash')
        .mockImplementation(() => Promise.resolve(true));
      jest.spyOn(Utils, 'validateUserEndDate').mockImplementationOnce(() => {
        throw new InvalidForbiddenException(ErrorCode.ACCOUNT_EXPIRED);
      });

      await expect(service.validateAdmin(userLoginDto)).rejects.toThrow(
        InvalidForbiddenException,
      );

      expect(mockUserService.findOne).toBeCalledWith({
        companyEmail: userLoginDto.email,
      });
      expect(Utils.validateHash).toBeCalled();
      expect(Utils.validateUserEndDate).toBeCalled();
    });
  });

  describe('createExternalUserAccessToken', () => {
    it('should create external user access token', async () => {
      const data = { userId: 1 };
      const tokenPayload = {
        ...AuthFake.buildTokenPayloadDto(),
        expiresIn: Number.MAX_VALUE,
      };

      jest
        .spyOn(mockJwtService, 'signAsync')
        .mockReturnValue(tokenPayload.accessToken);

      const actual = await service.createExternalUserAccessToken(data);

      expect(actual).toEqual(tokenPayload);

      expect(mockJwtService.signAsync).toBeCalled();
    });
  });

  describe('createExternalUserAccessTokenToPM', () => {
    it('should create external user access token to PM', async () => {
      const data = { timeOffRequestId: 1 };
      const tokenPayload = {
        ...AuthFake.buildTokenPayloadDto(),
        expiresIn: mockApiConfigService.authConfig.jwtConfirmExpirationTime,
      };

      jest
        .spyOn(mockJwtService, 'signAsync')
        .mockReturnValue(Promise.resolve(tokenPayload.accessToken));

      const actual = await service.createExternalUserAccessTokenToPM(data);

      expect(actual).toEqual(tokenPayload);

      expect(mockJwtService.signAsync).toBeCalled();
    });
  });

  describe('decodeToken', () => {
    it('should decode the token successfully', () => {
      const token = 'token';
      const userAuthenticationToken =
        AuthFake.buildUserAuthenticationTokenDto();

      jest
        .spyOn(mockJwtService, 'verify')
        .mockReturnValue(userAuthenticationToken);

      const actual = service.decodeToken(token);

      expect(actual).toEqual(userAuthenticationToken);

      expect(mockJwtService.verify).toBeCalled();
    });

    it('should return null if one of the typeof conditions matches', () => {
      const token = 'token';
      const userAuthenticationToken = {
        ...AuthFake.buildUserAuthenticationTokenDto(),
        type: 1,
      };

      jest
        .spyOn(mockJwtService, 'verify')
        .mockReturnValue(userAuthenticationToken);

      const actual = service.decodeToken(token);

      expect(actual).toEqual(null);

      expect(mockJwtService.verify).toBeCalled();
    });
  });
});
