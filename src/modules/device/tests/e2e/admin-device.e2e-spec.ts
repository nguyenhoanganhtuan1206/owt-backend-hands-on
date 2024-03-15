import {
  type CallHandler,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminDeviceController } from '../../controllers/admin-device.controller';
import { DeviceService } from '../../services/device.service';
import { DeviceFake } from '../fakes/device.fake';

describe('AdminDevice', () => {
  let app: INestApplication;

  const device = DeviceFake.buildDeviceDto();
  const deviceDtosPageDto = DeviceFake.buildDeviceDtosPageDto();
  const assigneeHistoryDtosPageDto =
    DeviceFake.buildDeviceAssigneeHistoryDtosPageDto();

  const adminDto = UserFake.buildAdminDto();
  const adminEntity = UserFake.buildUserEntity(adminDto);

  const mockDeviceService = {
    getAllDevices: jest.fn(),
    getDeviceDetails: jest.fn(),
    getAllDeviceAssignHistoriesById: jest.fn(),
    createDevice: jest.fn(),
    updateDevice: jest.fn(),
    deleteDevice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: mockDeviceService,
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

  describe('GET: /admin/devices', () => {
    it('should return all devices', async () => {
      jest
        .spyOn(mockDeviceService, 'getAllDevices')
        .mockReturnValueOnce(deviceDtosPageDto);

      return request(app.getHttpServer())
        .get('/admin/devices')
        .expect(JSON.stringify(deviceDtosPageDto))
        .expect(200);
    });
  });

  describe('GET: /admin/devices/:id', () => {
    it('should return device details by id', async () => {
      jest
        .spyOn(mockDeviceService, 'getDeviceDetails')
        .mockReturnValueOnce(device);

      return request(app.getHttpServer())
        .get('/admin/devices/1')
        .expect(JSON.stringify(device))
        .expect(200);
    });
  });

  describe('GET: admin/devices/:id/assignee-histories', () => {
    it('should return all assignee history of device', async () => {
      jest
        .spyOn(mockDeviceService, 'getAllDeviceAssignHistoriesById')
        .mockReturnValueOnce(assigneeHistoryDtosPageDto);

      return request(app.getHttpServer())
        .get('/admin/devices/1/assignee-histories')
        .expect(JSON.stringify(assigneeHistoryDtosPageDto))
        .expect(200);
    });
  });

  describe('POST: admin/devices', () => {
    const createDevice = DeviceFake.buildCreateDeviceDto();

    it('should create device', async () => {
      jest.spyOn(mockDeviceService, 'createDevice').mockReturnValueOnce(device);

      return request(app.getHttpServer())
        .post('/admin/devices')
        .send(createDevice)
        .expect(JSON.stringify(device))
        .expect(200);
    });

    it('create device fail because validation', async () => {
      jest.spyOn(mockDeviceService, 'createDevice').mockReturnValueOnce(device);

      return request(app.getHttpServer())
        .post('/admin/devices')
        .expect(
          JSON.stringify({
            message: [
              'typeId must be a number conforming to the specified constraints',
              'typeId should not be empty',
              'modelId must be a number conforming to the specified constraints',
              'modelId should not be empty',
              'Serial number is too long',
              'serialNumber must be a string',
              'serialNumber should not be empty',
              'detail must be a string',
              'detail should not be empty',
              'status should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('PUT: /admin/devices/:id', () => {
    const updateDeviceDto = DeviceFake.buildUpdateDeviceDto();

    it('should update device by id', async () => {
      jest.spyOn(mockDeviceService, 'updateDevice').mockReturnValueOnce(device);

      return request(app.getHttpServer())
        .put('/admin/devices/1')
        .send(updateDeviceDto)
        .expect(JSON.stringify(device))
        .expect(200);
    });

    it('should update device fail because validation', async () => {
      jest.spyOn(mockDeviceService, 'updateDevice').mockReturnValueOnce(device);

      return request(app.getHttpServer())
        .put('/admin/devices/1')
        .expect(
          JSON.stringify({
            message: [
              'typeId must be a number conforming to the specified constraints',
              'typeId should not be empty',
              'modelId must be a number conforming to the specified constraints',
              'modelId should not be empty',
              'Serial number is too long',
              'serialNumber must be a string',
              'serialNumber should not be empty',
              'detail must be a string',
              'detail should not be empty',
              'status should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });
});
