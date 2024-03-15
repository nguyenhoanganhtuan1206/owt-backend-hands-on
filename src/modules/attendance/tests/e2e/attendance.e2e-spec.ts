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
import { AttendanceController } from '../../../../modules/attendance/controllers/attendance.controller';
import { AttendanceService } from '../../../../modules/attendance/services/attendance.service';
import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AttendanceFake } from '../fakes/attendance.fake';

describe('Attendance', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;

  const mockAttendanceService = {
    findTotalRequestsForUser: jest.fn(),
  };

  const mockAwsS3Service = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
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

  describe('GET: /attendances/total-requests', () => {
    it('Get total requests for current user login', () => {
      const totalRequest = AttendanceFake.buildTotalRequestDto();

      mockAttendanceService.findTotalRequestsForUser = jest
        .fn()
        .mockResolvedValueOnce(totalRequest);

      return request(app.getHttpServer())
        .get('/attendances/total-requests')
        .expect(JSON.stringify(totalRequest))
        .expect(200);
    });
  });

  describe('DELETE: /attendances/delete-file', () => {
    it('Delete attach file by user login', () => {
      const deleteFile = AttendanceFake.buildDeleteFileDto();

      return request(app.getHttpServer())
        .delete('/attendances/delete-file')
        .send(deleteFile)
        .expect(200);
    });

    it('Delete attach file by user login fail because fileUrl is empty', () => {
      const invalidDeleteFile = { fileUrl: '' };

      return request(app.getHttpServer())
        .delete('/attendances/delete-file')
        .send(invalidDeleteFile)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['fileUrl should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Delete attach file by user login fail because fileUrl is not string', () => {
      const invalidDeleteFile = { fileUrl: 1 };

      return request(app.getHttpServer())
        .delete('/attendances/delete-file')
        .send(invalidDeleteFile)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['fileUrl must be a string'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });
});
