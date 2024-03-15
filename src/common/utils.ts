import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { isAfter, startOfDay } from 'date-fns';

import { ErrorCode, InvalidForbiddenException } from '../exceptions';
import type { EmploymentHistoryEntity } from '../modules/employment-history/entities/employment-history.entity';
import type { ExperienceEntity } from '../modules/experience/entities/experience.entity';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(
  password: string | undefined,
  hash: string | undefined,
): Promise<boolean> {
  if (!password || !hash) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, hash);
}

export function getVariableName<TResult>(getVar: () => TResult): string {
  const m = /\(\)=>(.*)/.exec(
    getVar.toString().replace(/(\r\n|\n|\r|\s)/gm, ''),
  );

  if (!m) {
    throw new Error(
      "The function does not contain a statement matching 'return variableName;'",
    );
  }

  const fullMemberName = m[1];

  const memberParts = fullMemberName.split('.');

  return memberParts[memberParts.length - 1];
}

export function validateYearRange(date: Date): void {
  const validateYear = new Date(date).getFullYear();
  const currentYear = new Date().getFullYear();
  const latestYear = currentYear + 10;
  const oldestYear = currentYear - 50;

  if (validateYear > latestYear || validateYear < oldestYear) {
    throw new BadRequestException(
      `Year ${validateYear} is outside the allowed range`,
    );
  }
}

export function validateIsCurrentlyWorking(
  experience: ExperienceEntity | EmploymentHistoryEntity,
) {
  if (experience.dateTo && experience.isCurrentlyWorking) {
    throw new BadRequestException(
      'Cannot have both dateTo and isCurrentlyWorking fields at the same time',
    );
  }
}

export function validateUserEndDate(endDate: Date | undefined): void {
  const currentDate = startOfDay(new Date());

  if (endDate && isAfter(currentDate, endDate)) {
    throw new InvalidForbiddenException(ErrorCode.ACCOUNT_EXPIRED);
  }
}
