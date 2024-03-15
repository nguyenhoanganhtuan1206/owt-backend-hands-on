// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import httpMocks from 'node-mocks-http';

import { ErrorCode, InvalidNotFoundException } from '../../../../exceptions';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyCvController } from '../../controllers/my-cv.controller';
import { CvService } from '../../services/cv.service';

describe('MyCVController', () => {
  let myCvController: MyCvController;
  const userDto = UserFake.buildUserDto();
  const user = UserFake.buildUserEntity(userDto);
  const mockCvService = {
    exportCv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyCvController],
      providers: [
        {
          provide: CvService,
          useValue: mockCvService,
        },
      ],
    }).compile();

    myCvController = module.get<MyCvController>(MyCvController);
  });

  describe('exportMyCv', () => {
    it('should return cv of employee with pdf type', async () => {
      const res = httpMocks.createResponse();
      const mockFile = {
        file: Buffer.from('abc'),
        filename: 'abc.pdf',
      };

      jest.spyOn(mockCvService, 'exportCv').mockReturnValueOnce(mockFile);

      await myCvController.exportMyCv(user, res);

      expect(mockCvService.exportCv).toBeCalled();
      expect(res.getHeader('Content-Type')).toEqual('application/pdf');
      expect(res.getHeader('Content-Disposition')).toEqual(
        `attachment; filename=${mockFile.filename}`,
      );
    });

    it('should throw InvalidNotFoundException in case of userId not found', async () => {
      const res = httpMocks.createResponse();

      jest
        .spyOn(mockCvService, 'exportCv')
        .mockRejectedValueOnce(
          new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND),
        );

      await expect(myCvController.exportMyCv(user, res)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(mockCvService.exportCv).toBeCalled();
    });
  });
});
