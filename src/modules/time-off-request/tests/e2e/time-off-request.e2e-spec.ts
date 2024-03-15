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
import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import * as fileValidator from '../../../../validators/file.validator';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { TimeOffRequestController } from '../../controllers/time-off-request.controller';
import { TimeOffRequestService } from '../../services/time-off-request.service';
import { TimeOffRequestFake } from '../fakes/time-off-request.fake';

describe('TimeOffRequest', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const timeOffRequest = TimeOffRequestFake.buildTimeOffRequestDto();

  const mockTimeOffRequestService = {
    getTimeOffRequests: jest.fn(),
    getAllCollaborators: jest.fn(),
    getTimeOffRequestDetails: jest.fn(),
    createTimeOffRequest: jest.fn(),
    deleteTimeOffRequest: jest.fn(),
    getAccruedBalance: jest.fn(),
  };

  const mockAwsS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOffRequestController],
      providers: [
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
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

  describe('GET: /time-off-requests', () => {
    const pageOptionsDto =
      TimeOffRequestFake.buildTimeOffRequestsPageOptionsDto();
    const timeOffRequestDtos = TimeOffRequestFake.buildTimeOffRequestPageDto();

    it('Get current user login list time-off requests', () => {
      mockTimeOffRequestService.getTimeOffRequests = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequestDtos);

      return request(app.getHttpServer())
        .get('/time-off-requests')
        .send(pageOptionsDto)
        .expect(JSON.stringify(timeOffRequestDtos))
        .expect(200);
    });
  });

  describe('GET: /time-off-requests/accrued-balance', () => {
    it(`Get employee's accrued balance`, () => {
      const accruedBalance = 1;

      mockTimeOffRequestService.getAccruedBalance = jest
        .fn()
        .mockResolvedValueOnce(accruedBalance);

      return request(app.getHttpServer())
        .get('/time-off-requests/accrued-balance')
        .expect(JSON.stringify(accruedBalance))
        .expect(200);
    });
  });

  describe('POST: /time-off-requests/upload-file', () => {
    const expectedFileUrl = 'https://s3/time_off_request_attach_file/test.jpeg';
    const timeOffRequestFile = TimeOffRequestFake.buildTimeOffRequestIFile();

    it('User attach file for time-off request', () => {
      jest.spyOn(fileValidator, 'validateFileType');
      mockAwsS3Service.uploadFile = jest
        .fn()
        .mockResolvedValueOnce(expectedFileUrl);

      return request(app.getHttpServer())
        .post('/time-off-requests/upload-file')
        .attach('file', timeOffRequestFile.buffer, {
          filename: timeOffRequestFile.originalname,
          contentType: timeOffRequestFile.mimetype,
        })
        .expect({ s3Path: expectedFileUrl })
        .expect(201);
    });

    it('User attach file for time-off request fail because file is empty', () =>
      request(app.getHttpServer())
        .post('/time-off-requests/upload-file')
        .send(timeOffRequestFile)
        .expect(
          JSON.stringify({
            message: 'Cannot upload file is empty',
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400));
  });

  describe('GET: /time-off-requests/:timeOffRequestId', () => {
    it('User get time-off request by id', () => {
      mockTimeOffRequestService.getTimeOffRequestDetails = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .get('/time-off-requests/1')
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });
  });

  describe('POST: /time-off-requests', () => {
    it('create time-off request by user', () => {
      const createTimeOffRequest =
        TimeOffRequestFake.buildCreateTimeOffRequestDto();

      mockTimeOffRequestService.createTimeOffRequest = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .post('/time-off-requests')
        .send(createTimeOffRequest)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });

    it('create time-off request by user fail because variable value is empty and incorrect format', () => {
      const invalidCreateTimeOffRequest = {
        ...TimeOffRequestFake.buildCreateTimeOffRequestDto(),
        dateFrom: null,
        dateTo: null,
        dateType: '',
        totalDays: null,
        details: '',
        collaboratorId: '1',
      };

      return request(app.getHttpServer())
        .post('/time-off-requests/')
        .send(invalidCreateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'dateFrom must be a valid ISO 8601 date string',
              'dateFrom should not be empty',
              'dateTo must be a valid ISO 8601 date string',
              'dateTo should not be empty',
              'dateType should not be empty',
              'totalDays must be a number conforming to the specified constraints',
              'totalDays should not be empty',
              'details should not be empty',
              'collaboratorId must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('create time-off request by user fail because details length exceeds 1024 characters', () => {
      const invalidCreateTimeOffRequest = {
        ...TimeOffRequestFake.buildCreateTimeOffRequestDto(),
        details: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .post('/time-off-requests/')
        .send(invalidCreateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['details must be less than or equal to 1024 characters'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('DELETE: /time-off-requests/:timeOffRequestId', () => {
    it('User delete time-off request by id', () =>
      request(app.getHttpServer()).get('/time-off-requests/1').expect(200));
  });
});
