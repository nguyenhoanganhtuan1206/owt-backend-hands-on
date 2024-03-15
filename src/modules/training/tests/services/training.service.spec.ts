/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import { ValidatorService } from '../../../../shared/services/validator.service';
import type { UserEntity } from '../../../user/entities/user.entity';
import UserMapper from '../../../user/mappers/user.mapper';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { TrainingEntity } from '../../entities/training.entity';
import { TrainingCoachEntity } from '../../entities/training-coach.entity';
import { TrainingLevelEntity } from '../../entities/training-level.entity';
import { TrainingTopicEntity } from '../../entities/training-topic.entity';
import TrainingMapper from '../../mappers/training.mapper';
import { TrainingService } from '../../services/training.service';
import TrainingValidator from '../../validators/training.validator';
import { TrainingFake } from '../fakes/training.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('TrainingService', () => {
  let trainingService: TrainingService;
  let trainingRepository: Repository<TrainingEntity>;

  const pageOptions = TrainingFake.buildTrainingsPageOptionsDto();
  const expectedTrainingDtos = TrainingFake.buildTrainingsPageDto();

  const mockTrainingMapper = {
    toTrainingEntity: jest.fn(),
    toTrainingEntityToUpdate: jest.fn(),
  };

  const mockUserMapper = {
    toUserEntityFromId: jest.fn(),
  };

  const mockTrainingValidate = {
    validateTrainingDate: jest.fn(),
    validateTrainingCreatedDate: jest.fn(),
    validateTrainingCreator: jest.fn(),
  };

  const mockValidatorService = {
    isUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        UserMapper,
        {
          provide: ValidatorService,
          useValue: mockValidatorService,
        },
        {
          provide: TrainingValidator,
          useValue: mockTrainingValidate,
        },
        {
          provide: TrainingMapper,
          useValue: mockTrainingMapper,
        },
        {
          provide: UserMapper,
          useValue: mockUserMapper,
        },
        {
          provide: getRepositoryToken(TrainingEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TrainingTopicEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TrainingLevelEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TrainingCoachEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    trainingService = module.get<TrainingService>(TrainingService);
    trainingRepository = module.get<Repository<TrainingEntity>>(
      getRepositoryToken(TrainingEntity),
    );
  });

  describe('getTrainings', () => {
    const training = TrainingFake.buildTrainingDto();
    const mockTrainingEntity = TrainingFake.buildTrainingEntity(training);

    it('should be return trainings', async () => {
      const trainingEntities = [mockTrainingEntity];

      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        paginate: jest
          .fn()
          .mockResolvedValue([trainingEntities, expectedTrainingDtos.meta]),
      } as never);
      jest
        .spyOn(trainingEntities, 'toPageDto')
        .mockReturnValue(expectedTrainingDtos);

      const result = await trainingService.getTrainings(pageOptions);

      expect(result).toEqual(expectedTrainingDtos);

      expect(trainingRepository.createQueryBuilder).toBeCalled();
      expect(trainingEntities.toPageDto).toBeCalled();
    });
  });

  describe('getUserTrainingDetails', () => {
    const training = TrainingFake.buildTrainingDto();
    const mockTrainingEntity = TrainingFake.buildTrainingEntity(training);

    it('should return a training detail', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);

      const result = await trainingService.getUserTrainingDetails(
        training.user.id,
        training.id,
      );

      expect(result).toEqual(training);

      expect(trainingRepository.findOne).toBeCalled();
    });

    it('should throw InvalidNotFoundException if the training not found', async () => {
      jest.spyOn(trainingRepository, 'findOne').mockResolvedValue(null);

      await expect(
        trainingService.getUserTrainingDetails(training.user.id, training.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(trainingRepository.findOne).toBeCalledWith({
        where: {
          id: training.id,
          user: {
            id: training.user.id,
          },
        },
      });
    });
  });

  describe('createTraining', () => {
    const training = TrainingFake.buildTrainingDto();
    const mockTrainingEntity = TrainingFake.buildTrainingEntity(training);
    const userLogin = UserFake.buildUserDto();
    const mockUser = {
      ...UserFake.buildUserDto(),
      id: 2,
    };
    const createTraining = TrainingFake.buildCreateTrainingDto();

    training.user.id = mockUser.id;

    it('should create a training', async () => {
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockUserMapper, 'toUserEntityFromId')
        .mockResolvedValue(mockTrainingEntity.trainingCoaches);
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 1 }),
      } as never);
      jest
        .spyOn(trainingRepository, 'save')
        .mockResolvedValue(mockTrainingEntity);

      const result = await trainingService.createTraining(
        userLogin.id,
        training.user.id,
        createTraining,
      );

      expect(result).toEqual(training);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
      expect(mockUserMapper.toUserEntityFromId).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
      expect(trainingRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if validation date in future', async () => {
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TRAINING_DATE_BAD_REQUEST,
          );
        });

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user in training not found', async () => {
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
    });

    it('should throw InvalidNotFoundException if training level not found', async () => {
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(
            ErrorCode.TRAINING_LEVEL_NOT_FOUND,
          );
        });

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
    });

    it('should throw InvalidNotFoundException if training level not found', async () => {
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(
            ErrorCode.TRAINING_TOPIC_NOT_FOUND,
          );
        });

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
    });

    it('should throw InvalidBadRequestException if training has 3 more coaches', async () => {
      const createTrainingError = TrainingFake.buildCreateTrainingDto();

      createTrainingError.coachIds = [
        ...(createTrainingError.coachIds || []),
        3,
        4,
        5,
      ];

      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockResolvedValue(mockTrainingEntity);

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTrainingError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
    });

    it('should throw InvalidBadRequestException if coach same user from training', async () => {
      const createTrainingError = TrainingFake.buildCreateTrainingDto();

      if (createTrainingError.coachIds) {
        createTrainingError.coachIds[0] = training.user.id;
      }

      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockResolvedValue(mockTrainingEntity);

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTrainingError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
    });

    it('should throw InvalidBadRequestException if coaches in training duplicate', async () => {
      const createTrainingError = TrainingFake.buildCreateTrainingDto();

      if (
        createTrainingError.coachIds &&
        createTrainingError.coachIds.length > 0
      ) {
        createTrainingError.coachIds.push(createTrainingError.coachIds[0]);
      }

      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockResolvedValue(mockTrainingEntity);

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTrainingError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
    });

    it('should throw InvalidNotFoundException if coaches in training not found', async () => {
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockUserMapper, 'toUserEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
      expect(mockUserMapper.toUserEntityFromId).toBeCalled();
    });

    it('should throw InvalidBadRequestException if training duration limit', async () => {
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockUserMapper, 'toUserEntityFromId')
        .mockResolvedValue(mockTrainingEntity.trainingCoaches);
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 8 }),
      } as never);

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
      expect(mockUserMapper.toUserEntityFromId).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidBadRequestException if not link', async () => {
      mockTrainingEntity.trainingLink = 'test link';

      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntity')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockUserMapper, 'toUserEntityFromId')
        .mockResolvedValue(mockTrainingEntity.trainingCoaches);
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 1 }),
      } as never);
      jest.spyOn(mockValidatorService, 'isUrl').mockReturnValue(false);

      await expect(
        trainingService.createTraining(
          userLogin.id,
          training.user.id,
          createTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntity).toBeCalled();
      expect(mockUserMapper.toUserEntityFromId).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('updateTraining', () => {
    const training = TrainingFake.buildTrainingDto();
    const mockTrainingEntity = TrainingFake.buildTrainingEntity(training);
    const userLogin = UserFake.buildUserDto();
    const updateTraining = TrainingFake.buildUpdateTrainingDto();

    training.user.id = 2;

    it('should update a training', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 1 }),
      } as never);
      jest
        .spyOn(trainingRepository, 'save')
        .mockResolvedValue(mockTrainingEntity);

      const result = await trainingService.updateTraining(
        training.id,
        userLogin.id,
        training.user.id,
        updateTraining,
      );

      expect(result).toEqual(training);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
      expect(trainingRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if find training by id and userId not found', async () => {
      jest.spyOn(trainingRepository, 'findOne').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.TRAINING_NOT_FOUND);
      });

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(trainingRepository.findOne).toBeCalled();
    });

    it('should throw InvalidBadRequestException if training date after 7 days', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TRAINING_CAN_NOT_BE_CHANGED,
          );
        });

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user in training not found', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
    });

    it('should throw InvalidNotFoundException if training level not found', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(
            ErrorCode.TRAINING_LEVEL_NOT_FOUND,
          );
        });

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
    });

    it('should throw InvalidNotFoundException if training level not found', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(
            ErrorCode.TRAINING_TOPIC_NOT_FOUND,
          );
        });

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
    });

    it('should throw InvalidBadRequestException if user login not training owner', async () => {
      const user = { ...userLogin };

      user.id = 3;

      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreator')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.USER_NOT_TRAINING_OWNER,
          );
        });

      await expect(
        trainingService.updateTraining(
          training.id,
          user.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
    });

    it('should throw InvalidBadRequestException if training date in future', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TRAINING_DATE_BAD_REQUEST,
          );
        });

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
    });

    it('should throw InvalidBadRequestException if training duration limit', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 8 }),
      } as never);

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidBadRequestException if training has 3 more coaches', async () => {
      const updateTrainingError = TrainingFake.buildUpdateTrainingDto();

      updateTrainingError.coachIds = [
        ...(updateTrainingError.coachIds || []),
        3,
        4,
        5,
      ];

      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 1 }),
      } as never);

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTrainingError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidBadRequestException if coach same user from training', async () => {
      const updateTrainingError = TrainingFake.buildUpdateTrainingDto();

      if (updateTrainingError.coachIds) {
        updateTrainingError.coachIds[0] = training.user.id;
      }

      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 1 }),
      } as never);

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTrainingError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidBadRequestException if coaches in training duplicate', async () => {
      const updateTrainingError = TrainingFake.buildUpdateTrainingDto();

      if (
        updateTrainingError.coachIds &&
        updateTrainingError.coachIds.length > 0
      ) {
        updateTrainingError.coachIds.push(updateTrainingError.coachIds[0]);
      }

      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 1 }),
      } as never);

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTrainingError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidBadRequestException if not link', async () => {
      mockTrainingEntity.trainingLink = 'test link';

      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockTrainingEntity);
      jest
        .spyOn(mockTrainingMapper, 'toTrainingEntityToUpdate')
        .mockResolvedValue(mockTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest.spyOn(mockTrainingValidate, 'validateTrainingDate');
      jest.spyOn(trainingRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce({ totalDuration: 1 }),
      } as never);
      jest.spyOn(mockValidatorService, 'isUrl').mockReturnValue(false);

      await expect(
        trainingService.updateTraining(
          training.id,
          userLogin.id,
          training.user.id,
          updateTraining,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(mockTrainingMapper.toTrainingEntityToUpdate).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingDate).toBeCalled();
      expect(trainingRepository.createQueryBuilder).toBeCalled();
      expect(mockValidatorService.isUrl).toBeCalled();
    });
  });

  describe('updateTraining', () => {
    const training = TrainingFake.buildTrainingDto();
    const mockedTrainingEntity = {
      id: training.id,
      user: training.user,
      duration: training.duration,
      trainingCoaches: [
        {
          id: training.trainingCoaches?.[0].id,
          permissions: training.trainingCoaches?.[0].roles,
        } as unknown as UserEntity,
      ],
      toDto: jest.fn(() => training) as unknown,
    } as TrainingEntity;
    const userLogin = UserFake.buildUserDto();

    training.user.id = 2;

    it('should delete training', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockedTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockResolvedValue(mockedTrainingEntity);
      jest.spyOn(trainingRepository, 'remove').mockImplementation(jest.fn());

      await trainingService.deleteUserTraining(
        userLogin.id,
        training.user.id,
        training.id,
      );

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
      expect(trainingRepository.remove).toBeCalled();
    });

    it('should throw InvalidNotFoundException if training find by id and user id not found', async () => {
      jest.spyOn(trainingRepository, 'findOne').mockResolvedValue(null);

      await expect(
        trainingService.deleteUserTraining(
          userLogin.id,
          training.user.id,
          training.id,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(trainingRepository.findOne).toBeCalled();
    });

    it('should throw InvalidBadRequestException if user login not training owner', async () => {
      const user = { ...userLogin };

      user.id = 3;

      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockedTrainingEntity);
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreator')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.USER_NOT_TRAINING_OWNER,
          );
        });

      await expect(
        trainingService.deleteUserTraining(
          userLogin.id,
          training.user.id,
          training.id,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
    });

    it('should throw InvalidBadRequestException if training date after 7 days', async () => {
      jest
        .spyOn(trainingRepository, 'findOne')
        .mockResolvedValue(mockedTrainingEntity);
      jest.spyOn(mockTrainingValidate, 'validateTrainingCreator');
      jest
        .spyOn(mockTrainingValidate, 'validateTrainingCreatedDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TRAINING_CAN_NOT_BE_CHANGED,
          );
        });

      await expect(
        trainingService.deleteUserTraining(
          userLogin.id,
          training.user.id,
          training.id,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(trainingRepository.findOne).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreator).toBeCalled();
      expect(mockTrainingValidate.validateTrainingCreatedDate).toBeCalled();
    });
  });
});
