import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CertificationDto } from '../../dtos/certification.dto';
import type { CreateCertificationDto } from '../../dtos/create-certification.dto';
import type { UpdateCertificationDto } from '../../dtos/update-certification.dto';
import type { UpdateCertificationPositionDto } from '../../dtos/update-certification-position.dto';
import type { CertificationEntity } from '../../entities/certification.entity';

export class CertificationFake {
  static buildCertificationDto(): CertificationDto {
    const certificationDto: CertificationDto = {
      id: 1,
      user: UserFake.buildAdminDto(),
      name: 'nameFake',
      issuingOrganisation: 'issuingOrganisationFake',
      issueDate: new Date(),
      expirationDate: new Date(),
      credentialId: 'credentialIdFake',
      credentialUrl: 'http://credential.url',
      position: 0,
      isSelected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return certificationDto;
  }

  static buildCertificationEntity(
    certification: CertificationDto,
  ): CertificationEntity {
    return {
      id: certification.id,
      user: certification.user
        ? UserFake.buildUserEntity(certification.user)
        : null,
      name: certification.name,
      issuingOrganisation: certification.issuingOrganisation,
      position: certification.position,
      credentialUrl: certification.credentialUrl,
      isSelected: certification.isSelected,
      toDto: jest.fn(() => certification) as unknown,
    } as unknown as CertificationEntity;
  }

  static buildCreateCertificationDto(): CreateCertificationDto {
    const createCertification: CreateCertificationDto = {
      name: 'nameFake',
      issuingOrganisation: 'issuingOrganisationFake',
      issueDate: new Date(),
      expirationDate: new Date(),
      credentialId: 'credentialIdFake',
      credentialUrl: 'http://credential.url',
    };

    return createCertification;
  }

  static buildUpdateCertificationDto(): UpdateCertificationDto {
    const updateCertification: UpdateCertificationDto = {
      id: 1,
      name: 'nameFake',
      issuingOrganisation: 'issuingOrganisationFake',
      issueDate: new Date(),
      expirationDate: new Date(),
      credentialId: 'credentialIdFake',
      credentialUrl: 'http://credential.url',
    };

    return updateCertification;
  }

  static buildUpdateCertificationPositionDto(): UpdateCertificationPositionDto {
    const updatePosition: UpdateCertificationPositionDto = {
      certificationId: 1,
      position: 0,
    };

    return updatePosition;
  }
}
