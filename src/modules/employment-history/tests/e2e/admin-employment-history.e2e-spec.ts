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
import { AdminEmploymentHistoryController } from '../../controllers/admin-employment-history.controller';
import { EmploymentHistoryService } from '../../services/employment-history.service';
import { EmploymentHistoryFake } from '../fakes/employment-history.fake';

describe('AdminEmploymentHistory', () => {
  let app: INestApplication;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const employmentHistory =
    EmploymentHistoryFake.buildEmploymentHistoryEntity(userEntity);
  const employmentHistoryDto = EmploymentHistoryFake.buildEmploymentHistoryDto(
    userLogin,
    employmentHistory.id,
  );
  const employmentHistories = [employmentHistoryDto];

  const mockEmploymentHistoryService = {
    getEmploymentHistoryByUserId: jest.fn(),
    createEmploymentHistory: jest.fn(),
    updateToggleEmploymentHistory: jest.fn(),
    deleteEmploymentHistory: jest.fn(),
    updateEmploymentHistoriesPositions: jest.fn(),
    updateEmploymentHistories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminEmploymentHistoryController],
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

  describe('GET: /admin/employment-histories/:userId', () => {
    it('should return list employment history of employee', async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'getEmploymentHistoryByUserId')
        .mockReturnValueOnce(employmentHistories);

      return request(app.getHttpServer())
        .get('/admin/employment-histories/1')
        .expect(JSON.stringify(employmentHistories))
        .expect(200);
    });
  });

  describe('POST: /admin/employment-histories/:userId', () => {
    const createEmploymentHistoryDto =
      EmploymentHistoryFake.buildCreateEmploymentHistoryDto();

    it('should create employment history for employee', async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'createEmploymentHistory')
        .mockReturnValueOnce(employmentHistoryDto);

      return request(app.getHttpServer())
        .post('/admin/employment-histories/1')
        .send(createEmploymentHistoryDto)
        .expect(JSON.stringify(employmentHistoryDto))
        .expect(200);
    });
  });

  describe('PUT: /admin/employment-histories/:id/toggle', () => {
    it(`should update selected for employee's employment history by id`, async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'updateToggleEmploymentHistory')
        .mockReturnValueOnce(employmentHistoryDto);

      return request(app.getHttpServer())
        .put('/admin/employment-histories/1/toggle')
        .expect(JSON.stringify(employmentHistoryDto))
        .expect(200);
    });
  });

  describe('PUT: /admin/employment-histories/:userId/positions', () => {
    const updatePositions = [
      EmploymentHistoryFake.buildUpdateEmploymentHistoryPositionDto(
        employmentHistory.id,
      ),
    ];

    it('should update positions employment histories of employee', async () => {
      jest
        .spyOn(
          mockEmploymentHistoryService,
          'updateEmploymentHistoriesPositions',
        )
        .mockReturnValueOnce(employmentHistories);

      return request(app.getHttpServer())
        .put('/admin/employment-histories/1/positions')
        .send(updatePositions)
        .expect(JSON.stringify(employmentHistories))
        .expect(200);
    });
  });

  describe('PUT: /admin/employment-histories/:userId', () => {
    const updateEmploymentHistories = [
      EmploymentHistoryFake.buildUpdateEmploymentHistoryDto(
        employmentHistory.id,
      ),
    ];

    it('should update employee is employment histories', async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'updateEmploymentHistories')
        .mockReturnValueOnce(employmentHistories);

      return request(app.getHttpServer())
        .put('/admin/employment-histories/1')
        .send(updateEmploymentHistories)
        .expect(JSON.stringify(employmentHistories))
        .expect(200);
    });
  });

  describe('DELETE: /admin/employment-histories/:userId/:id', () => {
    it('should delete employment history by id', async () => {
      jest.spyOn(mockEmploymentHistoryService, 'deleteEmploymentHistory');

      return request(app.getHttpServer())
        .delete('/admin/employment-histories/1/1')
        .expect(200);
    });
  });
});
