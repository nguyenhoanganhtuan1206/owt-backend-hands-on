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
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminWfhRequestController } from '../../controllers/admin-wfh-request.controller';
import { WfhRequestService } from '../../services/wfh-request.service';
import { WfhRequestFake } from '../fakes/wfh-request.fake';

describe('AdminWfhRequest', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const wfhRequest = WfhRequestFake.buildWfhRequestDto();

  const mockWfhRequestService = {
    getAllWfhRequests: jest.fn(),
    approveWfhRequest: jest.fn(),
    refuseWfhRequest: jest.fn(),
    getWfhRequestDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminWfhRequestController],
      providers: [
        {
          provide: WfhRequestService,
          useValue: mockWfhRequestService,
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

  describe('GET: /admin/wfh-requests', () => {
    const pageOptionsDto = WfhRequestFake.buildWfhRequestsPageOptionsDto();
    const wfhRequestDtos = WfhRequestFake.buildWfhRequestPageDto();

    it('Get all wfh requests', () => {
      mockWfhRequestService.getAllWfhRequests = jest
        .fn()
        .mockResolvedValueOnce(wfhRequestDtos);

      return request(app.getHttpServer())
        .get('/admin/wfh-requests')
        .send(pageOptionsDto)
        .expect(JSON.stringify(wfhRequestDtos))
        .expect(200);
    });
  });

  describe('PUT: /admin/wfh-requests/:wfhRequestId/approve', () => {
    it('Update status approve to wfh request', () => {
      mockWfhRequestService.approveWfhRequest = jest
        .fn()
        .mockResolvedValueOnce(wfhRequest);

      return request(app.getHttpServer())
        .put('/admin/wfh-requests/1/approve')
        .expect(JSON.stringify(wfhRequest))
        .expect(200);
    });
  });

  describe('PUT: /admin/wfh-requests/:wfhRequestId/refuse', () => {
    it('Update status refuse to wfh request', () => {
      mockWfhRequestService.refuseWfhRequest = jest
        .fn()
        .mockResolvedValueOnce(wfhRequest);

      return request(app.getHttpServer())
        .put('/admin/wfh-requests/1/refuse')
        .expect(JSON.stringify(wfhRequest))
        .expect(200);
    });
  });

  describe('GET: /admin/wfh-requests/:userId/:wfhRequestId', () => {
    it('Get details wfh request of user', () => {
      mockWfhRequestService.getWfhRequestDetails = jest
        .fn()
        .mockResolvedValueOnce(wfhRequest);

      return request(app.getHttpServer())
        .get('/admin/wfh-requests/1/1')
        .expect(JSON.stringify(wfhRequest))
        .expect(200);
    });
  });
});
