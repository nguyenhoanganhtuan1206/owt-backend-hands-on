import type { TrainingLevelDto } from '../../dtos/training-level.dto';

export class TrainingLevelFake {
  static buildTrainingLevelDto(): TrainingLevelDto {
    const trainingLevelDto: TrainingLevelDto = {
      id: 1,
      label: 'Level',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return trainingLevelDto;
  }
}
