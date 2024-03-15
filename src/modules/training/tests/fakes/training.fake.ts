import type { PageDto } from 'common/dto/page.dto';
import type { UserEntity } from 'modules/user/entities/user.entity';

import { Order } from '../../../../constants';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateTrainingDto } from '../../dtos/create-training.dto';
import type { TrainingDto } from '../../dtos/training.dto';
import type { TrainingsPageOptionsDto } from '../../dtos/trainings-page-options.dto';
import type { UpdateTrainingDto } from '../../dtos/update-training.dto';
import type { TrainingEntity } from '../../entities/training.entity';
import { TrainingLevelFake } from './training-level.fake';
import { TrainingTopicFake } from './training-topic.fake';

export class TrainingFake {
  static buildTrainingDto(): TrainingDto {
    const user = UserFake.buildUserDto();
    const trainingDto: TrainingDto = {
      id: 1,
      user,
      trainingDate: new Date(),
      duration: 4,
      trainingTitle: 'Titile',
      trainingDescription: 'Description',
      topic: TrainingTopicFake.buildTrainingTopicDto(),
      level: TrainingLevelFake.buildTrainingLevelDto(),
      trainingLink: 'Link',
      trainingCoaches: [user],
      createdAt: new Date(),
      createdBy: user.id,
      updatedAt: new Date(),
      updatedBy: user.id,
    };

    return trainingDto;
  }

  static buildTrainingEntity(training: TrainingDto): TrainingEntity {
    return {
      id: training.id,
      user: training.user,
      duration: training.duration,
      trainingCoaches: [
        {
          id: training.trainingCoaches?.[0].id,
          roles: training.trainingCoaches?.[0].roles,
        } as unknown as UserEntity,
      ],
      toDto: jest.fn(() => training) as unknown,
    } as unknown as TrainingEntity;
  }

  static buildCreateTrainingDto(): CreateTrainingDto {
    const createTrainingDto: CreateTrainingDto = {
      trainingDate: new Date(),
      duration: 4,
      trainingTitle: 'Titile',
      trainingDescription: 'Description',
      levelId: TrainingLevelFake.buildTrainingLevelDto().id,
      topicId: TrainingTopicFake.buildTrainingTopicDto().id,
      coachIds: [UserFake.buildUserDto().id],
    };

    return createTrainingDto;
  }

  static buildUpdateTrainingDto(): UpdateTrainingDto {
    const updateTrainingDto: UpdateTrainingDto = {
      trainingDate: new Date(),
      duration: 4,
      trainingTitle: 'Titile',
      trainingDescription: 'Description',
      levelId: TrainingLevelFake.buildTrainingLevelDto().id,
      topicId: TrainingTopicFake.buildTrainingTopicDto().id,
      coachIds: [UserFake.buildUserDto().id],
    };

    return updateTrainingDto;
  }

  static buildTrainingsPageOptionsDto(): TrainingsPageOptionsDto {
    const pageOptions: TrainingsPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      title: 'title',
      userName: 'test test',
      skip: 0,
    };

    return pageOptions;
  }

  static buildTrainingsPageDto(): PageDto<TrainingDto> {
    const trainingDtos: PageDto<TrainingDto> = {
      data: [TrainingFake.buildTrainingDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return trainingDtos;
  }
}
