import { isBefore } from 'date-fns';

import { InvalidBadRequestException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import { DateProvider } from '../../../providers';
import type { TrainingEntity } from '../entities/training.entity';

export default class TrainingValidator {
  validateTrainingDate(trainingDate: Date): void {
    if (
      DateProvider.extractDateUTC(trainingDate) >
      DateProvider.extractCurrentDate()
    ) {
      throw new InvalidBadRequestException(ErrorCode.TRAINING_DATE_BAD_REQUEST);
    }
  }

  validateTrainingCreatedDate(trainingEntity: TrainingEntity): void {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const extractTrainingDate = DateProvider.extractDateUTC(
      trainingEntity.trainingDate,
    );
    const extractOneWeekAgo = DateProvider.extractDateUTC(oneWeekAgo);

    if (isBefore(extractTrainingDate, extractOneWeekAgo)) {
      throw new InvalidBadRequestException(
        ErrorCode.TRAINING_CAN_NOT_BE_CHANGED,
      );
    }
  }

  validateTrainingCreator(authId: number, ownerId: number): void {
    if (authId !== ownerId) {
      throw new InvalidBadRequestException(ErrorCode.USER_NOT_TRAINING_OWNER);
    }
  }
}
