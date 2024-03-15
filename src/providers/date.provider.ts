import { format, subMonths } from 'date-fns';

import type { TimeTrackingPageOptionsDto } from '../modules/timekeeper/dtos/time-tracking-page-options.dto';

function convertDateFormat(inputDate: string): string {
  const [year, month, day] = inputDate.split('-');

  return `${day}/${month}/${year}`;
}

function formatDateToDDMMYYYY(inputDate: Date): Date {
  if (typeof inputDate === 'string') {
    return convertDateFormat(inputDate) as unknown as Date;
  }

  if (typeof inputDate === 'object') {
    const day = String(inputDate.getUTCDate()).padStart(2, '0');
    const month = String(inputDate.getUTCMonth() + 1).padStart(2, '0');
    const year = inputDate.getUTCFullYear();

    return `${day}/${month}/${year}` as unknown as Date;
  }

  throw new Error('Invalid date string');
}

export class DateProvider {
  static extractCurrentDate(): number {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    return startDate.getTime();
  }

  static extractDateFrom(dateFrom: Date): number {
    const dateFromFormat = new Date(dateFrom);

    return dateFromFormat.getTime();
  }

  static extractDateTo(dateTo: Date): number {
    const dateToFormat = new Date(dateTo);

    return dateToFormat.getTime();
  }

  static extractDateUTC(dateInput: Date): number {
    const dateExtract = new Date(dateInput);
    dateExtract.setUTCHours(0, 0, 0, 0);

    return dateExtract.getTime();
  }

  static extractDateTimeCurrent(): number {
    const now = new Date();

    return now.getTime();
  }

  static formatDate(date: Date): Date {
    return formatDateToDDMMYYYY(date);
  }

  static formatDateUTC(inputDate: Date): Date {
    return format(inputDate, 'dd/MM/yyyy') as unknown as Date;
  }

  static formatTimeUTC(inputDate: Date): Date {
    return format(inputDate, 'hh:mm:ss') as unknown as Date;
  }

  static formatTimeHHmmssUTC(inputDate: Date): Date {
    return format(inputDate, 'HH:mm:ss') as unknown as Date;
  }

  static formatDateTimeDifference(
    inputDate: Date,
    timeDifference: number,
  ): Date {
    const totalPresenceDate = new Date(inputDate);

    const hours = Math.floor(timeDifference / (60 * 60 * 1000));
    const minutes = Math.floor(
      (timeDifference % (60 * 60 * 1000)) / (60 * 1000),
    );
    const seconds = Math.floor((timeDifference % (60 * 1000)) / 1000);
    const milliseconds = timeDifference % 1000;

    totalPresenceDate.setHours(hours, minutes, seconds, milliseconds);

    return totalPresenceDate;
  }
}

export function setDefaultDateRange(
  pageOptionsDto: TimeTrackingPageOptionsDto,
  useAdminDefault?: boolean,
): TimeTrackingPageOptionsDto {
  const defaultDateFrom = useAdminDefault
    ? new Date()
    : subMonths(new Date(), 1);

  pageOptionsDto.dateFrom = pageOptionsDto.dateFrom || defaultDateFrom;
  pageOptionsDto.dateTo = pageOptionsDto.dateTo || new Date();

  return pageOptionsDto;
}
