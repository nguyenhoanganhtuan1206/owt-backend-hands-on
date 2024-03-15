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
import { AdminDeviceModelController } from '../../controllers/admin-model.controller';
import { CreateDeviceModelDto } from '../../dtos/create-device-model.dto';
import { DeviceModelDto } from '../../dtos/device-model.dto';
import { UpdateDeviceModelDto } from '../../dtos/update-device-model.dto';
import { DeviceModelService } from '../../services/device-model.service';
import { DeviceModelFake } from '../fakes/device-model.fake';

describe('AdminDeviceModel', () => {
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  let deviceModel: DeviceModelDto;
  let deviceModels: DeviceModelDto[];
  let app: INestApplication;

  const mockDeviceModelService = {
    getAllDeviceModels: jest.fn(),
    createDeviceModel: jest.fn(),
    updateDeviceModel: jest.fn(),
    deleteDeviceModel: jest.fn(),
  };

  beforeEach(async () => {
    adminDto = UserFake.buildAdminDto();
    adminEntity = UserFake.buildUserEntity(adminDto);
    deviceModel = DeviceModelFake.buildDeviceModelDto();
    deviceModels = [deviceModel];

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceModelController],
      providers: [
        {
          provide: DeviceModelService,
          useValue: mockDeviceModelService,
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

  describe('GET: /admin/devices/models', () => {
    it('get all device models successfully', () => {
      mockDeviceModelService.getAllDeviceModels = jest
        .fn()
        .mockResolvedValue(deviceModels);

      return request(app.getHttpServer())
        .get('/admin/devices/models')
        .expect(200)
        .expect(JSON.stringify(deviceModels));
    });
  });

  describe('POST: /admin/devices/models', () => {
    it('create device model successfully', () => {
      const createDeviceModelDto: CreateDeviceModelDto =
        DeviceModelFake.buildCreateDeviceModelDto();

      mockDeviceModelService.createDeviceModel = jest
        .fn()
        .mockResolvedValue(deviceModel);

      return request(app.getHttpServer())
        .post('/admin/devices/models')
        .send(createDeviceModelDto)
        .expect(200)
        .expect(JSON.stringify(deviceModel));
    });

    it('create device model fail because validating', () => {
      const createDeviceModelDto = { name: undefined, typeId: undefined };

      return request(app.getHttpServer())
        .post('/admin/devices/models')
        .send(createDeviceModelDto)
        .expect(
          JSON.stringify({
            message: [
              "Device's model name not exceed 100 characters",
              'name must be a string',
              'name should not be empty',
              'typeId must be a number conforming to the specified constraints',
              'typeId should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('PUT: /admin/devices/models/:modelId', () => {
    it('update device model successfully', () => {
      const updateDeviceModelDto: UpdateDeviceModelDto =
        DeviceModelFake.buildUpdateDeviceModelDto();

      mockDeviceModelService.updateDeviceModel = jest
        .fn()
        .mockResolvedValue(deviceModel);

      return request(app.getHttpServer())
        .put(`/admin/devices/models/${deviceModel.id}}`)
        .send(updateDeviceModelDto)
        .expect(200)
        .expect(JSON.stringify(deviceModel));
    });

    it('update device model fail because validating', () => {
      const updateDeviceModelDto = { name: undefined };

      return request(app.getHttpServer())
        .put(`/admin/devices/models/${deviceModel.id}}`)
        .send(updateDeviceModelDto)
        .expect(
          JSON.stringify({
            message: [
              "Device's model name not exceed 100 characters",
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

  describe('DELETE: /admin/devices/models/:modelId', () => {
    it('delete device model successfully', () =>
      request(app.getHttpServer())
        .delete(`/admin/devices/models/${deviceModel.id}}`)
        .expect(204));
  });
});
