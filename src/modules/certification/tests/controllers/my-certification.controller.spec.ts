import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyCertificationController } from '../../controllers/my-certification.controller';
import { CertificationService } from '../../services/certification.service';
import { CertificationFake } from '../fakes/certification.fake';

describe('MyCertificationController', () => {
  let myCertificationController: MyCertificationController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const certificationDto = CertificationFake.buildCertificationDto();
  const certifications = [certificationDto];

  const mockCertificationService = {
    getCertificationsByUserId: jest.fn(),
    createCertification: jest.fn(),
    updateToggleCertification: jest.fn(),
    updateCertificationPositions: jest.fn(),
    updateCertifications: jest.fn(),
    deleteCertification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyCertificationController],
      providers: [
        {
          provide: CertificationService,
          useValue: mockCertificationService,
        },
      ],
    }).compile();

    myCertificationController = module.get<MyCertificationController>(
      MyCertificationController,
    );
  });

  describe('getMyCertifications', () => {
    it('should return all my certifications', async () => {
      jest
        .spyOn(mockCertificationService, 'getCertificationsByUserId')
        .mockReturnValueOnce(certifications);

      const result =
        await myCertificationController.getMyCertifications(userEntity);

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

  describe('createMyCertification', () => {
    const createCertification = CertificationFake.buildCreateCertificationDto();

    it('should create my certification', async () => {
      jest
        .spyOn(mockCertificationService, 'createCertification')
        .mockReturnValueOnce(certificationDto);

      const result = await myCertificationController.createMyCertification(
        userEntity,
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

  describe('updateToggleCertification', () => {
    it('should update selected for my certification by id', async () => {
      jest
        .spyOn(mockCertificationService, 'updateToggleCertification')
        .mockReturnValueOnce(certificationDto);

      const result = await myCertificationController.updateToggleCertification(
        userEntity,
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

  describe('updateMyCertificationPositions', () => {
    const updatePositions = [
      CertificationFake.buildUpdateCertificationPositionDto(),
    ];

    it('should update positions of my certification', async () => {
      jest
        .spyOn(mockCertificationService, 'updateCertificationPositions')
        .mockReturnValueOnce(certifications);

      const result =
        await myCertificationController.updateMyCertificationPositions(
          userEntity,
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

  describe('updateMyCertificationss', () => {
    const updateCertifications = [
      CertificationFake.buildUpdateCertificationDto(),
    ];

    it('should update a list of my certification', async () => {
      jest
        .spyOn(mockCertificationService, 'updateCertifications')
        .mockReturnValueOnce(certifications);

      const result = await myCertificationController.updateMyCertifications(
        userEntity,
        updateCertifications,
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
    it('should delete my certification by id', async () => {
      jest.spyOn(mockCertificationService, 'deleteCertification');

      await myCertificationController.deleteCertification(
        userEntity,
        certificationDto.id,
      );

      expect(mockCertificationService.deleteCertification).toBeCalledWith(
        userEntity.id,
        certificationDto.id,
      );
    });
  });
});
