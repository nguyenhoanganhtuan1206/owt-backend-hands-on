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
import { AdminAttendanceController } from '../../controllers/admin-attendance.controller';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceFake } from '../fakes/attendance.fake';

describe('AdminAttendance', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;

  const totalRequest = AttendanceFake.buildTotalRequestDto();
  const pageOptionsDto = AttendanceFake.buildOtherUsersPageOptionsDto();
  const otherUserDtos = AttendanceFake.buildOtherUserPageDto();

  const mockAttendanceService = {
    findTotalRequestsAllUsers: jest.fn().mockResolvedValue(totalRequest),
    getOtherUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
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

  describe('GET /admin/attendances/total-requests', () => {
    it('Get total requests for current admin, assistant login successfully', () =>
      request(app.getHttpServer())
        .get('/admin/attendances/total-requests')
        .expect(JSON.stringify(totalRequest))
        .expect(200));
  });

  describe('GET /admin/attendances/others', () => {
    it('Get list of people whose names are not shown on the other 3 tabs(in-office, time-off, wfh)', () => {
      mockAttendanceService.getOtherUsers = jest
        .fn()
        .mockResolvedValueOnce(otherUserDtos);

      return request(app.getHttpServer())
        .get('/admin/attendances/others')
        .send(pageOptionsDto)
        .expect(JSON.stringify(otherUserDtos))
        .expect(200);
    });
  });
});
