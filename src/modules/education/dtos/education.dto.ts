import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import type { EducationEntity } from '../entities/education.entity';

export class EducationDto extends AbstractDto {
  @ApiPropertyOptional()
  user?: UserDto;

  @ApiProperty()
  institution: string;

  @ApiProperty()
  degree: string;

  @ApiProperty()
  dateFrom: Date;

  @ApiProperty()
  dateTo: Date;

  @ApiPropertyOptional()
  position: number;

  @ApiPropertyOptional()
  isSelected: boolean;

  constructor(educationEntity: EducationEntity) {
    super(educationEntity);
    this.user = educationEntity.user ? educationEntity.user.toDto() : undefined;
    this.institution = educationEntity.institution;
    this.degree = educationEntity.degree;
    this.dateFrom = educationEntity.dateFrom;
    this.dateTo = educationEntity.dateTo;
    this.position = educationEntity.position;
    this.isSelected = educationEntity.isSelected;
  }
}
