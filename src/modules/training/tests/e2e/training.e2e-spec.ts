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
import { TrainingController } from '../../../../modules/training/controllers/training.controller';
import { TrainingService } from '../../../../modules/training/services/training.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { TrainingFake } from '../fakes/training.fake';
import { TrainingLevelFake } from '../fakes/training-level.fake';
import { TrainingTopicFake } from '../fakes/training-topic.fake';

describe('Training', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const training = TrainingFake.buildTrainingDto();

  const mockTrainingService = {
    getTrainings: jest.fn(),
    findAllLevels: jest.fn(),
    findAllTopics: jest.fn(),
    getUserTrainingDetails: jest.fn(),
    createTraining: jest.fn(),
    updateTraining: jest.fn(),
    deleteUserTraining: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingController],
      providers: [
        {
          provide: TrainingService,
          useValue: mockTrainingService,
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

  describe('GET: /trainings', () => {
    const pageOptionsDto = TrainingFake.buildTrainingsPageOptionsDto();
    const trainingDtos = TrainingFake.buildTrainingsPageDto();

    it('Get current user login list trainings', () => {
      mockTrainingService.getTrainings = jest
        .fn()
        .mockResolvedValueOnce(trainingDtos);

      return request(app.getHttpServer())
        .get('/trainings')
        .send(pageOptionsDto)
        .expect(JSON.stringify(trainingDtos))
        .expect(200);
    });
  });

  describe('GET: /trainings/levels', () => {
    const levels = [TrainingLevelFake.buildTrainingLevelDto()];

    it('Get all trainings levels by user', () => {
      mockTrainingService.findAllLevels = jest
        .fn()
        .mockResolvedValueOnce(levels);

      return request(app.getHttpServer())
        .get('/trainings/levels')
        .expect(JSON.stringify(levels))
        .expect(200);
    });
  });

  describe('GET: /trainings/topics', () => {
    const topics = [TrainingTopicFake.buildTrainingTopicDto()];

    it('Get all trainings topics by user', () => {
      mockTrainingService.findAllTopics = jest
        .fn()
        .mockResolvedValueOnce(topics);

      return request(app.getHttpServer())
        .get('/trainings/topics')
        .expect(JSON.stringify(topics))
        .expect(200);
    });
  });

  describe('GET: /trainings/:id', () => {
    it('User get training by id', () => {
      mockTrainingService.getUserTrainingDetails = jest
        .fn()
        .mockResolvedValueOnce(training);

      return request(app.getHttpServer())
        .get('/trainings/1')
        .expect(JSON.stringify(training))
        .expect(200);
    });
  });

  describe('POST: /trainings', () => {
    it('User create training report', () => {
      const createTraining = TrainingFake.buildCreateTrainingDto();

      mockTrainingService.createTraining = jest
        .fn()
        .mockResolvedValueOnce(training);

      return request(app.getHttpServer())
        .post('/trainings')
        .send(createTraining)
        .expect(JSON.stringify(training))
        .expect(200);
    });

    it('User create training report fail because variable value is empty and incorrect format', () => {
      const invalidCreateTraining = {
        ...TrainingFake.buildCreateTrainingDto(),
        trainingDate: null,
        duration: null,
        trainingTitle: '',
        trainingDescription: '',
        levelId: null,
        topicId: null,
        coachIds: ['a'],
      };

      return request(app.getHttpServer())
        .post('/trainings')
        .send(invalidCreateTraining)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'trainingDate must be a valid ISO 8601 date string',
              'trainingDate should not be empty',
              'duration should not be empty',
              'trainingTitle should not be empty',
              'trainingDescription should not be empty',
              'levelId must be a number conforming to the specified constraints',
              'levelId should not be empty',
              'topicId must be a number conforming to the specified constraints',
              'topicId should not be empty',
              'each value in coachIds must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('User create training report fail because details length exceeds 1024 characters', () => {
      const invalidCreateTraining = {
        ...TrainingFake.buildCreateTrainingDto(),
        trainingTitle: 'a'.repeat(257),
        trainingDescription: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .post('/trainings')
        .send(invalidCreateTraining)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'Title must be less than or equal to 256 characters',
              'Description must be less than or equal to 1024 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /trainings/:id', () => {
    it('User update training report', () => {
      const updateTraining = TrainingFake.buildUpdateTrainingDto();

      mockTrainingService.updateTraining = jest
        .fn()
        .mockResolvedValueOnce(training);

      return request(app.getHttpServer())
        .put('/trainings/1')
        .send(updateTraining)
        .expect(JSON.stringify(training))
        .expect(200);
    });

    it('User update training report fail because variable value is empty and incorrect format', () => {
      const invalidUpdateTraining = {
        ...TrainingFake.buildUpdateTrainingDto(),
        trainingDate: null,
        duration: null,
        trainingTitle: '',
        trainingDescription: '',
        levelId: null,
        topicId: null,
        coachIds: ['a'],
      };

      return request(app.getHttpServer())
        .put('/trainings/1')
        .send(invalidUpdateTraining)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'trainingDate must be a valid ISO 8601 date string',
              'trainingDate should not be empty',
              'duration should not be empty',
              'trainingTitle should not be empty',
              'trainingDescription should not be empty',
              'levelId must be a number conforming to the specified constraints',
              'levelId should not be empty',
              'topicId must be a number conforming to the specified constraints',
              'topicId should not be empty',
              'each value in coachIds must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });

    it('User update training report fail because details length exceeds 1024 characters', () => {
      const invalidUpdateTraining = {
        ...TrainingFake.buildUpdateTrainingDto(),
        trainingTitle: 'a'.repeat(257),
        trainingDescription: 'a'.repeat(1025),
      };

      return request(app.getHttpServer())
        .put('/trainings/1')
        .send(invalidUpdateTraining)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'Title must be less than or equal to 256 characters',
              'Description must be less than or equal to 1024 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('DELETE: /trainings/:id', () => {
    it('User delete training report', () =>
      request(app.getHttpServer()).delete('/trainings/1').expect(204));
  });
});
