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
import { MyEducationController } from '../../controllers/my-education.controller';
import { EducationService } from '../../services/education.service';
import { EducationFake } from '../fakes/education.fake';

describe('MyEducation', () => {
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
    updateEducations: jest.fn(),
    deleteEducation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyEducationController],
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

  describe('GET: /my-educations', () => {
    it('should return all my educations', async () => {
      jest
        .spyOn(mockEducationService, 'getEducationsByUserId')
        .mockReturnValueOnce(educations);

      return request(app.getHttpServer())
        .get('/my-educations')
        .expect(JSON.stringify(educations))
        .expect(200);
    });
  });

  describe('POST: /my-educations', () => {
    const createEducation = EducationFake.buildCreateEducationDto();

    it('should create my education', async () => {
      jest
        .spyOn(mockEducationService, 'createEducation')
        .mockReturnValueOnce(educationDto);

      return request(app.getHttpServer())
        .post('/my-educations')
        .send(createEducation)
        .expect(JSON.stringify(educationDto))
        .expect(200);
    });
  });

  describe('PUT: /my-educations/:id/toggle', () => {
    it('should update selected for my education by id', async () => {
      jest
        .spyOn(mockEducationService, 'updateToggleEducation')
        .mockReturnValueOnce(educationDto);

      return request(app.getHttpServer())
        .put('/my-educations/1/toggle')
        .expect(JSON.stringify(educationDto))
        .expect(200);
    });
  });

  describe('PUT: /my-educations/positions', () => {
    const updatePositions = [EducationFake.buildUpdatePositionDto()];

    it('should update positions of my educations', async () => {
      jest
        .spyOn(mockEducationService, 'updateEducationPositions')
        .mockReturnValueOnce(educations);

      return request(app.getHttpServer())
        .put('/my-educations/positions')
        .send(updatePositions)
        .expect(JSON.stringify(educations))
        .expect(200);
    });
  });

  describe('PUT: /my-educations', () => {
    const updateEducations = [EducationFake.buildUpdateEducationDto()];

    it('should update a list of my educations', async () => {
      jest
        .spyOn(mockEducationService, 'updateEducations')
        .mockReturnValueOnce(educations);

      return request(app.getHttpServer())
        .put('/my-educations')
        .send(updateEducations)
        .expect(JSON.stringify(educations))
        .expect(200);
    });
  });

  describe('DELETE: /my-educations/:id', () => {
    it('should delete my education by id', async () => {
      jest.spyOn(mockEducationService, 'deleteEducation');

      return request(app.getHttpServer())
        .delete('/my-educations/1')
        .expect(200);
    });
  });
});
