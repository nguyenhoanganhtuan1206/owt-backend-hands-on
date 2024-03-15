/* eslint-disable @typescript-eslint/consistent-type-imports */
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
import { UserDto } from '../../../user/dtos/user.dto';
import { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminDeviceTypeController } from '../../controllers/admin-type.controller';
import { CreateDeviceTypeDto } from '../../dtos/create-device-type.dto';
import { DeviceTypeDto } from '../../dtos/device-type.dto';
import { UpdateDeviceTypeDto } from '../../dtos/update-device-type.dto';
import { DeviceTypeService } from '../../services/device-type.service';
import { DeviceTypeFake } from '../fakes/device-type.fake';

describe('AdminDeviceType', () => {
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  let deviceType: DeviceTypeDto;
  let deviceTypes: DeviceTypeDto[];
  let app: INestApplication;

  const mockDeviceTypeService = {
    getAllDeviceTypes: jest.fn(),
    createDeviceType: jest.fn(),
    updateDeviceType: jest.fn(),
    deleteDeviceType: jest.fn(),
  };

  beforeEach(async () => {
    adminDto = UserFake.buildAdminDto();
    adminEntity = UserFake.buildUserEntity(adminDto);
    deviceType = DeviceTypeFake.buildDeviceTypeDto();
    deviceTypes = [deviceType];

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceTypeController],
      providers: [
        {
          provide: DeviceTypeService,
          useValue: mockDeviceTypeService,
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
      .overrideGuard(RolesGuard)
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

  describe('GET: /admin/devices/types', () => {
    it('get all device types successfully', () => {
      mockDeviceTypeService.getAllDeviceTypes = jest
        .fn()
        .mockResolvedValue(deviceTypes);

      return request(app.getHttpServer())
        .get('/admin/devices/types')
        .expect(200)
        .expect(JSON.stringify(deviceTypes));
    });
  });

  describe('POST: /admin/devices/types', () => {
    it('create device type successfully', () => {
      const createDeviceTypeDto: CreateDeviceTypeDto =
        DeviceTypeFake.buildCreateDeviceTypeDto();

      mockDeviceTypeService.createDeviceType = jest
        .fn()
        .mockResolvedValue(deviceType);

      return request(app.getHttpServer())
        .post('/admin/devices/types')
        .send(createDeviceTypeDto)
        .expect(200)
        .expect(JSON.stringify(deviceType));
    });

    it('create device type fail because validating', () => {
      const createDeviceTypeDto = { name: undefined };

      return request(app.getHttpServer())
        .post('/admin/devices/types')
        .send(createDeviceTypeDto)
        .expect(
          JSON.stringify({
            message: [
              "Device's type name not exceed 100 characters",
              'name must be a string',
              'name should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('PUT: /admin/devices/types/:typeId', () => {
    it('update device type successfully', () => {
      const updateDeviceTypeDto: UpdateDeviceTypeDto =
        DeviceTypeFake.buildUpdateDeviceTypeDto();

      mockDeviceTypeService.updateDeviceType = jest
        .fn()
        .mockResolvedValue(deviceType);

      return request(app.getHttpServer())
        .put(`/admin/devices/types/${deviceType.id}}`)
        .send(updateDeviceTypeDto)
        .expect(200)
        .expect(JSON.stringify(deviceType));
    });

    it('update device type fail because validating', () => {
      const updateDeviceTypeDto = { name: undefined };

      return request(app.getHttpServer())
        .put(`/admin/devices/types/${deviceType.id}}`)
        .send(updateDeviceTypeDto)
        .expect(
          JSON.stringify({
            message: [
              "Device's type name not exceed 100 characters",
              'name must be a string',
              'name should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('DELETE: /admin/devices/types/:typeId', () => {
    it('delete device type successfully', () =>
      request(app.getHttpServer())
        .delete(`/admin/devices/types/${deviceType.id}}`)
        .expect(204));
  });
});
