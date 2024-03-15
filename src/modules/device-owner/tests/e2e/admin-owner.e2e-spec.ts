import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { DeviceOwnerDto } from 'modules/device-owner/dtos/device-owner.dto';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminDeviceOwnerController } from '../../controllers/admin-owner.controller';
import { DeviceOwnerService } from '../../services/device-owner.service';
import { DeviceOwnerFake } from '../fakes/device-owner.fake';

describe('AdminDeviceOwner', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  let deviceOwner: DeviceOwnerDto;
  let deviceOwners: DeviceOwnerDto[];

  const mockDeviceOwnerService = {
    getAllDeviceOwners: jest.fn(),
    createDeviceOwner: jest.fn(),
    updateDeviceOwner: jest.fn(),
    deleteDeviceOwner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceOwnerController],
      providers: [
        {
          provide: DeviceOwnerService,
          useValue: mockDeviceOwnerService,
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
    deviceOwner = DeviceOwnerFake.buildDeviceOwnerDto();
    deviceOwners = [deviceOwner];

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /admin/devices/owners', () => {
    it('Get all device owners', () => {
      mockDeviceOwnerService.getAllDeviceOwners = jest
        .fn()
        .mockResolvedValueOnce(deviceOwners);

      return request(app.getHttpServer())
        .get('/admin/devices/owners')
        .expect(JSON.stringify(deviceOwners))
        .expect(200);
    });
  });

  describe('POST: /admin/devices/owners', () => {
    it('Create device owner', () => {
      const createDeviceOwner = DeviceOwnerFake.buildCreateDeviceOwnerDto();

      mockDeviceOwnerService.createDeviceOwner = jest
        .fn()
        .mockResolvedValueOnce(deviceOwner);

      return request(app.getHttpServer())
        .post('/admin/devices/owners')
        .send(createDeviceOwner)
        .expect(JSON.stringify(deviceOwner))
        .expect(200);
    });

    it('Create device owner fail because validating', () => {
      const invalidCreateDeviceOwner = {
        name: undefined,
      };

      return request(app.getHttpServer())
        .post('/admin/devices/owners')
        .send(invalidCreateDeviceOwner)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              "Device's owner name not exceed 100 characters",
              'name must be a string',
              'name should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/devices/owners/:ownerId', () => {
    it('Update device owner', () => {
      const updateDeviceOwner = DeviceOwnerFake.buildUpdateDeviceOwnerDto();

      mockDeviceOwnerService.updateDeviceOwner = jest
        .fn()
        .mockResolvedValueOnce(deviceOwner);

      return request(app.getHttpServer())
        .put('/admin/devices/owners/1')
        .send(updateDeviceOwner)
        .expect(JSON.stringify(deviceOwner))
        .expect(200);
    });

    it('Update device owner because validating', () => {
      const invalidUpdateDeviceOwner = {
        name: undefined,
      };

      return request(app.getHttpServer())
        .put('/admin/devices/owners/1')
        .send(invalidUpdateDeviceOwner)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              "Device's owner name not exceed 100 characters",
              'name must be a string',
              'name should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('DELETE: /admin/devices/owners/:ownerId', () => {
    it('Delete device owner', () =>
      request(app.getHttpServer())
        .delete('/admin/devices/owners/1')
        .expect(204));
  });
});
