import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminTrainingController } from '../../controllers/admin-training.controller';
import { TrainingService } from '../../services/training.service';
import { TrainingFake } from '../fakes/training.fake';

describe('AdminTrainingController', () => {
  let adminTrainingController: AdminTrainingController;

  const pageOptions = TrainingFake.buildTrainingsPageOptionsDto();
  const expectedTrainingDtos = TrainingFake.buildTrainingsPageDto();
  const userTraining = UserFake.buildUserDto();
  const userLogin = UserFake.buildUserDto();
  const training = TrainingFake.buildTrainingDto();
  const createTraining = TrainingFake.buildCreateTrainingDto();
  const updateTrainingDto = TrainingFake.buildUpdateTrainingDto();
  const mockedUserEntity = {
    id: userLogin.id,
    permissions: userLogin.roles,
    toDto: jest.fn(() => userLogin) as unknown,
  } as unknown as UserEntity;

  const mockTrainingService = {
    getTrainings: jest.fn(),
    getUserTrainingDetails: jest.fn(),
    createTraining: jest.fn(),
    updateTraining: jest.fn(),
    deleteUserTraining: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTrainingController],
      providers: [
        {
          provide: TrainingService,
          useValue: mockTrainingService,
        },
      ],
    }).compile();

    adminTrainingController = module.get<AdminTrainingController>(
      AdminTrainingController,
    );
  });

  describe('getTrainings', () => {
    it('should return a page of trainings', async () => {
      jest
        .spyOn(mockTrainingService, 'getTrainings')
        .mockReturnValue(expectedTrainingDtos);

      const result = await adminTrainingController.getTrainings(pageOptions);

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

  describe('getTrainingsOfUser', () => {
    it('should return a page of user trainings', async () => {
      jest
        .spyOn(mockTrainingService, 'getTrainings')
        .mockReturnValue(expectedTrainingDtos);

      const result = await adminTrainingController.getTrainingsOfUser(
        userTraining.id,
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

  describe('getUserTrainingDetails', () => {
    it('should return a user training detail', async () => {
      jest
        .spyOn(mockTrainingService, 'getUserTrainingDetails')
        .mockReturnValue(training);

      const result = await adminTrainingController.getUserTrainingDetails(
        userTraining.id,
        training.id,
      );

      expect(result.id).toEqual(training.id);
      expect(result.trainingTitle).toEqual(training.trainingTitle);
      expect(result.trainingDescription).toEqual(training.trainingDescription);

      expect(mockTrainingService.getUserTrainingDetails).toBeCalled();
    });
  });

  describe('createUserTraining', () => {
    it('should create user training', async () => {
      jest
        .spyOn(mockTrainingService, 'createTraining')
        .mockReturnValue(training);

      const result = await adminTrainingController.createUserTraining(
        mockedUserEntity,
        userTraining.id,
        createTraining,
      );

      expect(result.id).toEqual(training.id);
      expect(result.trainingTitle).toEqual(training.trainingTitle);
      expect(result.trainingDescription).toEqual(training.trainingDescription);

      expect(mockTrainingService.createTraining).toBeCalled();
    });
  });

  describe('updateUserTraining', () => {
    it('should update user training', async () => {
      jest
        .spyOn(mockTrainingService, 'updateTraining')
        .mockReturnValue(training);

      const result = await adminTrainingController.updateUserTraining(
        mockedUserEntity,
        training.id,
        userTraining.id,
        updateTrainingDto,
      );

      expect(result.id).toEqual(training.id);
      expect(result.trainingTitle).toEqual(training.trainingTitle);
      expect(result.trainingDescription).toEqual(training.trainingDescription);

      expect(mockTrainingService.updateTraining).toBeCalled();
    });
  });

  describe('deleteUserTraining', () => {
    it('should delete user training', async () => {
      jest.spyOn(mockTrainingService, 'deleteUserTraining');

      await adminTrainingController.deleteUserTraining(
        mockedUserEntity,
        training.id,
        userTraining.id,
      );

      expect(mockTrainingService.deleteUserTraining).toBeCalledWith(
        userLogin.id,
        training.id,
        userTraining.id,
      );
    });
  });
});
