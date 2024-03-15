/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import type { SkillDto } from 'modules/skill/dtos/skill.dto';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import type { ExperienceEntity } from '../entities/experience.entity';

export class ExperienceDto extends AbstractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiProperty()
  @IsDateString()
  dateFrom: Date;

  @ApiPropertyOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rolesAndResponsibilities: string;

  @ApiProperty()
  @IsInt()
  position: number;

  @ApiProperty()
  @IsBoolean()
  isSelected: boolean;

  @ApiProperty()
  user?: UserDto;

  @ApiProperty()
  @IsBoolean()
  isCurrentlyWorking: boolean;

  @ApiProperty()
  skills?: SkillDto[];

  constructor(experienceEntity: ExperienceEntity) {
    super(experienceEntity);
    this.projectName = experienceEntity.projectName;
    this.dateFrom = experienceEntity.dateFrom;
    this.dateTo = experienceEntity.dateTo;
    this.domain = experienceEntity.domain;
    this.description = experienceEntity.description;
    this.rolesAndResponsibilities = experienceEntity.rolesAndResponsibilities;
    this.position = experienceEntity.position;
    this.isSelected = experienceEntity.isSelected;
    this.user = experienceEntity.user
      ? experienceEntity.user.toDto()
      : undefined;
    this.isCurrentlyWorking = experienceEntity.isCurrentlyWorking;
    this.skills =
      experienceEntity.experienceSkills &&
      experienceEntity.experienceSkills.length > 0 &&
      experienceEntity.experienceSkills.every(
        (experienceSkill) => experienceSkill.skill,
      )
        ? experienceEntity.experienceSkills.map((experienceSkill) =>
            experienceSkill.skill.toDto(),
          )
        : undefined;
  }
}
