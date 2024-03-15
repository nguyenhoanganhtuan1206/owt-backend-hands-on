import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminCertificationController } from '../../controllers/admin-certification.controller';
import { CertificationService } from '../../services/certification.service';
import { CertificationFake } from '../fakes/certification.fake';

describe('AdminCertificationController', () => {
  let adminCertificationController: AdminCertificationController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const certificationDto = CertificationFake.buildCertificationDto();
  const certifications = [certificationDto];

  const mockCertificationService = {
    getCertificationsByUserId: jest.fn(),
    createCertification: jest.fn(),
    updateCertificationPositions: jest.fn(),
    updateToggleCertification: jest.fn(),
    updateCertifications: jest.fn(),
    deleteCertification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCertificationController],
      providers: [
        {
          provide: CertificationService,
          useValue: mockCertificationService,
        },
      ],
    }).compile();

    adminCertificationController = module.get<AdminCertificationController>(
      AdminCertificationController,
    );
  });

  describe('getEmployeeCertifications', () => {
    it('should return all employee certifications', async () => {
      jest
        .spyOn(mockCertificationService, 'getCertificationsByUserId')
        .mockReturnValueOnce(certifications);

      const result =
        await adminCertificationController.getEmployeeCertifications(
          userEntity.id,
        );

      expect(result[0].id).toEqual(certifications[0].id);
      expect(result[0].name).toEqual(certifications[0].name);
      expect(result[0].issuingOrganisation).toEqual(
        certifications[0].issuingOrganisation,
      );
      expect(result[0].user).toEqual(certifications[0].user);
      expect(result[0].position).toEqual(certifications[0].position);

      expect(mockCertificationService.getCertificationsByUserId).toBeCalledWith(
        userEntity.id,
      );
    });
  });

  describe('createEmployeeCertification', () => {
    const createCertification = CertificationFake.buildCreateCertificationDto();

    it('should create employee certification', async () => {
      jest
        .spyOn(mockCertificationService, 'createCertification')
        .mockReturnValueOnce(certificationDto);

      const result =
        await adminCertificationController.createEmployeeCertification(
          userEntity.id,
          createCertification,
        );

      expect(result.id).toEqual(certificationDto.id);
      expect(result.name).toEqual(certificationDto.name);
      expect(result.issuingOrganisation).toEqual(
        certificationDto.issuingOrganisation,
      );
      expect(result.user).toEqual(certificationDto.user);
      expect(result.position).toEqual(certificationDto.position);

      expect(mockCertificationService.createCertification).toBeCalled();
    });
  });

  describe('updateEmployeeCertificationPositions', () => {
    const updatePositions = [
      CertificationFake.buildUpdateCertificationPositionDto(),
    ];

    it('should update positions of employee certification', async () => {
      jest
        .spyOn(mockCertificationService, 'updateCertificationPositions')
        .mockReturnValueOnce(certifications);

      const result =
        await adminCertificationController.updateEmployeeCertificationPositions(
          userEntity.id,
          updatePositions,
        );

      expect(result[0].id).toEqual(certifications[0].id);
      expect(result[0].name).toEqual(certifications[0].name);
      expect(result[0].issuingOrganisation).toEqual(
        certifications[0].issuingOrganisation,
      );
      expect(result[0].user).toEqual(certifications[0].user);
      expect(result[0].position).toEqual(certifications[0].position);

      expect(
        mockCertificationService.updateCertificationPositions,
      ).toBeCalled();
    });
  });

  describe('updateToggleCertification', () => {
    it('should update selected for employee certification by id', async () => {
      jest
        .spyOn(mockCertificationService, 'updateToggleCertification')
        .mockReturnValueOnce(certificationDto);

      const result =
        await adminCertificationController.updateToggleCertification(
          userEntity.id,
          certificationDto.id,
        );

      expect(result.id).toEqual(certificationDto.id);
      expect(result.name).toEqual(certificationDto.name);
      expect(result.issuingOrganisation).toEqual(
        certificationDto.issuingOrganisation,
      );
      expect(result.user).toEqual(certificationDto.user);
      expect(result.position).toEqual(certificationDto.position);

      expect(mockCertificationService.updateToggleCertification).toBeCalledWith(
        userEntity.id,
        certificationDto.id,
      );
    });
  });

  describe('updateCertifications', () => {
    const updateCertifications = [
      CertificationFake.buildUpdateCertificationDto(),
    ];

    it('should update a list of employee certification', async () => {
      jest
        .spyOn(mockCertificationService, 'updateCertifications')
        .mockReturnValueOnce(certifications);

      const result = await adminCertificationController.updateCertifications(
        updateCertifications,
        userEntity.id,
      );

      expect(result[0].id).toEqual(certifications[0].id);
      expect(result[0].name).toEqual(certifications[0].name);
      expect(result[0].issuingOrganisation).toEqual(
        certifications[0].issuingOrganisation,
      );
      expect(result[0].user).toEqual(certifications[0].user);
      expect(result[0].position).toEqual(certifications[0].position);

      expect(mockCertificationService.updateCertifications).toBeCalled();
    });
  });

  describe('deleteCertification', () => {
    it('should delete employee certification by id', async () => {
      jest.spyOn(mockCertificationService, 'deleteCertification');

      await adminCertificationController.deleteCertification(
        userEntity.id,
        certificationDto.id,
      );

      expect(mockCertificationService.deleteCertification).toBeCalledWith(
        userEntity.id,
        certificationDto.id,
      );
    });
  });
});
