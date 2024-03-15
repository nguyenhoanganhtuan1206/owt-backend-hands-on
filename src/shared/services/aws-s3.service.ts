import { S3 } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import path from 'path';

import { AWS_DOMAIN, AWS_S3, DOT, HTTPS, SLASH } from '../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../exceptions';
import type { IFile } from '../../interfaces';
import { DateProvider } from '../../providers';
import { ApiConfigService } from './api-config.service';
import { GeneratorService } from './generator.service';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3;

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const awsS3Config = configService.awsS3Config;

    this.s3 = new S3({
      region: awsS3Config.bucketRegion,
      credentials: {
        accessKeyId: awsS3Config.accessKey,
        secretAccessKey: awsS3Config.secretKey,
      },
    });
  }

  async uploadFile(
    file: IFile,
    pathFolder: string,
    userId: number,
  ): Promise<string> {
    this.validateFileUploadSize(file.size);

    const newNameFile = this.generateNewFileName(file.originalname);

    const key = pathFolder + SLASH + userId + SLASH + newNameFile;
    await this.s3.putObject({
      Bucket: this.configService.awsS3Config.bucketName,
      Body: file.buffer,
      Key: key,
    });

    const bucketRegionUrl = [
      this.configService.awsS3Config.bucketName,
      AWS_S3,
      this.configService.awsS3Config.bucketRegion,
      AWS_DOMAIN,
    ].join(DOT);

    return [HTTPS, bucketRegionUrl, SLASH, key].join('');
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = this.getKeyFromFileUrl(fileUrl);

    await this.s3.deleteObject({
      Bucket: this.configService.awsS3Config.bucketName,
      Key: key,
    });

    await this.validateFileUrl(fileUrl);
  }

  private validateFileUploadSize(fileSize: number): void {
    const maxSizeBytes = 2 * 1024 * 1024;

    if (fileSize > maxSizeBytes) {
      throw new InvalidBadRequestException(ErrorCode.FILE_SIZE_EXCEEDS_LIMIT);
    }
  }

  private generateNewFileName(originalFileName: string): string {
    const dateExtract = DateProvider.extractDateTimeCurrent();

    const { name, ext } = path.parse(originalFileName);

    if (!name || !ext) {
      throw new InvalidBadRequestException(ErrorCode.INVALID_FILE_FORMAT);
    }

    const formatName = name.replace(/[^\dA-Za-z-]/g, '_');

    return `${formatName}_${dateExtract}${ext}`;
  }

  private getKeyFromFileUrl(fileUrl: string): string {
    const url = new URL(fileUrl);

    return url.pathname.replace('/', '');
  }

  private async validateFileUrl(fileUrl: string) {
    const response = await fetch(fileUrl, { method: 'GET' });

    if (response.status === 200) {
      throw new InvalidBadRequestException(ErrorCode.ERROR_DELETE_FILE);
    }
  }
}
