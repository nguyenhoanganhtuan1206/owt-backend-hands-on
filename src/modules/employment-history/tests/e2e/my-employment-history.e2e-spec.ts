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
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyEmploymentHistoryController } from '../../controllers/my-employment-history.controller';
import { EmploymentHistoryService } from '../../services/employment-history.service';
import { EmploymentHistoryFake } from '../fakes/employment-history.fake';

describe('MyEmploymentHistory', () => {
  let app: INestApplication;

  const userDto = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userDto);
  const employmentHistory =
    EmploymentHistoryFake.buildEmploymentHistoryEntity(userEntity);

  const mockEmploymentHistoryService = {
    getEmploymentHistoryByUserId: jest.fn(),
    createEmploymentHistory: jest.fn(),
    deleteEmploymentHistory: jest.fn(),
    updateEmploymentHistoriesPositions: jest.fn(),
    updateToggleEmploymentHistory: jest.fn(),
    updateEmploymentHistories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyEmploymentHistoryController],
      providers: [
        {
          provide: EmploymentHistoryService,
          useValue: mockEmploymentHistoryService,
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

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /my-employment-histories', () => {
    it('should return list of my employment histories successfully', async () => {
      mockEmploymentHistoryService.getEmploymentHistoryByUserId = jest
        .fn()
        .mockResolvedValue([employmentHistory]);

      return request(app.getHttpServer())
        .get('/my-employment-histories')
        .expect(JSON.stringify([employmentHistory]))
        .expect(200);
    });
  });

  describe('POST: /my-employment-histories', () => {
    it('should create my employment history successfully', async () => {
      mockEmploymentHistoryService.createEmploymentHistory = jest
        .fn()
        .mockResolvedValue(employmentHistory);
      const createEmploymentHistoryDto =
        EmploymentHistoryFake.buildCreateEmploymentHistoryDto();

      return request(app.getHttpServer())
        .post('/my-employment-histories')
        .send(createEmploymentHistoryDto)
        .expect(JSON.stringify(employmentHistory))
        .expect(200);
    });
  });

  describe('DELETE: /my-employment-histories/:id', () => {
    it('should delete my employment history successfully', async () => {
      mockEmploymentHistoryService.deleteEmploymentHistory = jest.fn();

      return request(app.getHttpServer())
        .delete('/my-employment-histories/1')
        .expect(200);
    });
  });

  describe('PUT: /my-employment-histories/positions', () => {
    it('should update position of my employment history successfully', async () => {
      mockEmploymentHistoryService.updateEmploymentHistoriesPositions = jest
        .fn()
        .mockResolvedValue([employmentHistory]);
      const updateEmploymentHistoryPositionDto =
        EmploymentHistoryFake.buildUpdateEmploymentHistoryPositionDto(
          employmentHistory.id,
        );

      return request(app.getHttpServer())
        .put('/my-employment-histories/positions')
        .send(updateEmploymentHistoryPositionDto)
        .expect(200);
    });
  });

  describe('PUT: /my-employment-histories/:id/toggle', () => {
    it('should update tick/untick checkbox of my employment history successfully', async () => {
      mockEmploymentHistoryService.updateToggleEmploymentHistory = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      return request(app.getHttpServer())
        .put('/my-employment-histories/1/toggle')
        .expect(200);
    });
  });

  describe('PUT: /my-employment-histories', () => {
    it('should update my employment histories successfully', async () => {
      const updateEmploymentHistoryDto =
        EmploymentHistoryFake.buildUpdateEmploymentHistoryDto(
          employmentHistory.id,
        );

      return request(app.getHttpServer())
        .put('/my-employment-histories')
        .send(updateEmploymentHistoryDto)
        .expect(200);
    });
  });
});
