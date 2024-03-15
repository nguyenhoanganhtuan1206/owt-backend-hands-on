import { BadRequestException } from '@nestjs/common';

import { ErrorCode, InvalidBadRequestException } from '../exceptions';
import type { IFile } from '../interfaces';

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
] as const;

const PDF_TYPES = ['application/pdf'] as const;

const WORD_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

function validateFileUpload(file?: IFile): void {
  if (!file || file.size === 0) {
    throw new InvalidBadRequestException(ErrorCode.CANNOT_UPLOAD_FILE_EMPTY);
  }
}

export function validateImage(file: IFile): void {
  validateFileUpload(file);

  if (!IMAGE_TYPES.includes(file.mimetype as never)) {
    throw new BadRequestException(
      'Invalid file type. Only accepted types of image',
    );
  }
}

export function validateDocument(file: IFile): void {
  validateFileUpload(file);

  if (
    !PDF_TYPES.includes(file.mimetype as never) &&
    !WORD_TYPES.includes(file.mimetype as never)
  ) {
    throw new BadRequestException(
      'Invalid file type. Only accepted types of pdf or word',
    );
  }
}

export function validateFileType(file: IFile): void {
  validateFileUpload(file);

  if (
    !PDF_TYPES.includes(file.mimetype as never) &&
    !IMAGE_TYPES.includes(file.mimetype as never)
  ) {
    throw new BadRequestException(
      'Invalid file type. Only accepted types of pdf or image',
    );
  }
}
