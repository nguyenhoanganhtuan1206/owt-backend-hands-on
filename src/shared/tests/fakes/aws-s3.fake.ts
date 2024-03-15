import type { IFile } from '../../../interfaces';

export class AwsS3Fake {
  static buildFile(): IFile {
    const file: IFile = {
      encoding: 'encoding',
      buffer: Buffer.from('bufferContent'),
      fieldname: 'attachFile',
      mimetype: 'image/jpeg',
      originalname: 'test.jpeg',
      size: 1,
    };

    return file;
  }
}
