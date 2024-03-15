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
import { BuddyBuddeeTouchpointController } from '../../controllers/buddy-buddee-touchpoint.controller';
import { BuddyBuddeeTouchpointService } from '../../services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../fakes/buddy-buddee-touchpoint.fake';

describe('BuddyBuddeeTouchpoint', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const buddyBuddeeTouchpoint =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto();

  const mockBuddyBuddeeTouchpointService = {
    getMyTouchpoints: jest.fn(),
    createBuddyBuddeeTouchpoint: jest.fn(),
    createDraftBuddyBuddeeTouchpoint: jest.fn(),
    updateDraftBuddyBuddeeTouchpoint: jest.fn(),
    submitDraftBuddyBuddeeTouchpoint: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuddyBuddeeTouchpointController],
      providers: [
        {
          provide: BuddyBuddeeTouchpointService,
          useValue: mockBuddyBuddeeTouchpointService,
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

  describe('GET: /buddies/my-touch-points', () => {
    const pageOptionsDto =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
    const buddeeTouchpointDtoPageDtos =
      BuddyBuddeeTouchpointFake.buildBuddiesPageDto();

    it('User get touch-points of a buddy', () => {
      mockBuddyBuddeeTouchpointService.getMyTouchpoints = jest
        .fn()
        .mockResolvedValueOnce(buddeeTouchpointDtoPageDtos);

      return request(app.getHttpServer())
        .get('/buddies/my-touch-points')
        .send(pageOptionsDto)
        .expect(JSON.stringify(buddeeTouchpointDtoPageDtos))
        .expect(200);
    });
  });

  describe('POST: /buddies/touch-points', () => {
    it('User create touch-point of buddy and buddee', () => {
      const createTouchpointRequestDto =
        BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto();

      mockBuddyBuddeeTouchpointService.createBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValueOnce(buddyBuddeeTouchpoint);

      return request(app.getHttpServer())
        .post('/buddies/touch-points')
        .send(createTouchpointRequestDto)
        .expect(JSON.stringify(buddyBuddeeTouchpoint))
        .expect(201);
    });

    it('User create touch-point of buddy and buddee fail because variable value is empty and incorrect format', () => {
      const invalidCreateTouchpointRequestDto = {
        ...BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto(),
        buddyId: '1',
        buddeeId: '1',
        note: 1,
      };

      return request(app.getHttpServer())
        .post('/buddies/touch-points')
        .send(invalidCreateTouchpointRequestDto)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'buddyId must be a number conforming to the specified constraints',
              'buddeeId must be a number conforming to the specified constraints',
              'note must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('User create touch-point of buddy and buddee fail because note is empty', () => {
      const invalidCreateTouchpointRequestDto = {
        ...BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto(),
        note: '',
      };

      return request(app.getHttpServer())
        .post('/buddies/touch-points')
        .send(invalidCreateTouchpointRequestDto)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['note should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('POST: /buddies/touch-points/draft', () => {
    it('User create draft touch-point of buddy and buddee', () => {
      const createTouchpointRequestDto =
        BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto();

      mockBuddyBuddeeTouchpointService.createDraftBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValueOnce(buddyBuddeeTouchpoint);

      return request(app.getHttpServer())
        .post('/buddies/touch-points/draft')
        .send(createTouchpointRequestDto)
        .expect(JSON.stringify(buddyBuddeeTouchpoint))
        .expect(201);
    });

    it('User create draft touch-point of buddy and buddee fail because variable value is empty and incorrect format', () => {
      const invalidCreateTouchpointRequestDto = {
        ...BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto(),
        buddyId: '1',
        buddeeId: '1',
        note: 1,
      };

      return request(app.getHttpServer())
        .post('/buddies/touch-points/draft')
        .send(invalidCreateTouchpointRequestDto)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'buddyId must be a number conforming to the specified constraints',
              'buddeeId must be a number conforming to the specified constraints',
              'note must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('User create draft touch-point of buddy and buddee fail because note is empty', () => {
      const invalidCreateTouchpointRequestDto = {
        ...BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto(),
        note: '',
      };

      return request(app.getHttpServer())
        .post('/buddies/touch-points/draft')
        .send(invalidCreateTouchpointRequestDto)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['note should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /buddies/touch-points/draft/:id', () => {
    it('User update draft touch-point of buddy and buddee', () => {
      const updateTouchpointRequestDto =
        BuddyBuddeeTouchpointFake.buildUpdateBuddyBuddeeTouchpointRequestDto();

      mockBuddyBuddeeTouchpointService.updateDraftBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValueOnce(buddyBuddeeTouchpoint);

      return request(app.getHttpServer())
        .put('/buddies/touch-points/draft/1')
        .send(updateTouchpointRequestDto)
        .expect(JSON.stringify(buddyBuddeeTouchpoint))
        .expect(200);
    });

    it('User update draft touch-point of buddy and buddee fail because note not string', () => {
      const invalidUpdateTouchpointRequestDto = {
        ...BuddyBuddeeTouchpointFake.buildUpdateBuddyBuddeeTouchpointRequestDto(),
        note: 1,
      };

      return request(app.getHttpServer())
        .put('/buddies/touch-points/draft/1')
        .send(invalidUpdateTouchpointRequestDto)
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

  describe('PUT: /buddies/touch-points/:id', () => {
    it('User submit touch-point of buddy and buddee', () => {
      const updateTouchpointRequestDto =
        BuddyBuddeeTouchpointFake.buildUpdateBuddyBuddeeTouchpointRequestDto();

      mockBuddyBuddeeTouchpointService.submitDraftBuddyBuddeeTouchpoint = jest
        .fn()
        .mockResolvedValueOnce(buddyBuddeeTouchpoint);

      return request(app.getHttpServer())
        .put('/buddies/touch-points/1')
        .send(updateTouchpointRequestDto)
        .expect(JSON.stringify(buddyBuddeeTouchpoint))
        .expect(200);
    });

    it('User submit touch-point of buddy and buddee fail because note not string', () => {
      const invalidUpdateTouchpointRequestDto = {
        ...BuddyBuddeeTouchpointFake.buildUpdateBuddyBuddeeTouchpointRequestDto(),
        note: 1,
      };

      return request(app.getHttpServer())
        .put('/buddies/touch-points/1')
        .send(invalidUpdateTouchpointRequestDto)
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
