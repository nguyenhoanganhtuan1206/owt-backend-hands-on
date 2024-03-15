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

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { BuddyBuddeePairFake } from '../../../buddy-buddee-pair/tests/fakes/buddy-budee-pair.fake';
import { BuddyBuddeeTouchpointService } from '../../../buddy-buddee-touchpoint/services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../../../buddy-buddee-touchpoint/tests/fakes/buddy-buddee-touchpoint.fake';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyBuddeeController } from '../../controllers/my-buddee.controller';

describe('MyBuddee', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;

  const mockBuddyBuddeeTouchpointService = {
    getMyBuddees: jest.fn(),
    getTouchpointsByBuddyIdAndBuddeeId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyBuddeeController],
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

  describe('GET: /buddies/my-buddees', () => {
    const pageOptionsDto = BuddyBuddeePairFake.buildBuddiesPageOptionsDto();
    const buddeeTouchpointDtoPageDtos =
      BuddyBuddeeTouchpointFake.buildBuddiesPageDto();

    it('User get my buddees and latest touch-point', () => {
      mockBuddyBuddeeTouchpointService.getMyBuddees = jest
        .fn()
        .mockResolvedValueOnce(buddeeTouchpointDtoPageDtos);

      return request(app.getHttpServer())
        .get('/buddies/my-buddees')
        .send(pageOptionsDto)
        .expect(JSON.stringify(buddeeTouchpointDtoPageDtos))
        .expect(200);
    });
  });

  describe('GET: /buddies/my-buddees/:buddeeId/touch-points', () => {
    const pageOptionsDto =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
    const buddeeTouchpointDtoPageDtos =
      BuddyBuddeeTouchpointFake.buildBuddiesPageDto();

    it('User get touch-points of a buddee', () => {
      mockBuddyBuddeeTouchpointService.getTouchpointsByBuddyIdAndBuddeeId = jest
        .fn()
        .mockResolvedValueOnce(buddeeTouchpointDtoPageDtos);

      return request(app.getHttpServer())
        .get('/buddies/my-buddees/1/touch-points')
        .send(pageOptionsDto)
        .expect(JSON.stringify(buddeeTouchpointDtoPageDtos))
        .expect(200);
    });
  });
});
