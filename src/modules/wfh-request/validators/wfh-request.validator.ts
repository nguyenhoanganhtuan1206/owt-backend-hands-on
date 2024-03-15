import { eachDayOfInterval, isWeekend } from 'date-fns';

import { DateType, RequestStatusType } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { DateProvider } from '../../../providers';

export default class WfhRequestValidator {
  validateWfhRequestDate(dateFrom: Date, dateTo: Date, dateType: string): void {
    const dateFromInTime = DateProvider.extractDateFrom(dateFrom);
    const dateToInTime = DateProvider.extractDateTo(dateTo);

    if (dateToInTime < dateFromInTime) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }

    if (
      dateFromInTime !== dateToInTime &&
      (dateType as DateType) === DateType.HALF_DAY
    ) {
      throw new InvalidBadRequestException(
        ErrorCode.INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT,
      );
    }
  }

  validateWfhRequestTotalDays(
    dateFrom: Date,
    dateTo: Date,
    totalDays: number,
  ): void {
    if (dateTo < dateFrom) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }

    const listDays = eachDayOfInterval({
      start: new Date(dateFrom),
      end: new Date(dateTo),
    });

    const countDays = listDays.filter((day) => !isWeekend(day)).length;

    if (countDays !== totalDays) {
      throw new InvalidBadRequestException(
        ErrorCode.TOTAL_DAYS_OF_REQUEST_IS_NOT_CORRECT,
      );
    }
  }

  validateWfhRequestIsPending(status: string): void {
    if ((status as RequestStatusType) !== RequestStatusType.PENDING) {
      throw new InvalidBadRequestException(
        ErrorCode.TIME_OFF_REQUEST_NOT_EXISTED,
      );
    }
  }
}
