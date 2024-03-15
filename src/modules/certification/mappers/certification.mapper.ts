import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import UserMapper from '../../../modules/user/mappers/user.mapper';
import type { CreateCertificationDto } from '../dtos/create-certification.dto';
import type { UpdateCertificationDto } from '../dtos/update-certification.dto';
import { CertificationEntity } from '../entities/certification.entity';

@Injectable()
export default class CertificationMapper {
  constructor(private readonly userMapper: UserMapper) {}

  async toCertificationEntity(
    userId: number,
    createCertification: CreateCertificationDto,
  ): Promise<CertificationEntity> {
    const certificationEntity = plainToInstance(
      CertificationEntity,
      createCertification,
    );

    certificationEntity.user = await this.userMapper.toUserEntityFromId(userId);
    certificationEntity.position = 0;

    return certificationEntity;
  }

  updateEntity(
    certificationEntity: CertificationEntity,
    updateCertificationDto: UpdateCertificationDto,
  ): CertificationEntity {
    certificationEntity.credentialId = updateCertificationDto.credentialId;
    certificationEntity.credentialUrl = updateCertificationDto.credentialUrl;
    certificationEntity.expirationDate = updateCertificationDto.expirationDate;
    certificationEntity.issueDate = updateCertificationDto.issueDate;
    certificationEntity.issuingOrganisation =
      updateCertificationDto.issuingOrganisation;
    certificationEntity.name = updateCertificationDto.name;

    return certificationEntity;
  }
}
