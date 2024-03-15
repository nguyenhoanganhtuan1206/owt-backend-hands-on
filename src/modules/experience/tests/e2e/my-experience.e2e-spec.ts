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
import { MyExperienceController } from '../../controllers/my-experience.controller';
import type { ExperienceDto } from '../../dtos/experience.dto';
import { ExperienceService } from '../../services/experience.service';
import {
  experienceDto,
  validCreateExperienceDto,
  validUpdateExperienceDtos,
  validUpdateExperiencePosition,
} from '../fakes/experience.fake';

describe('MyExperience', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  let experience: ExperienceDto;
  let experiences: ExperienceDto[];

  const mockExperienceService = {
    createExperience: jest.fn(),
    getExperiencesByUserId: jest.fn(),
    updateToggleExperience: jest.fn(),
    updateExperiencePositions: jest.fn(),
    updateExperiences: jest.fn(),
    deleteExperience: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyExperienceController],
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

  describe('POST: /my-experiences', () => {
    it('Create my experience', () => {
      const createExperience = validCreateExperienceDto;

      mockExperienceService.createExperience = jest
        .fn()
        .mockResolvedValueOnce(experience);

      return request(app.getHttpServer())
        .post('/my-experiences')
        .send(createExperience)
        .expect(JSON.stringify(experience))
        .expect(200);
    });

    it('Create my experience fail because validating', () => {
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
        .post('/my-experiences')
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

  describe('GET: /my-experiences', () => {
    it('Get my experiences', () => {
      mockExperienceService.getExperiencesByUserId = jest
        .fn()
        .mockResolvedValueOnce(experiences);

      return request(app.getHttpServer())
        .get('/my-experiences')
        .expect(JSON.stringify(experiences))
        .expect(200);
    });
  });

  describe('PUT: /my-experiences/:id/toggle', () => {
    it(`Update tick/untick checkbox for my experience by id`, () => {
      mockExperienceService.updateToggleExperience = jest
        .fn()
        .mockResolvedValueOnce(experience);

      return request(app.getHttpServer())
        .put('/my-experiences/1/toggle')
        .expect(JSON.stringify(experience))
        .expect(200);
    });
  });

  describe('PUT: /my-experiences/positions', () => {
    it('Update positions of my experience', () => {
      const updatePositionDtos = validUpdateExperiencePosition;

      mockExperienceService.updateExperiencePositions = jest
        .fn()
        .mockResolvedValueOnce(experiences);

      return request(app.getHttpServer())
        .put('/my-experiences/positions')
        .send(updatePositionDtos)
        .expect(JSON.stringify(experiences))
        .expect(200);
    });

    it('Update positions of my experience fail because validating', () => {
      const invalidUpdatePositionDtos = [
        {
          experienceId: null,
          position: null,
        },
      ];

      return request(app.getHttpServer())
        .put('/my-experiences/positions')
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

  describe('PUT: /my-experiences', () => {
    it('Update a list of my experiences', () => {
      const updateExperienceDtos = validUpdateExperienceDtos;

      mockExperienceService.updateExperiences = jest
        .fn()
        .mockResolvedValueOnce(experiences);

      return request(app.getHttpServer())
        .put('/my-experiences')
        .send(updateExperienceDtos)
        .expect(JSON.stringify(experiences))
        .expect(200);
    });

    it('Update a list of my experiences fail because validating', () => {
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
        .put('/my-experiences')
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

  describe('DELETE: /my-experiences/:id', () => {
    it('Delete experience', () =>
      request(app.getHttpServer()).delete('/my-experiences/1').expect(200));
  });
});
