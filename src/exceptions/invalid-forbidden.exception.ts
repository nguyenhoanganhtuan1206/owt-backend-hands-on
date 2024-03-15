import { ForbiddenException } from '@nestjs/common';

import type { ErrorCode } from './error-code';
import { ERROR_MESSAGES } from './error-messages';

export class InvalidForbiddenException extends ForbiddenException {
  constructor(private readonly errorCode: ErrorCode) {
    super(ERROR_MESSAGES[errorCode]);
  }
}
