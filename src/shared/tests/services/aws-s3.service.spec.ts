/* eslint-disable @typescript-eslint/no-explicit-any */
import { S3 } from '@aws-sdk/client-s3';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AWS_DOMAIN, AWS_S3, DOT, HTTPS, SLASH } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { UserFake } from '../../../modules/user/tests/fakes/user.fake';
import { ApiConfigService } from '../../services/api-config.service';
import { AwsS3Service } from '../../services/aws-s3.service';
import { GeneratorService } from '../../services/generator.service';
import { AwsS3Fake } from '../fakes/aws-s3.fake';

describe('AwsS3Service', () => {
  const mockApiConfigService = {
    awsS3Config: {
      bucketRegion: jest.fn(),
      bucketName: jest.fn(),
      accessKey: jest.fn(),
      secretKey: jest.fn(),
    },
  };

  let awsS3Service: AwsS3Service;
  const awsS3Config = mockApiConfigService.awsS3Config;
  const user = UserFake.buildUserDto();
  const file = AwsS3Fake.buildFile();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsS3Service,
        GeneratorService,
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService,
        },
      ],
    }).compile();

    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  describe('uploadFile', () => {
    const pathFolder = 'uploads';
    const mockGeneratedFileName = 'example_123.txt';

    it('should upload a file to S3 and return the file URL', async () => {
      const expectedKey = `${pathFolder}/${user.id}/${mockGeneratedFileName}`;
      const expectedBucketRegionUrl = [
        awsS3Config.bucketName,
        AWS_S3,
        awsS3Config.bucketRegion,
        AWS_DOMAIN,
      ].join(DOT);
      const expectedUrl = [
        HTTPS,
        expectedBucketRegionUrl,
        SLASH,
        expectedKey,
      ].join('');

      jest
        .spyOn(awsS3Service as any, 'generateNewFileName')
        .mockImplementation(() => mockGeneratedFileName);

      const mockS3PutObject = jest
        .spyOn(S3.prototype, 'putObject')
        .mockImplementationOnce(() => ({
          promise: jest.fn().mockResolvedValue({}),
        }));

      const result = await awsS3Service.uploadFile(file, pathFolder, user.id);

      expect(result).toEqual(expectedUrl);

      expect(mockS3PutObject).toHaveBeenCalledWith({
        Bucket: awsS3Config.bucketName,
        Body: file.buffer,
        Key: `${pathFolder}/${user.id}/${mockGeneratedFileName}`,
      });
    });
  });

  // describe('deleteFile', () => {
  //   it('should delete a file from S3', async () => {
  //     const mockFileUrl = 'https://example.com/uploads/1/example.txt';

  //     const mockS3DeleteObject = jest
  //       .spyOn(S3.prototype, 'deleteObject')
  //       .mockImplementation(jest.fn());

  //     await expect(
  //       awsS3Service.deleteFile(mockFileUrl),
  //     ).resolves.toBeUndefined();

  //     expect(mockS3DeleteObject).toHaveBeenCalledWith({
  //       Bucket: awsS3Config.bucketName,
  //       Key: 'uploads/1/example.txt',
  //     });
  //   });

  //   it('should throw InvalidBadRequestException when file does not exist', async () => {
  //     const mockFileUrl = 'https://example.com/uploads/1/nonexistent_file.txt';

  //     const mockS3DeleteObject = jest
  //       .spyOn(S3.prototype, 'deleteObject')
  //       .mockImplementationOnce(() => ({
  //         promise: jest.fn().mockResolvedValue({}),
  //       }));

  //     const mockValidateFileUrl = jest
  //       .spyOn(awsS3Service as any, 'validateFileUrl')
  //       .mockRejectedValue(
  //         new InvalidBadRequestException(ErrorCode.ERROR_DELETE_FILE),
  //       );

  //     await expect(awsS3Service.deleteFile(mockFileUrl)).rejects.toThrowError(
  //       InvalidBadRequestException,
  //     );

  //     expect(mockS3DeleteObject).toHaveBeenCalledWith({
  //       Bucket: awsS3Config.bucketName,
  //       Key: 'uploads/1/nonexistent_file.txt',
  //     });

  //     expect(mockValidateFileUrl).toHaveBeenCalledWith(mockFileUrl);
  //   });
  // });
});
