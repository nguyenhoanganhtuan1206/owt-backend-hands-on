import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { UserDto } from 'modules/user/dtos/user.dto';
import type { UserEntity } from 'modules/user/entities/user.entity';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { UserFake } from '../../../../modules/user/tests/fakes/user.fake';
import { AdminTimeTrackingController } from '../../controllers/admin-time-tracking.controller';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { TimeTrackingFake } from '../fakes/time-tracking.fake';

describe('AdminTimeTracking', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;

  const pageOptions = TimeTrackingFake.buildTimeTrackingsPageOptionsDto();
  const timeTrackingDtosPageDto =
    TimeTrackingFake.buildTimeTrackingDtosPageDto();
  const userTimekeeper = TimeTrackingFake.buildUserTimekeeperDto();
  const userTimekeepers = [userTimekeeper];

  const mockTimeTrackingService = {
    getTimeTrackings: jest.fn(),
    getUserTimekeepers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTimeTrackingController],
      providers: [
        {
          provide: TimeTrackingService,
          useValue: mockTimeTrackingService,
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

    userDto = UserFake.buildUserDto();
    userEntity = UserFake.buildUserEntity(userDto);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET /admin/time-trackings', () => {
    it('Get list time trackings for all user successfully', () => {
      mockTimeTrackingService.getTimeTrackings = jest
        .fn()
        .mockResolvedValueOnce(timeTrackingDtosPageDto);

      return request(app.getHttpServer())
        .get('/admin/time-trackings')
        .send(pageOptions)
        .expect(JSON.stringify(timeTrackingDtosPageDto))
        .expect(200);
    });
  });

  describe('GET /admin/time-trackings/users', () => {
    it('Get list users timekeeper', () => {
      mockTimeTrackingService.getUserTimekeepers = jest
        .fn()
        .mockResolvedValueOnce(userTimekeepers);

      return request(app.getHttpServer())
        .get('/admin/time-trackings/users')
        .expect(JSON.stringify(userTimekeepers))
        .expect(200);
    });
  });
});
