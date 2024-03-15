import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import request from 'supertest';

import type { PageDto } from '../../../../common/dto/page.dto';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
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

describe('AdminUser', () => {
  let app: INestApplication;
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  let userDto: UserDto;
  let expectedUserDtos: PageDto<UserDto>;

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
    getListAssistants: jest.fn(),
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
    })
      .overrideGuard(AuthGuard) // mock @AuthUser() decorator
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = adminEntity;

          return req.user;
        },
      })
      .overrideGuard(JwtAuthGuard) // mock @UseGuards(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = adminEntity;

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

    adminDto = UserFake.buildAdminDto();
    adminEntity = UserFake.buildUserEntity(adminDto);
    userDto = UserFake.buildUserDto();
    expectedUserDtos = UserFake.buildUsersPageDto();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /admin/users/find-coaches', () => {
    it('find users successfully', () => {
      mockUserService.findUsersByKeyword = jest
        .fn()
        .mockResolvedValue([userDto]);

      return request(app.getHttpServer())
        .get('/admin/users/find-coaches?keyword=something')
        .expect(JSON.stringify([userDto]))
        .expect(200);
    });
  });

  describe('GET: /admin/users', () => {
    it('get users successfully', () => {
      mockUserService.getUsersWithoutPageDto = jest
        .fn()
        .mockResolvedValue([userDto]);

      return request(app.getHttpServer())
        .get('/admin/users')
        .expect(JSON.stringify([userDto]))
        .expect(200);
    });
  });

  describe('GET: /admin/users/assistants', () => {
    it('get assistants successfully', () => {
      mockUserService.getListAssistants = jest
        .fn()
        .mockResolvedValue(expectedUserDtos);

      return request(app.getHttpServer())
        .get('/admin/users/assistants')
        .expect(JSON.stringify(expectedUserDtos))
        .expect(200);
    });
  });

  describe('GET: /admin/users/positions', () => {
    it('get positions successfully', () => {
      mockUserService.findAllPositions = jest
        .fn()
        .mockResolvedValue([UserFake.buildPositionDto()]);

      return request(app.getHttpServer())
        .get('/admin/users/positions')
        .expect(JSON.stringify([UserFake.buildPositionDto()]))
        .expect(200);
    });
  });

  describe('GET: /admin/users/levels', () => {
    it('get levels successfully', () => {
      mockUserService.findAllLevels = jest
        .fn()
        .mockResolvedValue([UserFake.buildLevelDto()]);

      return request(app.getHttpServer())
        .get('/admin/users/levels')
        .expect(JSON.stringify([UserFake.buildLevelDto()]))
        .expect(200);
    });
  });

  describe('POST: /admin/users', () => {
    it('create user successfully', () => {
      const userCreationDto = plainToInstance(UserCreationDto, {
        ...userDto,
        positionId: 1,
        levelId: 1,
      });

      mockUserService.createUser = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .post('/admin/users')
        .send(userCreationDto)
        .expect(JSON.stringify(userDto))
        .expect(200);
    });

    it('create user fail because validating', () => {
      const userCreationDto = plainToInstance(UserCreationDto, userDto);

      mockUserService.createUser = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .post('/admin/users')
        .send(userCreationDto)
        .expect(
          JSON.stringify({
            message: [
              'positionId should not be empty',
              'levelId should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('PUT: /admin/users/:userId', () => {
    it('update user successfully', () => {
      const userUpdateDto = plainToInstance(UpdateUserDto, {
        ...userDto,
        positionId: 1,
        levelId: 1,
      });

      mockUserService.updateUser = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .put('/admin/users/1')
        .send(userUpdateDto)
        .expect(JSON.stringify(userDto))
        .expect(200);
    });

    it('update user fail because validating', () => {
      const userCreationDto = plainToInstance(UserCreationDto, userDto);

      mockUserService.createUser = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .post('/admin/users')
        .send(userCreationDto)
        .expect(
          JSON.stringify({
            message: [
              'positionId should not be empty',
              'levelId should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('GET: /admin/users/:userId', () => {
    it('get user details successfully', () => {
      mockUserService.getUserById = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .get('/admin/users/1')
        .expect(JSON.stringify(userDto))
        .expect(200);
    });
  });

  describe('DELETE: /admin/users/:userId', () => {
    it('deactivate user profile successfully', () =>
      request(app.getHttpServer()).delete('/admin/users/1').expect(200));
  });

  describe('PUT: /admin/users/:userId/introduction', () => {
    it('update introduction successfully', () => {
      const updateIntroductionDto: UpdateIntroductionDto = {
        introduction: 'hi im a free dancer',
      };
      mockUserService.updateIntroduction = jest.fn().mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .put('/admin/users/1/introduction')
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
        .put('/admin/users/1/introduction')
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

  describe('PUT: /admin/users/:userId/custom-position', () => {
    it('update position successfully', () => {
      const updateIntroductionDto: UpdateCustomPositionDto = {
        customPosition: 'free dancer',
      };
      mockUserService.updateCustomPosition = jest
        .fn()
        .mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .put('/admin/users/1/custom-position')
        .send(updateIntroductionDto)
        .expect(200)
        .expect(JSON.stringify(userDto));
    });

    it('update introduction fail because introduction in empty', () => {
      const updateIntroductionDto: UpdateCustomPositionDto = {
        customPosition: '',
      };
      mockUserService.updateCustomPosition = jest
        .fn()
        .mockResolvedValue(userDto);

      return request(app.getHttpServer())
        .put('/admin/users/1/custom-position')
        .send(updateIntroductionDto)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['customPosition should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });
});
