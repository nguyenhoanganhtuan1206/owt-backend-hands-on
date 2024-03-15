import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { CvService } from '../../../user/services/cv.service';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { AuthFake } from '../fakes/auth.fake';

describe('Auth', () => {
  let app: INestApplication;

  const expectedPhotoUrl = 'https://s3/avatar/test.png';
  const expectedCvUrl = 'https://s3/cv/test.pdf';
  const userDto = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userDto);
  const adminDto = UserFake.buildAdminDto();
  const adminEntity = UserFake.buildUserEntity(adminDto);
  const userLoginDto = AuthFake.buildUserLoginDto();
  const tokenPayload = AuthFake.buildTokenPayloadDto();
  const forgotPasswordDto = AuthFake.buildForgotPasswordDto();

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
    })
      .overrideGuard(JwtAuthGuard) // mock @UseGuards(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = userEntity;

          return req.user;
        },
      })
      .overrideGuard(RolesGuard) // mock @Auth() (should be @Role([...]))
      .useValue({
        canActivate: () => true,
      })
      .overrideInterceptor(AuthUserInterceptor)
      .useValue({
        intercept(context: ExecutionContext, next: CallHandler) {
          return next.handle();
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('POST: /auth/admin/login', () => {
    it('admin login successfully', async () => {
      jest.spyOn(mockAuthService, 'validateAdmin').mockReturnValue(adminEntity);
      jest
        .spyOn(mockAuthService, 'createAccessToken')
        .mockReturnValue(tokenPayload);

      const requestE2e = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send(userLoginDto)
        .expect(200);

      const { body } = requestE2e;

      expect(body.user.id).toEqual(userDto.id);
      expect(body.user.photo).toEqual(expectedPhotoUrl);
      expect(body.user.cv.cv).toEqual(expectedCvUrl);
      expect(body.token).toEqual(tokenPayload);
    });

    it('admin login fail because validation', async () => {
      jest.spyOn(mockAuthService, 'validateAdmin').mockReturnValue(adminEntity);
      jest
        .spyOn(mockAuthService, 'createAccessToken')
        .mockReturnValue(tokenPayload);

      return request(app.getHttpServer()).post('/auth/admin/login').expect(400);
    });
  });

  describe('POST: /auth/login', () => {
    it('login successfully', async () => {
      mockAuthService.validateUser = jest.fn().mockReturnValue(userEntity);
      jest
        .spyOn(mockAuthService, 'createAccessToken')
        .mockReturnValue(tokenPayload);

      const requestE2e = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginDto)
        .expect(200);

      const { body } = requestE2e;

      expect(body.user.id).toEqual(userDto.id);
      expect(body.user.photo).toEqual(expectedPhotoUrl);
      expect(body.user.cv.cv).toEqual(expectedCvUrl);
      expect(body.token).toEqual(tokenPayload);
    });
  });

  describe('GET: /auth/me', () => {
    it('get current user successfully', async () =>
      request(app.getHttpServer())
        .get('/auth/me')
        .expect(200)
        .expect(JSON.stringify(userDto)));
  });

  describe('PUT: /auth/forgot-password', () => {
    it('should send a password reset email', async () => {
      jest.spyOn(mockUserService, 'forgotPassword');

      return request(app.getHttpServer())
        .put('/auth/forgot-password')
        .send(forgotPasswordDto)
        .expect(200);
    });
  });
});
