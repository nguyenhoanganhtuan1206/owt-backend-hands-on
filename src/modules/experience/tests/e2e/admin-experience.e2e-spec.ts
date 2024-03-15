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
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminExperienceController } from '../../controllers/admin-experience.controller';
import type { ExperienceDto } from '../../dtos/experience.dto';
import { ExperienceService } from '../../services/experience.service';
import {
  experienceDto,
  validCreateExperienceDto,
  validUpdateExperienceDtos,
  validUpdateExperiencePosition,
} from '../fakes/experience.fake';

describe('AdminExperience', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  let experience: ExperienceDto;
  let experiences: ExperienceDto[];

  const mockExperienceService = {
    getExperiencesByUserId: jest.fn(),
    createExperience: jest.fn(),
    updateExperiencePositions: jest.fn(),
    updateToggleExperience: jest.fn(),
    updateExperiences: jest.fn(),
    deleteExperience: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminExperienceController],
      providers: [
        {
          provide: ExperienceService,
          useValue: mockExperienceService,
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
    experience = experienceDto;
    experiences = [experience];

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /admin/experiences/:userId', () => {
    it('Get experiences of employee', () => {
      mockExperienceService.getExperiencesByUserId = jest
        .fn()
        .mockResolvedValueOnce(experiences);

      return request(app.getHttpServer())
        .get('/admin/experiences/1')
        .expect(JSON.stringify(experiences))
        .expect(200);
    });
  });

  describe('POST: /admin/experiences/:userId', () => {
    it('Create experience for employee', () => {
      const createExperience = validCreateExperienceDto;

      mockExperienceService.createExperience = jest
        .fn()
        .mockResolvedValueOnce(experience);

      return request(app.getHttpServer())
        .post('/admin/experiences/1')
        .send(createExperience)
        .expect(JSON.stringify(experience))
        .expect(200);
    });

    it('Create experience for employee fail because validating', () => {
      const invalidCreateExperience = {
        ...validCreateExperienceDto,
        projectName: undefined,
        dateFrom: '',
        dateTo: '',
        domain: undefined,
        description: undefined,
        rolesAndResponsibilities: undefined,
        skillIds: undefined,
      };

      return request(app.getHttpServer())
        .post('/admin/experiences/1')
        .send(invalidCreateExperience)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'projectName must be less than 256 characters',
              'projectName must be a string',
              'projectName should not be empty',
              'dateFrom must be a valid ISO 8601 date string',
              'dateFrom should not be empty',
              'dateTo must be a valid ISO 8601 date string',
              'domain must be less than 256 characters',
              'domain must be a string',
              'domain should not be empty',
              'description must be less than or equal to 1024 characters',
              'description must be a string',
              'description should not be empty',
              'rolesAndResponsibilities must be a string',
              'rolesAndResponsibilities should not be empty',
              'skillIds should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/experiences/:userId/positions', () => {
    it('Update experience positions for employee', () => {
      const updatePositionDtos = validUpdateExperiencePosition;

      mockExperienceService.updateExperiencePositions = jest
        .fn()
        .mockResolvedValueOnce(experiences);

      return request(app.getHttpServer())
        .put('/admin/experiences/1/positions')
        .send(updatePositionDtos)
        .expect(JSON.stringify(experiences))
        .expect(200);
    });

    it('Update experience positions for employee fail because validating', () => {
      const invalidUpdatePositionDtos = [
        {
          experienceId: null,
          position: null,
        },
      ];

      return request(app.getHttpServer())
        .put('/admin/experiences/1/positions')
        .send(invalidUpdatePositionDtos)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'experienceId must be an integer number',
              'experienceId should not be empty',
              'position must be an integer number',
              'position should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/experiences/:userId/:id/toggle', () => {
    it(`Update tick/untick checkbox for employee's experiences by id`, () => {
      mockExperienceService.updateToggleExperience = jest
        .fn()
        .mockResolvedValueOnce(experience);

      return request(app.getHttpServer())
        .put('/admin/experiences/1/1/toggle')
        .expect(JSON.stringify(experience))
        .expect(200);
    });
  });

  describe('PUT: /admin/experiences/:userId', () => {
    it(`Update a list of employee's experiences`, () => {
      const updateExperienceDtos = validUpdateExperienceDtos;

      mockExperienceService.updateExperiences = jest
        .fn()
        .mockResolvedValueOnce(experiences);

      return request(app.getHttpServer())
        .put('/admin/experiences/1')
        .send(updateExperienceDtos)
        .expect(JSON.stringify(experiences))
        .expect(200);
    });

    it(`Update a list of employee's experiences fail because validating`, () => {
      const invalidUpdateExperienceDtos = [
        {
          projectName: undefined,
          dateFrom: '',
          dateTo: '',
          domain: undefined,
          description: undefined,
          rolesAndResponsibilities: undefined,
          skillIds: undefined,
          isCurrentlyWorking: 1,
        },
      ];

      return request(app.getHttpServer())
        .put('/admin/experiences/1')
        .send(invalidUpdateExperienceDtos)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'projectName must be less than 256 characters',
              'projectName must be a string',
              'projectName should not be empty',
              'dateFrom must be a valid ISO 8601 date string',
              'dateTo must be a valid ISO 8601 date string',
              'domain must be less than 256 characters',
              'domain must be a string',
              'domain should not be empty',
              'description must be less than 1024 characters',
              'description must be a string',
              'description should not be empty',
              'rolesAndResponsibilities must be a string',
              'rolesAndResponsibilities should not be empty',
              'skillIds should not be empty',
              'skillIds must be an array',
              'isCurrentlyWorking must be a boolean value',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('DELETE: /admin/experiences/:userId/:id', () => {
    it('Delete experience', () =>
      request(app.getHttpServer())
        .delete('/admin/experiences/1/1')
        .expect(200));
  });
});
