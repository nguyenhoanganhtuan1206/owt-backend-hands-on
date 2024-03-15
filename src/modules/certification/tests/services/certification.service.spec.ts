/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as utils from '../../../../common/utils';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import { ValidatorService } from '../../../../shared/services/validator.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { UpdateCertificationDto } from '../../dtos/update-certification.dto';
import type { UpdateCertificationPositionDto } from '../../dtos/update-certification-position.dto';
import { CertificationEntity } from '../../entities/certification.entity';
import CertificationMapper from '../../mappers/certification.mapper';
import { CertificationService } from '../../services/certification.service';
import { CertificationFake } from '../fakes/certification.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('CertificationService', () => {
  let certificationService: CertificationService;
  let certificationRepository: Repository<CertificationEntity>;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const certificationDto = CertificationFake.buildCertificationDto();
  const certificationEntity =
    CertificationFake.buildCertificationEntity(certificationDto);
  const certifications = [certificationEntity];

  const mockCertificationMapper = {
    toCertificationEntity: jest.fn(),
    updateEntity: jest.fn(),
  };

  const mockValidatorService = {
    isUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationService,
        {
          provide: CertificationMapper,
          useValue: mockCertificationMapper,
        },
        {
          provide: ValidatorService,
          useValue: mockValidatorService,
        },
        {
          provide: getRepositoryToken(CertificationEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    certificationService =
      module.get<CertificationService>(CertificationService);
    certificationRepository = module.get<Repository<CertificationEntity>>(
      getRepositoryToken(CertificationEntity),
    );
  });

  describe('getCertificationsByUserId', () => {
    it('should return all all my certification', async () => {
      jest
        .spyOn(certificationRepository, 'find')
        .mockResolvedValueOnce(certifications);

      const result = await certificationService.getCertificationsByUserId(
        userEntity.id,
      );

      expect(result[0].id).toEqual(certifications[0].id);
      expect(result[0].name).toEqual(certifications[0].name);
      expect(result[0].issuingOrganisation).toEqual(
        certifications[0].issuingOrganisation,
      );
      expect(result[0].position).toEqual(certifications[0].position);

      expect(certificationRepository.find).toBeCalledWith({
        where: {
          user: { id: userEntity.id },
        },
        order: {
          position: 'ASC',
        },
      });
    });
  });

  describe('createCertification', () => {
    const createCertification = CertificationFake.buildCertificationDto();

    it('should create my certification', async () => {
      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(mockCertificationMapper, 'toCertificationEntity')
        .mockResolvedValueOnce(certificationEntity);
      jest
        .spyOn(certificationRepository, 'find')
        .mockResolvedValueOnce(certifications);
      jest
        .spyOn(certificationRepository, 'save')
        .mockResolvedValueOnce(certifications[0]);
      jest
        .spyOn(certificationRepository, 'save')
        .mockResolvedValueOnce(certificationEntity);

      const result = await certificationService.createCertification(
        userEntity.id,
        certificationDto,
      );

      expect(result.id).toEqual(certificationDto.id);
      expect(result.name).toEqual(certificationDto.name);
      expect(result.issuingOrganisation).toEqual(
        certificationDto.issuingOrganisation,
      );
      expect(result.position).toEqual(certificationDto.position);

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
      expect(mockCertificationMapper.toCertificationEntity).toBeCalled();
      expect(certificationRepository.find).toBeCalled();
      expect(certificationRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if link is not url', async () => {
      const certificationCreateError = {
        ...CertificationFake.buildCreateCertificationDto(),
        credentialUrl: 'testUrl',
      };

      jest.spyOn(mockValidatorService, 'isUrl').mockReturnValue(false);

      await expect(
        certificationService.createCertification(
          userEntity.id,
          certificationCreateError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockValidatorService.isUrl).toBeCalled();
    });

    it('should throw BadRequestException if year outside the allowed range', async () => {
      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange').mockImplementationOnce(() => {
        throw new BadRequestException();
      });

      await expect(
        certificationService.createCertification(
          userEntity.id,
          certificationDto,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw InvalidBadRequestException if expiration date before issue date', async () => {
      const certificationCreateError =
        CertificationFake.buildCreateCertificationDto();
      certificationCreateError.expirationDate = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      certificationCreateError.issueDate = tomorrow;

      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange');

      await expect(
        certificationService.createCertification(
          userEntity.id,
          certificationCreateError,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(mockCertificationMapper, 'toCertificationEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        certificationService.createCertification(
          userEntity.id,
          createCertification,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
      expect(mockCertificationMapper.toCertificationEntity).toBeCalled();
    });
  });

  describe('updateToggleCertification', () => {
    it('should update selected for my certification by id', async () => {
      jest
        .spyOn(certificationRepository, 'findOne')
        .mockResolvedValueOnce(certificationEntity);
      jest
        .spyOn(certificationRepository, 'save')
        .mockResolvedValueOnce(certificationEntity);

      const result = await certificationService.updateToggleCertification(
        userEntity.id,
        certificationDto.id,
      );

      expect(result.id).toEqual(certificationDto.id);
      expect(result.isSelected).toEqual(certificationDto.isSelected);

      expect(certificationRepository.findOne).toBeCalledWith({
        where: {
          id: certificationDto.id,
          userId: userEntity.id,
        },
      });
      expect(certificationRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if certification not found', async () => {
      jest
        .spyOn(certificationRepository, 'findOne')
        .mockResolvedValueOnce(Promise.resolve(null));

      await expect(
        certificationService.updateToggleCertification(
          userEntity.id,
          certificationDto.id,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(certificationRepository.findOne).toBeCalledWith({
        where: {
          id: certificationDto.id,
          userId: userEntity.id,
        },
      });
    });
  });

  describe('updateCertificationPositions', () => {
    const updatePositions = [
      CertificationFake.buildUpdateCertificationPositionDto(),
    ];

    it('should update positions of my certifications', async () => {
      jest
        .spyOn(certificationRepository, 'find')
        .mockResolvedValueOnce(certifications);
      jest
        .spyOn(certificationRepository, 'save')
        .mockResolvedValueOnce(certifications[0]);

      const result = await certificationService.updateCertificationPositions(
        userEntity.id,
        updatePositions,
      );

      expect(result[0].id).toEqual(certifications[0].id);
      expect(result[0].name).toEqual(certifications[0].name);
      expect(result[0].issuingOrganisation).toEqual(
        certifications[0].issuingOrganisation,
      );
      expect(result[0].position).toEqual(certifications[0].position);

      expect(certificationRepository.find).toBeCalledWith({
        where: { user: { id: userEntity.id } },
        order: { position: 'ASC' },
      });
      expect(certificationRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if duplicate position in request', async () => {
      const updatePositionsError = [
        CertificationFake.buildUpdateCertificationPositionDto(),
        CertificationFake.buildUpdateCertificationPositionDto(),
      ];
      jest
        .spyOn(certificationRepository, 'find')
        .mockResolvedValueOnce(certifications);

      await expect(
        certificationService.updateCertificationPositions(
          userEntity.id,
          updatePositionsError,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(certificationRepository.find).toBeCalledWith({
        where: { user: { id: userEntity.id } },
        order: { position: 'ASC' },
      });
    });

    it('should throw BadRequestException if user in request not found', async () => {
      const updatePosition = {
        ...CertificationFake.buildUpdateCertificationPositionDto(),
        certificationId: 2,
      } as UpdateCertificationPositionDto;
      const updatePositionsError = [updatePosition];

      jest
        .spyOn(certificationRepository, 'find')
        .mockResolvedValueOnce(certifications);

      await expect(
        certificationService.updateCertificationPositions(
          userEntity.id,
          updatePositionsError,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(certificationRepository.find).toBeCalledWith({
        where: { user: { id: userEntity.id } },
        order: { position: 'ASC' },
      });
    });
  });

  describe('updateCertifications', () => {
    const updateCertifications = [
      CertificationFake.buildUpdateCertificationDto(),
    ];

    it('should update a list of my certifications', async () => {
      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(certificationRepository, 'findOne')
        .mockResolvedValueOnce(certificationEntity);
      jest
        .spyOn(mockCertificationMapper, 'updateEntity')
        .mockResolvedValueOnce(certificationEntity);
      jest
        .spyOn(certificationRepository, 'save')
        .mockResolvedValueOnce(certificationEntity);

      const result = await certificationService.updateCertifications(
        userEntity.id,
        updateCertifications,
      );

      expect(result[0].id).toEqual(certifications[0].id);
      expect(result[0].name).toEqual(certifications[0].name);
      expect(result[0].issuingOrganisation).toEqual(
        certifications[0].issuingOrganisation,
      );

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
      expect(certificationRepository.findOne).toBeCalledWith({
        where: {
          id: certificationDto.id,
          userId: userEntity.id,
        },
      });
      expect(mockCertificationMapper.updateEntity).toBeCalled();
      expect(certificationRepository.save).toBeCalled();
    });

    it('should throw InvalidBadRequestException if link is not url', async () => {
      const certificationUpdate = {
        ...CertificationFake.buildUpdateCertificationDto(),
        credentialUrl: 'testUrl',
      } as UpdateCertificationDto;
      const certificationsUpdateError = [certificationUpdate];

      jest.spyOn(mockValidatorService, 'isUrl').mockReturnValue(false);

      await expect(
        certificationService.updateCertifications(
          userEntity.id,
          certificationsUpdateError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockValidatorService.isUrl).toBeCalled();
    });

    it('should throw BadRequestException if year outside the allowed range', async () => {
      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange').mockImplementationOnce(() => {
        throw new BadRequestException();
      });

      await expect(
        certificationService.updateCertifications(
          userEntity.id,
          updateCertifications,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw BadRequestException if expiration date before issue date', async () => {
      const certificationUpdateError =
        CertificationFake.buildUpdateCertificationDto();
      const tomorrow = new Date();

      certificationUpdateError.expirationDate = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      certificationUpdateError.issueDate = tomorrow;

      const updateCertificationsError = [certificationUpdateError];

      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange');

      await expect(
        certificationService.updateCertifications(
          userEntity.id,
          updateCertificationsError,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw NotFoundException if education not found', async () => {
      jest.spyOn(mockValidatorService, 'isUrl').mockResolvedValueOnce(true);
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(certificationRepository, 'findOne')
        .mockResolvedValueOnce(null);

      await expect(
        certificationService.updateCertifications(
          userEntity.id,
          updateCertifications,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockValidatorService.isUrl).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
      expect(certificationRepository.findOne).toBeCalledWith({
        where: {
          id: certificationDto.id,
          userId: userEntity.id,
        },
      });
    });
  });

  describe('deleteCertification', () => {
    it('should delete certification', async () => {
      jest
        .spyOn(certificationRepository, 'findOne')
        .mockResolvedValueOnce(certificationEntity);
      jest
        .spyOn(certificationRepository, 'remove')
        .mockImplementation(jest.fn());
      jest
        .spyOn(certificationRepository, 'find')
        .mockResolvedValueOnce(certifications);
      jest
        .spyOn(certificationRepository, 'save')
        .mockResolvedValueOnce(certifications[0]);

      await certificationService.deleteCertification(
        userEntity.id,
        certificationEntity.id,
      );

      expect(certificationRepository.findOne).toBeCalledWith({
        where: {
          id: certificationDto.id,
          userId: userEntity.id,
        },
      });
      expect(certificationRepository.remove).toBeCalled();
      expect(certificationRepository.find).toBeCalled();
      expect(certificationRepository.save).toBeCalled();
    });

    it('should throw NotFoundException if certification not found', async () => {
      jest
        .spyOn(certificationRepository, 'findOne')
        .mockResolvedValueOnce(null);

      await expect(
        certificationService.deleteCertification(
          userEntity.id,
          certificationEntity.id,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(certificationRepository.findOne).toBeCalledWith({
        where: {
          id: certificationDto.id,
          userId: userEntity.id,
        },
      });
    });
  });
});
