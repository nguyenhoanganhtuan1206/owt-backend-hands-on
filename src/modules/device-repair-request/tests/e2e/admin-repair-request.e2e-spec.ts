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
import { AdminDeviceRepairRequestController } from '../../controllers/admin-repair-request.controller';
import { RepairRequestService } from '../../services/repair-request.service';
import { RepairRequestFake } from '../fakes/repair-request.fake';

describe('AdminDeviceRepairRequest', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const repairRequest = RepairRequestFake.buildRepairRequestDto();

  const mockRepairRequestService = {
    getAllRepairRequests: jest.fn(),
    getPendingRequests: jest.fn(),
    getRepairRequestDetails: jest.fn(),
    approveRepairRequest: jest.fn(),
    refuseRepairRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceRepairRequestController],
      providers: [
        {
          provide: RepairRequestService,
          useValue: mockRepairRequestService,
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

  describe('GET: /admin/devices/repair-requests', () => {
    const pageOptionsDto = RepairRequestFake.buildRepairRequestPageOptionsDto();
    const repairRequestDtos = RepairRequestFake.buildRepairRequestDtosPageDto();

    it('Get all repair requests', () => {
      mockRepairRequestService.getAllRepairRequests = jest
        .fn()
        .mockResolvedValueOnce(repairRequestDtos);

      return request(app.getHttpServer())
        .get('/admin/devices/repair-requests')
        .send(pageOptionsDto)
        .expect(JSON.stringify(repairRequestDtos))
        .expect(200);
    });
  });

  describe('GET: /admin/devices/repair-requests/pending-requests', () => {
    const pendingRequest = RepairRequestFake.buildPendingRequestDto();

    it('Get total pending requests for current user login', () => {
      mockRepairRequestService.getPendingRequests = jest
        .fn()
        .mockResolvedValueOnce(pendingRequest);

      return request(app.getHttpServer())
        .get('/admin/devices/repair-requests/pending-requests')
        .expect(JSON.stringify(pendingRequest))
        .expect(200);
    });
  });

  describe('GET: /admin/devices/repair-requests/:requestId', () => {
    it('Get repair request detail by id', () => {
      mockRepairRequestService.getRepairRequestDetails = jest
        .fn()
        .mockResolvedValueOnce(repairRequest);

      return request(app.getHttpServer())
        .get('/admin/devices/repair-requests/1')
        .expect(JSON.stringify(repairRequest))
        .expect(200);
    });
  });

  describe('PUT: /admin/devices/repair-requests/:requestId/approve', () => {
    it('Update status approve to repair request', () => {
      const updateRepairRequestStatus =
        RepairRequestFake.buildUpdateRepairRequestStatusDto();

      mockRepairRequestService.approveRepairRequest = jest
        .fn()
        .mockResolvedValueOnce(repairRequest);

      return request(app.getHttpServer())
        .put('/admin/devices/repair-requests/1/approve')
        .send(updateRepairRequestStatus)
        .expect(JSON.stringify(repairRequest))
        .expect(200);
    });

    it('Update status approve to repair request fail because note not string', () => {
      const invalidUpdateRepairRequestStatus = { note: 1 };

      return request(app.getHttpServer())
        .put('/admin/devices/repair-requests/1/approve')
        .send(invalidUpdateRepairRequestStatus)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['note must be a string'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/devices/repair-requests/:requestId/refuse', () => {
    it('Update status refuse to repair request', () => {
      const updateRepairRequestStatus =
        RepairRequestFake.buildUpdateRepairRequestStatusDto();

      mockRepairRequestService.refuseRepairRequest = jest
        .fn()
        .mockResolvedValueOnce(repairRequest);

      return request(app.getHttpServer())
        .put('/admin/devices/repair-requests/1/refuse')
        .send(updateRepairRequestStatus)
        .expect(JSON.stringify(repairRequest))
        .expect(200);
    });

    it('Update status refuse to repair request fail because note not string', () => {
      const invalidUpdateRepairRequestStatus = { note: 1 };

      return request(app.getHttpServer())
        .put('/admin/devices/repair-requests/1/refuse')
        .send(invalidUpdateRepairRequestStatus)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['note must be a string'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });
});
