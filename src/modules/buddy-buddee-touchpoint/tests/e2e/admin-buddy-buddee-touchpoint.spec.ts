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
import { TouchpointStatus } from '../../../../constants/touchpoint-status';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import type { BuddyBuddeeTouchpointDto } from '../../../buddy-buddee-touchpoint/dtos/buddy-buddee-touchpoint.dto';
import type { BuddyBuddeeTouchpointPageOptionsDto } from '../../../buddy-buddee-touchpoint/dtos/buddy-buddee-touchpoint-page-options.dto';
import type { CreateBuddyBuddeeTouchpointRequestDto } from '../../../buddy-buddee-touchpoint/dtos/create-buddy-buddee-touchpoint-request.dto';
import type { UpdateBuddyBuddeeTouchpointRequestDto } from '../../../buddy-buddee-touchpoint/dtos/update-buddy-buddee-touchpoint-request.dto';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { BuddyBuddeeTouchpointService } from '../../services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../fakes/buddy-buddee-touchpoint.fake';
import { AdminBuddyBuddeeTouchpointController } from './../../controllers/admin-buddy-buddee-touchpoint.controller';

describe('AdminBuddyBuddeeTouchpoint', () => {
  let userDto: UserDto;
  let buddy: UserEntity;
  let buddee: UserEntity;
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  let buddyBuddeeTouchpointDraft: BuddyBuddeeTouchpointDto;
  let buddyBuddeeTouchpointSubmited: BuddyBuddeeTouchpointDto;
  let buddeeTouchpointPageOptions: BuddyBuddeeTouchpointPageOptionsDto;
  let buddeeTouchpointDtoPageDto: PageDto<BuddyBuddeeTouchpointDto>;
  let createBuddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto;
  let updateBuddyBuddeeTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto;
  let app: INestApplication;

  const mockBuddyBuddeeTouchpointService = {
    getBuddyPairTouchpoints: jest.fn(),
    createBuddyBuddeeTouchpoint: jest.fn(),
    createDraftBuddyBuddeeTouchpoint: jest.fn(),
    updateDraftBuddyBuddeeTouchpoint: jest.fn(),
    submitDraftBuddyBuddeeTouchpoint: jest.fn(),
  };

  beforeEach(async () => {
    userDto = UserFake.buildUserDto();

    buddy = UserFake.buildUserEntity(userDto);
    buddee = UserFake.buildUserEntity(
      UserFake.buildUserDtoBy(2, 'buddee@gmail.com'),
    );
    adminDto = UserFake.buildAdminDto();
    adminEntity = UserFake.buildUserEntity(adminDto);
    buddyBuddeeTouchpointDraft =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
        buddy,
        buddee,
        TouchpointStatus.DRAFT,
      );
    buddyBuddeeTouchpointSubmited =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
        buddy,
        buddee,
        TouchpointStatus.SUBMITTED,
      );

    buddeeTouchpointPageOptions =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
    buddeeTouchpointDtoPageDto =
      BuddyBuddeeTouchpointFake.buildBuddiesPageDto();

    createBuddyBuddeeTouchpointRequestDto =
      BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto();

    updateBuddyBuddeeTouchpointRequestDto =
      BuddyBuddeeTouchpointFake.buildUpdateBuddyBuddeeTouchpointRequestDto();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBuddyBuddeeTouchpointController],
      providers: [
        {
          provide: BuddyBuddeeTouchpointService,
          useValue: mockBuddyBuddeeTouchpointService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
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

  describe('GET: /admin/buddies/touch-points', () => {
    it('get latest touchpoint of buddy and buddee pair successfully', () => {
      mockBuddyBuddeeTouchpointService.getBuddyPairTouchpoints = jest
        .fn()
        .mockResolvedValue(buddeeTouchpointDtoPageDto);

      return request(app.getHttpServer())
        .get('/admin/buddies/touch-points')
        .send(buddeeTouchpointPageOptions)
        .expect(200)
        .expect(JSON.stringify(buddeeTouchpointDtoPageDto));
    });
  });

  describe('POST: /admin/buddies/touch-points', () => {
    it('create touchpoint of buddy and buddee successfully', () => {
      mockBuddyBuddeeTouchpointService.createBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValue(buddyBuddeeTouchpointSubmited);

      return request(app.getHttpServer())
        .post('/admin/buddies/touch-points')
        .send(createBuddyBuddeeTouchpointRequestDto)
        .expect(201)
        .expect(JSON.stringify(buddyBuddeeTouchpointSubmited));
    });

    it('create touchpoint of buddy and buddee fail because validating', () => {
      const buddyBuddeeTouchpointRequest = {
        ...createBuddyBuddeeTouchpointRequestDto,
        buddyId: undefined,
        buddeeId: undefined,
        note: undefined,
        visible: 'test',
      };

      return request(app.getHttpServer())
        .post('/admin/buddies/touch-points')
        .send(buddyBuddeeTouchpointRequest)
        .expect(
          JSON.stringify({
            message: [
              'buddyId must be a number conforming to the specified constraints',
              'buddeeId must be a number conforming to the specified constraints',
              'note must be a string',
              'note should not be empty',
              'visible must be a boolean value',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('POST: /admin/buddies/touch-points/draft', () => {
    it('create draft touchpoint of buddy and buddee successfully', () => {
      mockBuddyBuddeeTouchpointService.createDraftBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValue(buddyBuddeeTouchpointDraft);

      return request(app.getHttpServer())
        .post('/admin/buddies/touch-points/draft')
        .send(createBuddyBuddeeTouchpointRequestDto)
        .expect(201)
        .expect(JSON.stringify(buddyBuddeeTouchpointDraft));
    });

    it('create draft touchpoint of buddy and buddee fail because validating', () => {
      const buddyBuddeeTouchpointRequest = {
        ...createBuddyBuddeeTouchpointRequestDto,
        buddyId: undefined,
        buddeeId: undefined,
        note: undefined,
        visible: 'test',
      };

      return request(app.getHttpServer())
        .post('/admin/buddies/touch-points/draft')
        .send(buddyBuddeeTouchpointRequest)
        .expect(
          JSON.stringify({
            message: [
              'buddyId must be a number conforming to the specified constraints',
              'buddeeId must be a number conforming to the specified constraints',
              'note must be a string',
              'note should not be empty',
              'visible must be a boolean value',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('PUT: /admin/buddies/touch-points/draft', () => {
    it('update draft touchpoint of buddy and buddee successfully', () => {
      mockBuddyBuddeeTouchpointService.updateDraftBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValue(buddyBuddeeTouchpointDraft);

      return request(app.getHttpServer())
        .put('/admin/buddies/touch-points/draft/1')
        .send(updateBuddyBuddeeTouchpointRequestDto)
        .expect(200)
        .expect(JSON.stringify(buddyBuddeeTouchpointDraft));
    });

    it('update draft touchpoint of buddy and budde fail because validating', () => {
      const buddyBuddeeTouchpointRequest = {
        ...updateBuddyBuddeeTouchpointRequestDto,
        note: 123,
        visible: 'test',
      };

      return request(app.getHttpServer())
        .put('/admin/buddies/touch-points/draft/1')
        .send(buddyBuddeeTouchpointRequest)
        .expect(
          JSON.stringify({
            message: [
              'note must be a string',
              'visible must be a boolean value',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('PUT: /admin/buddies/touch-points', () => {
    it('submit draft touchpoint of buddy and buddee successfully', () => {
      mockBuddyBuddeeTouchpointService.submitDraftBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValue(buddyBuddeeTouchpointSubmited);

      return request(app.getHttpServer())
        .put('/admin/buddies/touch-points/1')
        .send(updateBuddyBuddeeTouchpointRequestDto)
        .expect(200)
        .expect(JSON.stringify(buddyBuddeeTouchpointSubmited));
    });

    it('submit draft touchpoint of buddy and budde fail because validating', () => {
      const buddyBuddeeTouchpointRequest = {
        ...updateBuddyBuddeeTouchpointRequestDto,
        note: 123,
        visible: 'test',
      };

      return request(app.getHttpServer())
        .put('/admin/buddies/touch-points/1')
        .send(buddyBuddeeTouchpointRequest)
        .expect(
          JSON.stringify({
            message: [
              'note must be a string',
              'visible must be a boolean value',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });
});
