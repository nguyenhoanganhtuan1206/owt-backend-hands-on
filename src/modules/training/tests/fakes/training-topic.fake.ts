import type { TrainingTopicDto } from '../../dtos/training-topic.dto';

export class TrainingTopicFake {
  static buildTrainingTopicDto(): TrainingTopicDto {
    const trainingTopicDto: TrainingTopicDto = {
      id: 1,
      label: 'Topic',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return trainingTopicDto;
  }
}
