/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { EmploymentHistoryEntity } from '../entities/employment-history.entity';

export class EmploymentHistoryDto extends AbstractDto {
  @ApiProperty()
  user?: UserDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty()
  @IsDateString()
  dateFrom: Date;

  @ApiPropertyOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiProperty()
  @IsInt()
  position: number;

  @ApiProperty()
  @IsBoolean()
  isSelected: boolean;

  @ApiProperty()
  @IsBoolean()
  isCurrentlyWorking: boolean;

  constructor(employmentHistoryEntity: EmploymentHistoryEntity) {
    super(employmentHistoryEntity);
    this.user = employmentHistoryEntity.user
      ? employmentHistoryEntity.user.toDto()
      : undefined;
    this.company = employmentHistoryEntity.company;
    this.dateFrom = employmentHistoryEntity.dateFrom;
    this.dateTo = employmentHistoryEntity.dateTo;
    this.position = employmentHistoryEntity.position;
    this.isSelected = employmentHistoryEntity.isSelected;
    this.isCurrentlyWorking = employmentHistoryEntity.isCurrentlyWorking;
  }
}
