import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import { ProfileController } from '../../controllers/profile.controller';
import type { PasswordDto } from '../../dtos/password.dto';
import type { UpdateIntroductionDto } from '../../dtos/update-introduction.dto';
import type UpdateProfileDto from '../../dtos/update-profile.dto';
import type { UserDto } from '../../dtos/user.dto';
import type { UserEntity } from '../../entities/user.entity';
import { CvService } from '../../services/cv.service';
import { UserService } from '../../services/user.service';
import { UserFake } from '../fakes/user.fake';

describe('Profile', () => {
  let userDto: UserDto;
  let userEntity: UserEntity;
  let app: INestApplication;

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
    userDto = UserFake.buildUserDto();
    userEntity = UserFake.buildUserEntity(userDto);
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
    })
      .overrideGuard(AuthGuard) // mock @AuthUser() decorator
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = userEntity;

          return req.user;
        },
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

  describe('GET: /profile', () => {
    it('getUser successfully', () => {
      mockUserService.getUserById = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .get('/profile')
        .expect(200)
        .expect(JSON.stringify(userDto));
    });
  });

  describe('PUT: /profile', () => {
    it('updateProfile successfully', () => {
      const validUpdateProfileDto: UpdateProfileDto = {
        address: 'Da Nang',
        phoneNo: '123456789',
      };
      mockUserService.updateProfile = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .put('/profile')
        .send(validUpdateProfileDto)
        .expect(200)
        .expect(JSON.stringify(userDto));
    });
  });

  describe('POST: /profile/avatar', () => {
    const buffer = Buffer.from('some data');

    it('update avatar successfully', () => {
      const s3Path = 's3Path';
      mockS3Service.uploadFile = jest.fn().mockResolvedValue(s3Path);

      return request(app.getHttpServer())
        .post(`/profile/avatar`)
        .attach('file', buffer, 'image.png')
        .expect(JSON.stringify({ s3Path }))
        .expect(201);
    });
  });

  describe('POST: /profile/cv', () => {
    const buffer = Buffer.from('some data');

    it('update cv successfully', () => {
      const s3Path = 's3Path';
      mockS3Service.uploadFile = jest.fn().mockResolvedValue(s3Path);

      return request(app.getHttpServer())
        .post(`/profile/avatar`)
        .attach('file', buffer, 'image.png')
        .expect(JSON.stringify({ s3Path }))
        .expect(201);
    });
  });

  describe('PUT: /profile/change-password', () => {
    it('changePassword successfully', () => {
      const validChangePasswordDto: PasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'Sontra@357',
      };

      return request(app.getHttpServer())
        .put(`/profile/change-password`)
        .send(validChangePasswordDto)
        .expect(200);
    });

    it('changePassword fail because new password is weak', () => {
      const validChangePasswordDto: PasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'weak',
      };

      return request(app.getHttpServer())
        .put(`/profile/change-password`)
        .send(validChangePasswordDto)
        .expect(
          JSON.stringify({
            message: 'Password is not strong enough',
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /profile/introduction', () => {
    it('update introduction successfully', () => {
      const updateIntroductionDto: UpdateIntroductionDto = {
        introduction: 'hi im a free dancer',
      };
      mockUserService.updateIntroduction = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .put('/profile/introduction')
        .send(updateIntroductionDto)
        .expect(200)
        .expect(JSON.stringify(userDto));
    });

    it('update introduction fail because introduction in empty', () => {
      const updateIntroductionDto: UpdateIntroductionDto = {
        introduction: '',
      };
      mockUserService.updateIntroduction = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .put('/profile/introduction')
        .send(updateIntroductionDto)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['introduction should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });
});
