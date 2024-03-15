/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CertificationDto } from 'modules/certification/dtos/certification.dto';
import type { EducationDto } from 'modules/education/dtos';
import type { EmploymentHistoryDto } from 'modules/employment-history/dtos/employment-history.dto';
import type { ExperienceDto } from 'modules/experience/dtos/experience.dto';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { RoleType } from '../../../constants';
import { ContractType } from '../../../constants/contract-type';
import { GenderType } from '../../../constants/gender-type';
import type { UserEntity } from '../entities/user.entity';
import { CvDto } from './cv.dto';
import { LevelDto } from './level.dto';
import { PositionDto } from './position.dto';

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  trigram?: string;

  @ApiProperty()
  position?: PositionDto;

  @ApiProperty()
  level?: LevelDto;

  @ApiPropertyOptional()
  idNo?: number;

  @ApiPropertyOptional()
  phoneNo?: string;

  @ApiPropertyOptional()
  qrCode?: string;

  @ApiPropertyOptional()
  photo?: string;

  @ApiProperty()
  companyEmail: string;

  @ApiPropertyOptional({ enum: GenderType })
  gender: GenderType;

  @ApiPropertyOptional({ enum: ContractType })
  contractType: ContractType;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  university?: string;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  firstLogin?: boolean;

  @ApiProperty()
  cv?: CvDto;

  @ApiPropertyOptional()
  allowance?: number;

  @ApiProperty()
  employeeId?: string;

  @ApiProperty()
  roles?: RoleType[];

  @ApiProperty()
  isPairing?: boolean;

  @ApiProperty()
  introduction?: string;

  @ApiProperty()
  timekeeperUserId?: number;

  @ApiPropertyOptional()
  experiences?: ExperienceDto[];

  @ApiPropertyOptional()
  educations?: EducationDto[];

  @ApiPropertyOptional()
  certifications?: CertificationDto[];

  @ApiPropertyOptional()
  employmentHistories?: EmploymentHistoryDto[];

  @ApiPropertyOptional()
  customPosition?: string;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.trigram = user.trigram;
    this.level = user.level;
    this.position = user.position;
    this.idNo = user.idNo;
    this.phoneNo = user.phoneNo;
    this.qrCode = user.qrCode;
    this.photo = user.photo;
    this.companyEmail = user.companyEmail;
    this.gender = user.gender;
    this.contractType = user.contractType;
    this.dateOfBirth = user.dateOfBirth;
    this.address = user.address;
    this.university = user.university;
    this.startDate = user.startDate;
    this.endDate = user.endDate;
    this.isActive = options?.isActive;
    this.firstLogin = user.firstLogin;
    this.allowance = user.yearlyAllowance;
    this.employeeId = user.employeeId;
    this.cv =
      Array.isArray(user.cvs) && user.cvs.length > 0
        ? user.cvs[0].toDto()
        : undefined;
    this.roles =
      user.permissions && user.permissions.length > 0
        ? user.permissions.map((permission) => permission.role)
        : [];
    this.introduction = user.introduction;
    this.timekeeperUserId = user.timekeeperUserId;
    this.experiences =
      user.experiences && user.experiences.length > 0
        ? user.experiences.map((experience) => experience.toDto())
        : undefined;
    this.educations =
      user.educations && user.educations.length > 0
        ? user.educations.map((education) => education.toDto())
        : undefined;
    this.certifications =
      user.certifications && user.certifications.length > 0
        ? user.certifications.map((certification) => certification.toDto())
        : undefined;
    this.employmentHistories =
      user.employmentHistories && user.employmentHistories.length > 0
        ? user.employmentHistories.map((employmentHistory) =>
            employmentHistory.toDto(),
          )
        : undefined;
    this.customPosition = user.customPosition;
  }
}
