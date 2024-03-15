import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { TrainingController } from '../../controllers/training.controller';
import { TrainingService } from '../../services/training.service';
import { TrainingFake } from '../fakes/training.fake';
import { TrainingLevelFake } from '../fakes/training-level.fake';
import { TrainingTopicFake } from '../fakes/training-topic.fake';

describe('TrainingController', () => {
  let trainingController: TrainingController;

  const pageOptions = TrainingFake.buildTrainingsPageOptionsDto();
  const expectedTrainingDtos = TrainingFake.buildTrainingsPageDto();
  const userLogin = UserFake.buildUserDto();
  const training = TrainingFake.buildTrainingDto();
  const mockedUserEntity = {
    id: userLogin.id,
    permissions: userLogin.roles,
    toDto: jest.fn(() => userLogin) as unknown,
  } as unknown as UserEntity;

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
    }).compile();

    trainingController = module.get<TrainingController>(TrainingController);
  });

  describe('getMyTrainings', () => {
    it('should return a page of user trainings', async () => {
      jest
        .spyOn(mockTrainingService, 'getTrainings')
        .mockReturnValue(expectedTrainingDtos);

      const result = await trainingController.getMyTrainings(
        mockedUserEntity,
        pageOptions,
      );

      expect(result.data[0].id).toEqual(expectedTrainingDtos.data[0].id);
      expect(result.data[0].trainingTitle).toEqual(
        expectedTrainingDtos.data[0].trainingTitle,
      );
      expect(result.data[0].trainingDescription).toEqual(
        expectedTrainingDtos.data[0].trainingDescription,
      );

      expect(mockTrainingService.getTrainings).toBeCalled();
    });
  });

  describe('levels', () => {
    it('should return all trainings levels', async () => {
      const levels = [TrainingLevelFake.buildTrainingLevelDto()];

      jest.spyOn(mockTrainingService, 'findAllLevels').mockReturnValue(levels);

      const result = await trainingController.getAllLevels();

      expect(result[0].id).toEqual(levels[0].id);
      expect(result[0].label).toEqual(levels[0].label);

      expect(mockTrainingService.findAllLevels).toBeCalled();
    });
  });

  describe('topics', () => {
    it('should return all trainings topics', async () => {
      const topics = [TrainingTopicFake.buildTrainingTopicDto()];

      jest.spyOn(mockTrainingService, 'findAllTopics').mockReturnValue(topics);

      const result = await trainingController.getAllTopics();

      expect(result[0].id).toEqual(topics[0].id);
      expect(result[0].label).toEqual(topics[0].label);

      expect(mockTrainingService.findAllTopics).toBeCalled();
    });
  });

  describe('getMyTraining', () => {
    it('should return training details by id', async () => {
      jest
        .spyOn(mockTrainingService, 'getUserTrainingDetails')
        .mockReturnValue(training);

      const result = await trainingController.getMyTraining(
        mockedUserEntity,
        training.id,
      );

      expect(result.id).toEqual(training.id);
      expect(result.trainingTitle).toEqual(training.trainingTitle);
      expect(result.trainingDescription).toEqual(training.trainingDescription);

      expect(mockTrainingService.getUserTrainingDetails).toBeCalled();
    });
  });

  describe('createTraining', () => {
    it('should create user training', async () => {
      const createTraining = TrainingFake.buildCreateTrainingDto();

      jest
        .spyOn(mockTrainingService, 'createTraining')
        .mockReturnValue(training);

      const result = await trainingController.createTraining(
        mockedUserEntity,
        createTraining,
      );

      expect(result.id).toEqual(training.id);
      expect(result.trainingTitle).toEqual(training.trainingTitle);
      expect(result.trainingDescription).toEqual(training.trainingDescription);

      expect(mockTrainingService.createTraining).toBeCalled();
    });
  });

  describe('updateTraining', () => {
    it('should update user training', async () => {
      const updateTrainingDto = TrainingFake.buildUpdateTrainingDto();

      jest
        .spyOn(mockTrainingService, 'updateTraining')
        .mockReturnValue(training);

      const result = await trainingController.updateTraining(
        training.id,
        mockedUserEntity,
        updateTrainingDto,
      );

      expect(result.id).toEqual(training.id);
      expect(result.trainingTitle).toEqual(training.trainingTitle);
      expect(result.trainingDescription).toEqual(training.trainingDescription);

      expect(mockTrainingService.updateTraining).toBeCalled();
    });
  });

  describe('deleteTraining', () => {
    it('should delete user training', async () => {
      jest.spyOn(mockTrainingService, 'deleteUserTraining');

      await trainingController.deleteTraining(mockedUserEntity, training.id);

      expect(mockTrainingService.deleteUserTraining).toBeCalledWith(
        userLogin.id,
        userLogin.id,
        training.id,
      );
    });
  });
});
