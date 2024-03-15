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
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminDeviceRepairHistoryController } from '../../controllers/admin-device-repair-history.controller';
import { RepairHistoryService } from '../../services/repair-history.service';
import { RepairHistoryFake } from '../fakes/repair-history.fake';

describe('AdminDeviceRepairHistory', () => {
  let app: INestApplication;

  const expectedRepairHistoryDtos =
    RepairHistoryFake.buildRepairHistoryDtosPageDto();
  const repairHistory = RepairHistoryFake.buildRepairHistoryDto();
  const createDeviceRepairHistoryDto =
    RepairHistoryFake.buildCreateDeviceRepairHistoryDto();

  const adminDto = UserFake.buildAdminDto();
  const adminEntity = UserFake.buildUserEntity(adminDto);

  const mockRepairHistoryService = {
    getAllDeviceRepairHistories: jest.fn(),
    createDeviceRepairHistory: jest.fn(),
    deleteDeviceRepairHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceRepairHistoryController],
      providers: [
        {
          provide: RepairHistoryService,
          useValue: mockRepairHistoryService,
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

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe(`GET: /admin/devices/:deviceId/repair-histories`, () => {
    it('should return a page of repair history', async () => {
      jest
        .spyOn(mockRepairHistoryService, 'getAllDeviceRepairHistories')
        .mockReturnValue(expectedRepairHistoryDtos);

      return request(app.getHttpServer())
        .get('/admin/devices/1/repair-histories')
        .expect(JSON.stringify(expectedRepairHistoryDtos))
        .expect(200);
    });
  });

  describe('POST: /admin/devices/repair-histories', () => {
    it('should create repair history', async () => {
      jest
        .spyOn(mockRepairHistoryService, 'createDeviceRepairHistory')
        .mockReturnValue(repairHistory);

      return request(app.getHttpServer())
        .post('/admin/devices/repair-histories')
        .send(createDeviceRepairHistoryDto)
        .expect(JSON.stringify(repairHistory))
        .expect(200);
    });
  });

  describe('DELETE: /admin/devices/repair-histories/:repairHistoryId', () => {
    it('should delete device repair history', async () => {
      jest.spyOn(mockRepairHistoryService, 'deleteDeviceRepairHistory');

      return request(app.getHttpServer())
        .del('/admin/devices/repair-histories/1')
        .expect(204);
    });
  });
});
