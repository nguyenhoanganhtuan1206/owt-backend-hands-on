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
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminTimeOffRequestController } from '../../controllers/admin-time-off-request.controller';
import { TimeOffRequestService } from '../../services/time-off-request.service';
import { TimeOffRequestFake } from '../fakes/time-off-request.fake';

describe('AdminTimeOffRequest', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const timeOffRequest = TimeOffRequestFake.buildTimeOffRequestDto();

  const mockTimeOffRequestService = {
    getAllTimeOffRequests: jest.fn(),
    getAllCollaborators: jest.fn(),
    approveTimeOffRequestByPM: jest.fn(),
    refuseTimeOffRequestByPM: jest.fn(),
    getTimeOffRequestDetailsByPM: jest.fn(),
    getTimeOffRequestDetails: jest.fn(),
    sendEmailToPM: jest.fn(),
    sendEmailToAssistant: jest.fn(),
    approveTimeOffRequestByAdminOrAssistant: jest.fn(),
    refuseTimeOffRequestByAdminOrAssistant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTimeOffRequestController],
      providers: [
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
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

  describe('GET: /admin/time-off-requests', () => {
    const pageOptionsDto =
      TimeOffRequestFake.buildTimeOffRequestsPageOptionsDto();
    const timeOffRequestDtos = TimeOffRequestFake.buildTimeOffRequestPageDto();

    it('Get all time-off requests by Admin/Assistant', () => {
      mockTimeOffRequestService.getAllTimeOffRequests = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequestDtos);

      return request(app.getHttpServer())
        .get('/admin/time-off-requests')
        .send(pageOptionsDto)
        .expect(JSON.stringify(timeOffRequestDtos))
        .expect(200);
    });
  });

  describe('PUT: /admin/time-off-requests/pm/approve', () => {
    it('Approve time-off request by PM', () => {
      const externalAccess = TimeOffRequestFake.buildExternalUserAccessDto();

      mockTimeOffRequestService.approveTimeOffRequestByPM = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/approve')
        .send(externalAccess)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });

    it('Approve time-off request by PM fail because accessToken is empty', () => {
      const externalAccess = {
        ...TimeOffRequestFake.buildExternalUserAccessDto(),
        accessToken: '',
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/approve')
        .send(externalAccess)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['accessToken should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Approve time-off request by PM fail because variable value is not string', () => {
      const externalAccess = {
        accessToken: 123,
        pmNote: 123,
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/approve')
        .send(externalAccess)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'accessToken must be a string',
              'pmNote must be less than or equal to 1024 characters',
              'pmNote must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Approve time-off request by PM fail because pmNote length exceeds 1024 characters', () => {
      const externalAccess = {
        accessToken: 'validAccessToken',
        pmNote: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/approve')
        .send(externalAccess)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['pmNote must be less than or equal to 1024 characters'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/time-off-requests/pm/refuse', () => {
    it('Update status refuse to time-off request by PM', () => {
      const externalAccess = TimeOffRequestFake.buildExternalUserAccessDto();

      mockTimeOffRequestService.refuseTimeOffRequestByPM = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/refuse')
        .send(externalAccess)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });

    it('Update status refuse to time-off request by PM fail because accessToken is empty', () => {
      const externalAccess = {
        ...TimeOffRequestFake.buildExternalUserAccessDto(),
        accessToken: '',
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/refuse')
        .send(externalAccess)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['accessToken should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update status refuse to time-off request by PM fail because variable value is not string', () => {
      const externalAccess = {
        accessToken: 123,
        pmNote: 123,
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/refuse')
        .send(externalAccess)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'accessToken must be a string',
              'pmNote must be less than or equal to 1024 characters',
              'pmNote must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update status refuse to time-off request by PM fail because pmNote length exceeds 1024 characters', () => {
      const externalAccess = {
        accessToken: 'accessToken',
        pmNote: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/pm/refuse')
        .send(externalAccess)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['pmNote must be less than or equal to 1024 characters'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('GET: /admin/time-off-requests/external/details', () => {
    it('Get details time-off request by PM', () => {
      const externalToken = 'externalToken';

      mockTimeOffRequestService.getTimeOffRequestDetailsByPM = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .get('/admin/time-off-requests/external/details')
        .send(externalToken)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });
  });

  describe('GET: /admin/time-off-requests/:timeOffRequestId', () => {
    it('Get details time-off request of user by Admin/Assistant', () => {
      mockTimeOffRequestService.getTimeOffRequestDetails = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .get('/admin/time-off-requests/1')
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });
  });

  describe('PUT: /admin/time-off-requests/:timeOffRequestId/email-pm', () => {
    it('Send email confirm time-off request to Project Manager', () => {
      const updateTimeOffRequest =
        TimeOffRequestFake.buildUpdateTimeOffRequestDto();

      mockTimeOffRequestService.sendEmailToPM = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-pm')
        .send(updateTimeOffRequest)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });

    it('Send email confirm time-off request to Project Manager fail because variable value is not number', () => {
      const updateTimeOffRequest = {
        ...TimeOffRequestFake.buildUpdateTimeOffRequestDto(),
        collaboratorId: '1',
        assistantId: '1',
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-pm')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'collaboratorId must be a number conforming to the specified constraints',
              'assistantId must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Send email confirm time-off request to Project Manager fail because variable value is not string', () => {
      const updateTimeOffRequest = {
        assistantAttachFile: 123,
        adminNote: 123,
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-pm')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'assistantAttachFile must be a string',
              'adminNote must be less than or equal to 1024 characters',
              'adminNote must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Send email confirm time-off request to Project Manager fail because adminNote length exceeds 1024 characters', () => {
      const updateTimeOffRequest = {
        adminNote: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-pm')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'adminNote must be less than or equal to 1024 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/time-off-requests/:timeOffRequestId/email-assistant', () => {
    it('Send email confirm time-off request to Assistant', () => {
      const updateTimeOffRequest =
        TimeOffRequestFake.buildUpdateTimeOffRequestDto();

      mockTimeOffRequestService.sendEmailToAssistant = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-assistant')
        .send(updateTimeOffRequest)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });

    it('Send email confirm time-off request to Assistant fail because variable value is not number', () => {
      const updateTimeOffRequest = {
        ...TimeOffRequestFake.buildUpdateTimeOffRequestDto(),
        collaboratorId: '1',
        assistantId: '1',
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-assistant')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'collaboratorId must be a number conforming to the specified constraints',
              'assistantId must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Send email confirm time-off request to Assistant fail because variable value is not string', () => {
      const updateTimeOffRequest = {
        assistantAttachFile: 123,
        adminNote: 123,
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-assistant')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'assistantAttachFile must be a string',
              'adminNote must be less than or equal to 1024 characters',
              'adminNote must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Send email confirm time-off request to Assistant fail because adminNote length exceeds 1024 characters', () => {
      const updateTimeOffRequest = {
        adminNote: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/email-assistant')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'adminNote must be less than or equal to 1024 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/time-off-requests/:timeOffRequestId/approve', () => {
    it('Update status approve to time-off request by Admin/Assistant', () => {
      const updateTimeOffRequest =
        TimeOffRequestFake.buildUpdateTimeOffRequestDto();

      mockTimeOffRequestService.approveTimeOffRequestByAdminOrAssistant = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/approve')
        .send(updateTimeOffRequest)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });

    it('Update status approve to time-off request by Admin/Assistant fail because variable value is not number', () => {
      const updateTimeOffRequest = {
        ...TimeOffRequestFake.buildUpdateTimeOffRequestDto(),
        collaboratorId: '1',
        assistantId: '1',
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/approve')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'collaboratorId must be a number conforming to the specified constraints',
              'assistantId must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update status approve to time-off request by Admin/Assistant fail because variable value is not string', () => {
      const updateTimeOffRequest = {
        assistantAttachFile: 123,
        adminNote: 123,
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/approve')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'assistantAttachFile must be a string',
              'adminNote must be less than or equal to 1024 characters',
              'adminNote must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update status approve to time-off request by Admin/Assistant fail because adminNote length exceeds 1024 characters', () => {
      const updateTimeOffRequest = {
        adminNote: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/approve')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'adminNote must be less than or equal to 1024 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/time-off-requests/:timeOffRequestId/refuse', () => {
    it('Update status refuse to time-off request by Admin/Assistant', () => {
      const updateTimeOffRequest =
        TimeOffRequestFake.buildUpdateTimeOffRequestDto();

      mockTimeOffRequestService.refuseTimeOffRequestByAdminOrAssistant = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequest);

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/refuse')
        .send(updateTimeOffRequest)
        .expect(JSON.stringify(timeOffRequest))
        .expect(200);
    });

    it('Update status refuse to time-off request by Admin/Assistant fail because variable value is not number', () => {
      const updateTimeOffRequest = {
        ...TimeOffRequestFake.buildUpdateTimeOffRequestDto(),
        collaboratorId: '1',
        assistantId: '1',
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/refuse')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'collaboratorId must be a number conforming to the specified constraints',
              'assistantId must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update status refuse to time-off request by Admin/Assistant fail because variable value is not string', () => {
      const updateTimeOffRequest = {
        assistantAttachFile: 123,
        adminNote: 123,
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/refuse')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'assistantAttachFile must be a string',
              'adminNote must be less than or equal to 1024 characters',
              'adminNote must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update status refuse to time-off request by Admin/Assistant fail because adminNote length exceeds 1024 characters', () => {
      const updateTimeOffRequest = {
        adminNote: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .put('/admin/time-off-requests/1/refuse')
        .send(updateTimeOffRequest)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'adminNote must be less than or equal to 1024 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });
});
