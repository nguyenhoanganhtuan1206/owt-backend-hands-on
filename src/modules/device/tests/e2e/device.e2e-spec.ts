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
import type { UserDto } from '../../../../modules/user/dtos/user.dto';
import type { UserEntity } from '../../../../modules/user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { DeviceController } from '../../controllers/device.controller';
import { DeviceService } from '../../services/device.service';
import { DeviceFake } from '../fakes/device.fake';

describe('Device', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const deviceAssigneeHistory = DeviceFake.buildDeviceAssigneeHistoryDto();
  const pageOptions = DeviceFake.buildDevicesPageOptionsDto();
  const assigneeHistoryDtosPageDto =
    DeviceFake.buildDeviceAssigneeHistoryDtosPageDto();

  const mockDeviceService = {
    getMyDevicesCurrentlyAssigned: jest.fn(),
    getDeviceAssignHistoryDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
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

  describe('GET: /devices', () => {
    it('Get list of current users logged into the currently assigned device', () => {
      mockDeviceService.getMyDevicesCurrentlyAssigned = jest
        .fn()
        .mockResolvedValueOnce(assigneeHistoryDtosPageDto);

      return request(app.getHttpServer())
        .get('/devices')
        .send(pageOptions)
        .expect(JSON.stringify(assigneeHistoryDtosPageDto))
        .expect(200);
    });
  });

  describe('GET: /devices/:deviceAssignId', () => {
    it('Get device assign detail by id', () => {
      mockDeviceService.getDeviceAssignHistoryDetail = jest
        .fn()
        .mockResolvedValueOnce(deviceAssigneeHistory);

      return request(app.getHttpServer())
        .get('/devices/1')
        .expect(JSON.stringify(deviceAssigneeHistory))
        .expect(200);
    });
  });
});
