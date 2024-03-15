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
import { AdminEducationController } from '../../controllers/admin-education.controller';
import { EducationService } from '../../services/education.service';
import { EducationFake } from '../fakes/education.fake';

describe('AdminEducation', () => {
  let app: INestApplication;
  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const educationDto = EducationFake.buildEducationDto();
  const educations = [educationDto];

  const mockEducationService = {
    getEducationsByUserId: jest.fn(),
    createEducation: jest.fn(),
    updateToggleEducation: jest.fn(),
    updateEducationPositions: jest.fn(),
    updateEmployeeEducations: jest.fn(),
    deleteEmployeeEducation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminEducationController],
      providers: [
        {
          provide: EducationService,
          useValue: mockEducationService,
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

  describe('GET: /admin/educations/:userId', () => {
    it('should return all educations of employee', async () => {
      jest
        .spyOn(mockEducationService, 'getEducationsByUserId')
        .mockReturnValueOnce(educations);

      return request(app.getHttpServer())
        .get('/admin/educations/1')
        .expect(JSON.stringify(educations))
        .expect(200);
    });
  });

  describe('POST: /admin/educations/:userId', () => {
    const createEducation = EducationFake.buildCreateEducationDto();

    it('should create employee education', async () => {
      jest
        .spyOn(mockEducationService, 'createEducation')
        .mockReturnValueOnce(educationDto);

      return request(app.getHttpServer())
        .post('/admin/educations/1')
        .send(createEducation)
        .expect(JSON.stringify(educationDto))
        .expect(200);
    });
  });

  describe('POST: /admin/educations/:id/toggle', () => {
    it('should update tick/untick checkbox for employee education by id', async () => {
      jest
        .spyOn(mockEducationService, 'updateToggleEducation')
        .mockReturnValueOnce(educationDto);

      return request(app.getHttpServer())
        .put('/admin/educations/1/toggle')
        .expect(JSON.stringify(educationDto))
        .expect(200);
    });
  });

  describe('PUT: /admin/educations/:userId/positions', () => {
    const updatePositions = [EducationFake.buildUpdatePositionDto()];

    it('should update positions of employee educations', async () => {
      jest
        .spyOn(mockEducationService, 'updateEducationPositions')
        .mockReturnValueOnce(educations);

      return request(app.getHttpServer())
        .put('/admin/educations/1/positions')
        .send(updatePositions)
        .expect(JSON.stringify(educations))
        .expect(200);
    });
  });

  describe('PUT: /admin/educations/:userId', () => {
    const updateEducations = [EducationFake.buildUpdateEducationDto()];

    it(`should update a list of employee's educations`, async () => {
      jest
        .spyOn(mockEducationService, 'updateEmployeeEducations')
        .mockReturnValueOnce(educations);

      return request(app.getHttpServer())
        .put('/admin/educations/1')
        .send(updateEducations)
        .expect(JSON.stringify(educations))
        .expect(200);
    });
  });

  describe('DELETE: /admin/educations/:userId/:educationId', () => {
    it('should delete employee education by id', async () => {
      jest.spyOn(mockEducationService, 'deleteEmployeeEducation');

      return request(app.getHttpServer())
        .delete('/admin/educations/1/1')
        .expect(200);
    });
  });
});
