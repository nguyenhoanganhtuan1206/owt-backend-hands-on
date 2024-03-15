/* eslint-disable @typescript-eslint/consistent-type-imports */
import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { PageDto } from '../../../../common/dto/page.dto';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { BuddyBuddeeTouchpointFake } from '../../../buddy-buddee-touchpoint/tests/fakes/buddy-buddee-touchpoint.fake';
import { UserDto } from '../../../user/dtos/user.dto';
import { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminBuddyController } from '../../controllers/admin-buddy.controller';
import { BuddyDto } from '../../dtos/buddy.dto';
import { CreateBuddyRequestDto } from '../../dtos/create-buddy-request.dto';
import { BuddyService } from '../../services/buddy.service';
import { BuddyFake } from '../fakes/buddy.fake';

describe('AdminBuddy', () => {
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  let buddyPageDto: PageDto<BuddyDto>;
  let buddyDto: BuddyDto;
  let app: INestApplication;

  const mockBuddyService = {
    getBuddies: jest.fn(),
    createBuddy: jest.fn(),
    deleteBuddy: jest.fn(),
  };

  beforeEach(async () => {
    buddyPageDto = BuddyBuddeeTouchpointFake.buildBuddiesPageDto();
    buddyDto = BuddyFake.buildBuddyDto();
    adminDto = UserFake.buildAdminDto();
    adminEntity = UserFake.buildUserEntity(adminDto);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBuddyController],
      providers: [
        {
          provide: BuddyService,
          useValue: mockBuddyService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // mock @UseGuards(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = adminEntity;

          return req.user;
        },
      })
      .overrideGuard(RolesGuard)
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

  describe('GET: /admin/buddies', () => {
    it('get buddies successfully', () => {
      mockBuddyService.getBuddies = jest.fn().mockResolvedValue(buddyPageDto);

      return request(app.getHttpServer())
        .get('/admin/buddies')
        .expect(200)
        .expect(JSON.stringify(buddyPageDto));
    });
  });

  describe('POST: /admin/buddies', () => {
    it('create buddy successfully', () => {
      const buddyRequestDto: CreateBuddyRequestDto = {
        userId: buddyDto.buddy.id,
      };

      mockBuddyService.createBuddy = jest.fn().mockResolvedValue(buddyDto);

      return request(app.getHttpServer())
        .post('/admin/buddies')
        .send(buddyRequestDto)
        .expect(201)
        .expect(JSON.stringify(buddyDto));
    });

    it('create buddy fail because validating', () => {
      const buddyRequestDto = { userId: undefined };

      return request(app.getHttpServer())
        .post('/admin/buddies')
        .send(buddyRequestDto)
        .expect(
          JSON.stringify({
            message: [
              'userId must be a number conforming to the specified constraints',
              'userId should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('DELETE: /admin/buddies/:id', () => {
    it('delete buddy successfully', () =>
      request(app.getHttpServer())
        .delete(`/admin/buddies/${buddyDto.id}`)
        .expect(204));
  });
});
