/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import type { PageDto } from '../../../../common/dto/page.dto';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { DeviceRepairRequestController } from '../../controllers/repair-request.controller';
import type { CreateRepairRequestDto } from '../../dtos/create-repair-request.dto';
import type { RepairRequestDto } from '../../dtos/repair-request.dto';
import type { RepairRequestPageOptionsDto } from '../../dtos/repair-request-page-options.dto';
import { RepairRequestService } from '../../services/repair-request.service';
import { RepairRequestFake } from '../fakes/repair-request.fake';

describe('DeviceRepairRequest', () => {
  let userDto: UserDto;
  let userEntity: UserEntity;
  let repairRequestPageOptionsDto: RepairRequestPageOptionsDto;
  let repairRequestPageDto: PageDto<RepairRequestDto>;
  let createRepairRequestDto: CreateRepairRequestDto;
  let repairRequestDto: RepairRequestDto;
  let app: INestApplication;

  const mockRepairRequestService = {
    getRepairRequestsOfDevice: jest.fn(),
    createRepairRequest: jest.fn(),
  };

  beforeEach(async () => {
    userDto = UserFake.buildUserDto();
    userEntity = UserFake.buildUserEntity(userDto);
    repairRequestPageOptionsDto =
      RepairRequestFake.buildRepairRequestPageOptionsDto();
    repairRequestPageDto = RepairRequestFake.buildRepairRequestDtosPageDto();
    createRepairRequestDto = RepairRequestFake.buildCreateRepairRequestDto();
    repairRequestDto = RepairRequestFake.buildRepairRequestDto();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceRepairRequestController],
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

  describe('GET: /devices/repair-requests/:deviceId', () => {
    it('get list repair requests of device is assigned successfully', () => {
      mockRepairRequestService.getRepairRequestsOfDevice = jest
        .fn()
        .mockResolvedValue(repairRequestPageDto);

      return request(app.getHttpServer())
        .get('/devices/repair-requests/1')
        .send(repairRequestPageOptionsDto)
        .expect(200)
        .expect(JSON.stringify(repairRequestPageDto));
    });
  });

  describe('POST: /devices/repair-requests/:deviceId', () => {
    it('create repair request successfully', () => {
      mockRepairRequestService.createRepairRequest = jest
        .fn()
        .mockResolvedValue(repairRequestDto);

      return request(app.getHttpServer())
        .post('/devices/repair-requests/1')
        .send(createRepairRequestDto)
        .expect(200)
        .expect(JSON.stringify(repairRequestDto));
    });

    it('create repair request fail because validating', () => {
      const createRepairRequest = {
        ...createRepairRequestDto,
        reason: undefined,
      };

      return request(app.getHttpServer())
        .post('/devices/repair-requests/1')
        .send(createRepairRequest)
        .expect(
          JSON.stringify({
            message: ['reason must be a string', 'reason should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });
});
