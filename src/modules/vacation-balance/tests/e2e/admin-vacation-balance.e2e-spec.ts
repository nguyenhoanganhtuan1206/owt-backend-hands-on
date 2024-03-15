import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { UserDto } from 'modules/user/dtos/user.dto';
import type { UserEntity } from 'modules/user/entities/user.entity';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { TimeOffRequestService } from '../../../time-off-request/services/time-off-request.service';
import { TimeOffRequestFake } from '../../../time-off-request/tests/fakes/time-off-request.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminVacationBalanceController } from '../../controllers/admin-vacation-balance.controller';
import { VacationBalanceService } from '../../services/vacation-balance.service';
import { VacationBalanceFake } from '../fakes/vacation-balance.fake';

describe('AdminVacationBalance', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const allowance = VacationBalanceFake.buildAllowanceDto();
  const updateAllowance = VacationBalanceFake.buildUpdateAllowanceDto();

  const mockVacationBalanceService = {
    getAllVacationBalances: jest.fn(),
    updateTotalAllowances: jest.fn(),
  };

  const mockTimeOffRequestService = {
    getTimeOffRequests: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminVacationBalanceController],
      providers: [
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
        },
        {
          provide: VacationBalanceService,
          useValue: mockVacationBalanceService,
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

  describe('GET: /admin/vacation-balances', () => {
    const pageOptions = VacationBalanceFake.buildAllowancePageOptionsDto();
    const allowancePageDto = VacationBalanceFake.buildAllowancePageDto();

    it('Get all vacation balances', () => {
      mockVacationBalanceService.getAllVacationBalances = jest
        .fn()
        .mockResolvedValueOnce(allowancePageDto);

      return request(app.getHttpServer())
        .get('/admin/vacation-balances')
        .send(pageOptions)
        .expect(JSON.stringify(allowancePageDto))
        .expect(200);
    });
  });

  describe('GET: /admin/vacation-balances/:userId', () => {
    const pageOptionsDto =
      TimeOffRequestFake.buildTimeOffRequestsPageOptionsDto();
    const timeOffRequestDtos = TimeOffRequestFake.buildTimeOffRequestPageDto();

    it('Get list time-off requests by userI', () => {
      mockTimeOffRequestService.getTimeOffRequests = jest
        .fn()
        .mockResolvedValueOnce(timeOffRequestDtos);

      return request(app.getHttpServer())
        .get('/admin/vacation-balances/1')
        .send(pageOptionsDto)
        .expect(JSON.stringify(timeOffRequestDtos))
        .expect(200);
    });
  });

  describe('PUT: /admin/vacation-balances', () => {
    it('Update total allowance for the user by admin', () => {
      mockVacationBalanceService.updateTotalAllowances = jest
        .fn()
        .mockResolvedValueOnce(allowance);

      return request(app.getHttpServer())
        .put('/admin/vacation-balances')
        .send(updateAllowance)
        .expect(JSON.stringify(allowance))
        .expect(200);
    });

    it('Update total allowance by Admin fail because userId is string', () => {
      const updateAllowanceFail = {
        ...updateAllowance,
        userId: 'string',
        total: 20,
      };

      return request(app.getHttpServer())
        .put('/admin/vacation-balances')
        .send(updateAllowanceFail)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'userId must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update total allowance by Admin fail because userId is empty', () => {
      const updateAllowanceFail = {
        ...updateAllowance,
        userId: null,
        total: 20,
      };

      return request(app.getHttpServer())
        .put('/admin/vacation-balances')
        .send(updateAllowanceFail)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'userId should not be empty',
              'userId must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update total allowance by Admin fail because total is string', () => {
      const updateAllowanceFail = {
        ...updateAllowance,
        userId: 1,
        total: 'string',
      };

      return request(app.getHttpServer())
        .put('/admin/vacation-balances')
        .send(updateAllowanceFail)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'Total allowance cannot be less than 0',
              'Total allowance must be an integer',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update total allowance by Admin fail because total is empty', () => {
      const updateAllowanceFail = {
        ...updateAllowance,
        userId: 1,
        total: null,
      };

      return request(app.getHttpServer())
        .put('/admin/vacation-balances')
        .send(updateAllowanceFail)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'total should not be empty',
              'Total allowance cannot be less than 0',
              'Total allowance must be an integer',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('Update total allowance by Admin fail because total is less than 0', () => {
      const updateAllowanceFail = {
        ...updateAllowance,
        userId: 1,
        total: -1,
      };

      return request(app.getHttpServer())
        .put('/admin/vacation-balances')
        .send(updateAllowanceFail)
        .expect(400)
        .expect(
          JSON.stringify({
            message: ['Total allowance cannot be less than 0'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });
});
