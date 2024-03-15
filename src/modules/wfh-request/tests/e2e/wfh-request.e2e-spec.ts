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
import { WfhRequestController } from '../../controllers/wfh-request.controller';
import { WfhRequestService } from '../../services/wfh-request.service';
import { WfhRequestFake } from '../fakes/wfh-request.fake';

describe('WfhRequest', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const wfhRequest = WfhRequestFake.buildWfhRequestDto();

  const mockWfhRequestService = {
    getAllWfhRequests: jest.fn(),
    createWfhRequest: jest.fn(),
    deleteWfhRequest: jest.fn(),
    getWfhRequestDetails: jest.fn(),
  };

  const mockAwsS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WfhRequestController],
      providers: [
        {
          provide: WfhRequestService,
          useValue: mockWfhRequestService,
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

  describe('GET: /wfh-requests', () => {
    const pageOptionsDto = WfhRequestFake.buildWfhRequestsPageOptionsDto();
    const wfhRequestDtos = WfhRequestFake.buildWfhRequestPageDto();

    it('Get current user login list wfh requests', () => {
      mockWfhRequestService.getAllWfhRequests = jest
        .fn()
        .mockResolvedValueOnce(wfhRequestDtos);

      return request(app.getHttpServer())
        .get('/wfh-requests')
        .send(pageOptionsDto)
        .expect(JSON.stringify(wfhRequestDtos))
        .expect(200);
    });
  });

  describe('POST: /wfh-requests', () => {
    it('User create wfh request', () => {
      const createWfhRequest = WfhRequestFake.buildCreateWfhRequestDto();

      mockWfhRequestService.createWfhRequest = jest
        .fn()
        .mockResolvedValueOnce(wfhRequest);

      return request(app.getHttpServer())
        .post('/wfh-requests')
        .send(createWfhRequest)
        .expect(JSON.stringify(wfhRequest))
        .expect(200);
    });

    it('User create wfh request fail because variable value is empty and incorrect format', () => {
      const invalidCreateWfhRequest = {
        ...WfhRequestFake.buildCreateWfhRequestDto(),
        dateFrom: null,
        dateTo: null,
        dateType: '',
        totalDays: null,
        details: '',
        attachedFile: 1,
      };

      return request(app.getHttpServer())
        .post('/wfh-requests')
        .send(invalidCreateWfhRequest)
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
              'attachedFile must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('User create wfh request fail because details length exceeds 1024 characters', () => {
      const invalidCreateWfhRequest = {
        ...WfhRequestFake.buildCreateWfhRequestDto(),
        details: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .post('/wfh-requests')
        .send(invalidCreateWfhRequest)
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

  describe('DELETE: /wfh-requests/:id', () => {
    it('User delete wfh request by id', () =>
      request(app.getHttpServer()).get('/wfh-requests/1').expect(200));
  });

  describe('POST: /wfh-requests/upload-file', () => {
    const expectedFileUrl = 'https://s3/wfh_request_attach_file/test.jpeg';
    const wfhRequestFile = WfhRequestFake.buildWfhRequestIFile();

    it('User upload file for wfh request', () => {
      jest.spyOn(fileValidator, 'validateFileType');
      mockAwsS3Service.uploadFile = jest
        .fn()
        .mockResolvedValueOnce(expectedFileUrl);

      return request(app.getHttpServer())
        .post('/wfh-requests/upload-file')
        .attach('file', wfhRequestFile.buffer, {
          filename: wfhRequestFile.originalname,
          contentType: wfhRequestFile.mimetype,
        })
        .expect({ s3Path: expectedFileUrl })
        .expect(201);
    });

    it('User upload file for wfh request fail because file is empty', () =>
      request(app.getHttpServer())
        .post('/wfh-requests/upload-file')
        .send(wfhRequestFile)
        .expect(
          JSON.stringify({
            message: 'Cannot upload file is empty',
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400));
  });

  describe('GET: /wfh-requests/:id', () => {
    it('User get wfh request by id', () => {
      mockWfhRequestService.getWfhRequestDetails = jest
        .fn()
        .mockResolvedValueOnce(wfhRequest);

      return request(app.getHttpServer())
        .get('/wfh-requests/1')
        .expect(JSON.stringify(wfhRequest))
        .expect(200);
    });
  });
});
