import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { TimeOffCollaboratorController } from '../../controllers/time-off-collaborator.controller';
import { TimeOffCollaboratorService } from '../../services/time-off-collaborator.service';
import { TimeOffCollaboratorFake } from '../fakes/time-off-collaborator.fake';

describe('TimeOffCollaboratorController', () => {
  let timeOffCollaboratorController: TimeOffCollaboratorController;

  const expectedTimeOffCollaboratorDtos =
    TimeOffCollaboratorFake.buildTimeOffCollaboratorPageDto();
  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);

  const mockTimeOffCollaboratorService = {
    getAllCollaborators: jest.fn(),
  };

  const mockAwsS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOffCollaboratorController],
      providers: [
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: TimeOffCollaboratorService,
          useValue: mockTimeOffCollaboratorService,
        },
      ],
    }).compile();

    timeOffCollaboratorController = module.get<TimeOffCollaboratorController>(
      TimeOffCollaboratorController,
    );
  });

  describe('getUserCollaborators', () => {
    const pageOptionsCollaborators =
      TimeOffCollaboratorFake.buildTimeOffCollaboratorPageOptionsDto();
    it('should return a page of time-off collaborators', async () => {
      jest
        .spyOn(mockTimeOffCollaboratorService, 'getAllCollaborators')
        .mockReturnValue(expectedTimeOffCollaboratorDtos);

      const result = await timeOffCollaboratorController.getUserCollaborators(
        userEntity,
        pageOptionsCollaborators,
      );

      expect(result.data[0].id).toEqual(
        expectedTimeOffCollaboratorDtos.data[0].id,
      );
      expect(result.data[0].collaboratorEmail).toEqual(
        expectedTimeOffCollaboratorDtos.data[0].collaboratorEmail,
      );
      expect(result.data[0].collaboratorFirstName).toEqual(
        expectedTimeOffCollaboratorDtos.data[0].collaboratorFirstName,
      );
      expect(result.data[0].collaboratorLastName).toEqual(
        expectedTimeOffCollaboratorDtos.data[0].collaboratorLastName,
      );

      expect(mockTimeOffCollaboratorService.getAllCollaborators).toBeCalled();
    });
  });
});
