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
import type { BuddyPageOptionsDto } from '../../../buddy/dtos/buddy-page-options.dto';
import { BuddyFake } from '../../../buddy/tests/fakes/buddy.fake';
import type { BuddyBuddeeTouchpointEntity } from '../../../buddy-buddee-touchpoint/entities/buddy-buddee-touchpoint.entity';
import { BuddyBuddeeTouchpointService } from '../../../buddy-buddee-touchpoint/services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../../../buddy-buddee-touchpoint/tests/fakes/buddy-buddee-touchpoint.fake';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminBuddyBuddeePairController } from '../../controllers/admin-buddy-buddee-pair.controller';
import type { BuddyBuddeePairDto } from '../../dtos/buddy-buddee-pair.dto';
import { BuddyBuddeePairService } from '../../services/buddy-buddee-pair.service';
import { BuddyBuddeePairFake } from '../fakes/buddy-budee-pair.fake';

describe('AdminBuddyBuddeePair', () => {
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  let userDto: UserDto;
  let buddy: UserEntity;
  let buddee: UserEntity;
  let buddyBuddeePairDto: BuddyBuddeePairDto;
  let buddyBuddeePairs: BuddyBuddeePairDto[];
  let buddyPageOptions: BuddyPageOptionsDto;
  let buddyDtosPageDto: PageDto<BuddyBuddeePairDto>;
  let buddyBuddeeTouchpointEntity: BuddyBuddeeTouchpointEntity;
  let app: INestApplication;

  const mockBuddyBuddeePairService = {
    getBuddyPairs: jest.fn(),
    createBuddyPairs: jest.fn(),
    deleteBuddyPair: jest.fn(),
  };

  const mockBuddyBuddeeTouchpointService = {
    getTouchpointsByPairId: jest.fn(),
  };

  beforeEach(async () => {
    userDto = UserFake.buildUserDto();
    adminDto = UserFake.buildAdminDto();
    adminEntity = UserFake.buildUserEntity(adminDto);
    buddy = UserFake.buildUserEntity(userDto);
    buddee = UserFake.buildUserEntity(
      UserFake.buildUserDtoBy(2, 'buddee@gmail.com'),
    );
    buddyBuddeePairDto = BuddyBuddeePairFake.buildBuddyBuddeePairDto(
      buddy,
      buddee,
    );
    buddyBuddeePairs = [buddyBuddeePairDto];
    buddyPageOptions = BuddyFake.buildBuddyPageOptionsDto();
    buddyDtosPageDto = BuddyBuddeePairFake.buildBuddyBuddeePairDtosPageDto(
      buddy,
      buddee,
    );
    buddyBuddeeTouchpointEntity =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointEntity(
        BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
          buddy,
          buddee,
          TouchpointStatus.SUBMITTED,
        ),
      );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBuddyBuddeePairController],
      providers: [
        {
          provide: BuddyBuddeePairService,
          useValue: mockBuddyBuddeePairService,
        },
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

  describe('GET: /admin/buddies/pairs', () => {
    it('get pairs of buddy and buddees successfully', () => {
      mockBuddyBuddeePairService.getBuddyPairs = jest
        .fn()
        .mockResolvedValue(buddyDtosPageDto);

      return request(app.getHttpServer())
        .get('/admin/buddies/pairs')
        .send(buddyPageOptions)
        .expect(200)
        .expect(JSON.stringify(buddyDtosPageDto));
    });
  });

  describe('POST: /admin/buddies/pairs', () => {
    const buddyBuddeesPairRequestDto =
      BuddyBuddeePairFake.buildCreateBuddyBuddeesPairRequestDto();

    it('create pairs of buddy and buddees successfully', () => {
      mockBuddyBuddeePairService.createBuddyPairs = jest
        .fn()
        .mockResolvedValue(buddyBuddeePairs);

      return request(app.getHttpServer())
        .post('/admin/buddies/pairs')
        .send(buddyBuddeesPairRequestDto)
        .expect(201)
        .expect(JSON.stringify(buddyBuddeePairs));
    });

    it('create pairs of buddy and buddees fail because validating', () => {
      const invalidCreatePairRequest = {
        ...buddyBuddeesPairRequestDto,
        buddyId: undefined,
        buddeeIds: [],
      };

      return request(app.getHttpServer())
        .post('/admin/buddies/pairs')
        .send(invalidCreatePairRequest)
        .expect(
          JSON.stringify({
            message: [
              'buddyId must be a number conforming to the specified constraints',
              'buddeeIds should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('DELETE: /admin/buddies/pairs/:id', () => {
    it('delete a pair of buddy and buddee by id successfully', () =>
      request(app.getHttpServer())
        .delete(`/admin/buddies/pairs/${buddyBuddeePairDto.id}`)
        .expect(204));
  });

  describe('GET: /admin/buddies/pairs/:id/touch-points', () => {
    it('get touch-points of a pair successfully', () => {
      const pageOptions =
        BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
      const resultPage =
        BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDtoPageByTouchpoint(
          buddyBuddeeTouchpointEntity,
        );

      mockBuddyBuddeeTouchpointService.getTouchpointsByPairId = jest
        .fn()
        .mockResolvedValue(resultPage);

      return request(app.getHttpServer())
        .get('/admin/buddies/pairs/1/touch-points')
        .send(pageOptions)
        .expect(200)
        .expect(JSON.stringify(resultPage));
    });
  });
});
