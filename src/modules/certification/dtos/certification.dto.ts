/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import type { CertificationEntity } from '../entities/certification.entity';

export class CertificationDto extends AbstractDto {
  @ApiProperty()
  user?: UserDto;

  @ApiProperty()
  name: string;

  @ApiProperty()
  issuingOrganisation: string;

  @ApiPropertyOptional()
  issueDate: Date;

  @ApiPropertyOptional()
  expirationDate: Date;

  @ApiPropertyOptional()
  credentialId: string;

  @ApiPropertyOptional()
  credentialUrl: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  isSelected: boolean;

  constructor(certificationEntity: CertificationEntity) {
    super(certificationEntity);
    this.user = certificationEntity.user
      ? certificationEntity.user.toDto()
      : undefined;
    this.name = certificationEntity.name;
    this.issuingOrganisation = certificationEntity.issuingOrganisation;
    this.issueDate = certificationEntity.issueDate;
    this.expirationDate = certificationEntity.expirationDate;
    this.credentialId = certificationEntity.credentialId;
    this.credentialUrl = certificationEntity.credentialUrl;
    this.position = certificationEntity.position;
    this.isSelected = certificationEntity.isSelected;
  }
}
