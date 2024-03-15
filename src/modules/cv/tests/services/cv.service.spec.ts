import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as puppeteer from 'puppeteer';

import { ErrorCode, InvalidNotFoundException } from '../../../../exceptions';
import { CertificationService } from '../../../certification/services/certification.service';
import { CertificationFake } from '../../../certification/tests/fakes/certification.fake';
import { EducationService } from '../../../education/services/education.service';
import { EducationFake } from '../../../education/tests/fakes/education.fake';
import { EmploymentHistoryService } from '../../../employment-history/services/employment-history.service';
import { EmploymentHistoryFake } from '../../../employment-history/tests/fakes/employment-history.fake';
import { ExperienceService } from '../../../experience/services/experience.service';
import { experienceEntity } from '../../../experience/tests/fakes/experience.fake';
import { SkillService } from '../../../skill/services/skill.service';
import { userSkillEntity } from '../../../skill/tests/fakes/skill.fake';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { CvService } from '../../services/cv.service';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

jest.mock('puppeteer');

describe('CVService', () => {
  let cvService: CvService;

  const userDto = UserFake.buildUserDto();
  const user = UserFake.buildUserEntity(userDto);
  const educations = [
    EducationFake.buildEducationEntity(EducationFake.buildEducationDto()),
  ];
  const certifications = [
    CertificationFake.buildCertificationEntity(
      CertificationFake.buildCertificationDto(),
    ),
  ];
  const employmentHistories = [
    EmploymentHistoryFake.buildEmploymentHistoryEntity(user),
  ];
  const userSkillEntities = [userSkillEntity];
  const experienceEntities = [experienceEntity];

  const mockUserService = {
    getUserById: jest.fn(),
  };

  const mockEducationService = {
    getSelectedEducationsByUserId: jest.fn(),
  };

  const mockCertificationService = {
    getSelectedCertificationsByUserId: jest.fn(),
  };

  const mockExperienceService = {
    getSelectedExperiencesByUserId: jest.fn(),
  };

  const mockSkillService = {
    getSelectedUserSkillsByUserId: jest.fn(),
  };

  const mockEmploymentHistoryService = {
    getSelectedEmploymentHistoriesByUserId: jest.fn(),
  };

  const mockPage = {
    setContent: jest.fn(),
    emulateMediaType: jest.fn(),
    pdf: jest.fn().mockResolvedValue(Buffer.from('')),
    close: jest.fn(),
  };

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        {
          provide: EducationService,
          useValue: mockEducationService,
        },
        {
          provide: CertificationService,
          useValue: mockCertificationService,
        },
        {
          provide: ExperienceService,
          useValue: mockExperienceService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
        {
          provide: EmploymentHistoryService,
          useValue: mockEmploymentHistoryService,
        },
      ],
    }).compile();
    cvService = module.get<CvService>(CvService);
  });

  describe('exportCv', () => {
    it('should return cv of employee with pdf type in case of full data', async () => {
      jest
        .spyOn(mockUserService, 'getUserById')
        .mockImplementationOnce(() => userDto);
      jest
        .spyOn(mockEducationService, 'getSelectedEducationsByUserId')
        .mockImplementationOnce(() => educations);
      jest
        .spyOn(mockCertificationService, 'getSelectedCertificationsByUserId')
        .mockImplementationOnce(() => certifications);
      jest
        .spyOn(mockExperienceService, 'getSelectedExperiencesByUserId')
        .mockImplementationOnce(() => experienceEntities);
      jest
        .spyOn(mockSkillService, 'getSelectedUserSkillsByUserId')
        .mockImplementationOnce(() => userSkillEntities);
      jest
        .spyOn(
          mockEmploymentHistoryService,
          'getSelectedEmploymentHistoriesByUserId',
        )
        .mockImplementationOnce(() => employmentHistories);
      (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await cvService.exportCv(user.id);

      expect(result.filename).toEqual('CV-test-test.pdf');
      expect(result.file).not.toBeNull();
      expect(mockUserService.getUserById).toBeCalled();
      expect(mockEducationService.getSelectedEducationsByUserId).toBeCalled();
      expect(
        mockCertificationService.getSelectedCertificationsByUserId,
      ).toBeCalled();
      expect(mockExperienceService.getSelectedExperiencesByUserId).toBeCalled();
      expect(mockSkillService.getSelectedUserSkillsByUserId).toBeCalled();
      expect(
        mockEmploymentHistoryService.getSelectedEmploymentHistoriesByUserId,
      ).toBeCalled();
    });

    it('should return cv of employee with pdf type in case of empty data with userId valid', async () => {
      jest
        .spyOn(mockUserService, 'getUserById')
        .mockImplementationOnce(() => userDto);
      jest
        .spyOn(mockEducationService, 'getSelectedEducationsByUserId')
        .mockImplementationOnce(() => []);
      jest
        .spyOn(mockCertificationService, 'getSelectedCertificationsByUserId')
        .mockImplementationOnce(() => []);
      jest
        .spyOn(mockExperienceService, 'getSelectedExperiencesByUserId')
        .mockImplementationOnce(() => []);
      jest
        .spyOn(mockSkillService, 'getSelectedUserSkillsByUserId')
        .mockImplementationOnce(() => []);
      jest
        .spyOn(
          mockEmploymentHistoryService,
          'getSelectedEmploymentHistoriesByUserId',
        )
        .mockImplementationOnce(() => []);
      (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await cvService.exportCv(user.id);

      expect(result.filename).toEqual('CV-test-test.pdf');
      expect(result.file).not.toBeNull();
      expect(mockUserService.getUserById).toBeCalled();
      expect(mockEducationService.getSelectedEducationsByUserId).toBeCalled();
      expect(
        mockCertificationService.getSelectedCertificationsByUserId,
      ).toBeCalled();
      expect(mockExperienceService.getSelectedExperiencesByUserId).toBeCalled();
      expect(mockSkillService.getSelectedUserSkillsByUserId).toBeCalled();
      expect(
        mockEmploymentHistoryService.getSelectedEmploymentHistoriesByUserId,
      ).toBeCalled();
    });

    it('should throw InvalidNotFoundException in case of userId not found', async () => {
      jest
        .spyOn(mockUserService, 'getUserById')
        .mockRejectedValueOnce(
          new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND),
        );

      await expect(cvService.exportCv(user.id)).rejects.toThrow(
        InvalidNotFoundException,
      );

      expect(mockUserService.getUserById).toBeCalled();
    });
  });
});
