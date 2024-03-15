import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AuthService } from '../../../auth/services/auth.service';
import { AdminTimeOffCollaboratorController } from '../../controllers/admin-time-off-collaborator.controller';
import { TimeOffCollaboratorService } from '../../services/time-off-collaborator.service';
import { TimeOffCollaboratorFake } from '../fakes/time-off-collaborator.fake';

describe('AdminTimeOffCollaboratorController', () => {
  let adminTimeOffCollaboratorController: AdminTimeOffCollaboratorController;

  const expectedTimeOffCollaboratorDtos =
    TimeOffCollaboratorFake.buildTimeOffCollaboratorPageDto();

  const mockTimeOffCollaboratorService = {
    getAllCollaborators: jest.fn(),
  };

  const mockAuthService = {
    createExternalUserAccessTokenToPM: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTimeOffCollaboratorController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: TimeOffCollaboratorService,
          useValue: mockTimeOffCollaboratorService,
        },
      ],
    }).compile();

    adminTimeOffCollaboratorController =
      module.get<AdminTimeOffCollaboratorController>(
        AdminTimeOffCollaboratorController,
      );
  });

  describe('getCollaborators', () => {
    const pageOptionsCollaborators =
      TimeOffCollaboratorFake.buildTimeOffCollaboratorPageOptionsDto();
    it('should return a page of time-off collaborators', async () => {
      jest
        .spyOn(mockTimeOffCollaboratorService, 'getAllCollaborators')
        .mockReturnValue(expectedTimeOffCollaboratorDtos);

      const result = await adminTimeOffCollaboratorController.getCollaborators(
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
