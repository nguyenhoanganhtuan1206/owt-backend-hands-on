import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateExperienceDto } from '../../dtos/create-experience.dto';
import type { ExperienceDto } from '../../dtos/experience.dto';
import type { UpdateExperienceDto } from '../../dtos/update-experience.dto';
import type { UpdateExperiencePositionDto } from '../../dtos/update-experience-position.dto';
import type { ExperienceEntity } from '../../entities/experience.entity';

const userDto = UserFake.buildUserDto();

export const experienceDto: ExperienceDto = {
  id: 1,
  user: userDto,
  projectName: 'project name',
  description: 'description',
  domain: 'domain',
  isCurrentlyWorking: false,
  rolesAndResponsibilities: 'roles and responsibilities',
  skills: [],
  dateFrom: new Date('2024-01-24'),
  dateTo: new Date('2024-01-24'),
  position: 0,
  isSelected: true,
  createdAt: new Date('2024-01-24 09:57:42.195356'),
  updatedAt: new Date('2024-01-24 09:57:42.195356'),
};

export const experienceEntity: ExperienceEntity = {
  validate(): void {
    // do nothing
  },
  projectName: experienceDto.projectName,
  dateFrom: experienceDto.dateFrom,
  domain: experienceDto.domain,
  description: experienceDto.description,
  rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
  position: experienceDto.position,
  isSelected: experienceDto.isSelected,
  user: UserFake.buildUserEntity(userDto),
  isCurrentlyWorking: experienceDto.isCurrentlyWorking,
  experienceSkills: [],
  id: experienceDto.id,
  createdAt: experienceDto.createdAt,
  updatedAt: experienceDto.updatedAt,
  toDto(): ExperienceDto {
    return experienceDto;
  },
};

export const updatePositionExperienceEntity = (
  position?: number,
  id?: number,
): ExperienceEntity => ({
  validate(): void {
    // do nothing
  },
  projectName: experienceDto.projectName,
  dateFrom: experienceDto.dateFrom,
  domain: experienceDto.domain,
  description: experienceDto.description,
  rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
  position: experienceDto.position,
  isSelected: experienceDto.isSelected,
  user: UserFake.buildUserEntity(userDto),
  isCurrentlyWorking: experienceDto.isCurrentlyWorking,
  experienceSkills: [],
  id: experienceDto.id,
  createdAt: experienceDto.createdAt,
  updatedAt: experienceDto.updatedAt,
  toDto(): ExperienceDto {
    return {
      ...experienceDto,
      id: id ?? experienceDto.id,
      position: position ?? experienceDto.position,
    };
  },
});

export const updateToggleExperienceEntity = (): ExperienceEntity => ({
  validate(): void {
    // do nothing
  },
  projectName: experienceDto.projectName,
  dateFrom: experienceDto.dateFrom,
  domain: experienceDto.domain,
  description: experienceDto.description,
  rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
  position: experienceDto.position,
  isSelected: experienceDto.isSelected,
  user: UserFake.buildUserEntity(userDto),
  isCurrentlyWorking: experienceDto.isCurrentlyWorking,
  experienceSkills: [],
  id: experienceDto.id,
  createdAt: experienceDto.createdAt,
  updatedAt: experienceDto.updatedAt,
  toDto(): ExperienceDto {
    return {
      ...experienceDto,
      isSelected: !experienceDto.isSelected,
    };
  },
});

export const validCreateExperienceDto: CreateExperienceDto = {
  projectName: experienceDto.projectName,
  dateFrom: experienceDto.dateFrom,
  domain: experienceDto.domain,
  description: experienceDto.description,
  rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
  skillIds: [0],
  isCurrentlyWorking: true,
};

export const validUpdateExperiencePosition: UpdateExperiencePositionDto[] = [
  {
    experienceId: updatePositionExperienceEntity().id,
    position: updatePositionExperienceEntity().position + 1,
  },
  {
    experienceId: updatePositionExperienceEntity().id + 1,
    position: updatePositionExperienceEntity().position,
  },
];

export const validUpdateExperienceDtos: UpdateExperienceDto[] = [
  {
    id: experienceDto.id,
    projectName: experienceDto.projectName,
    dateFrom: experienceDto.dateFrom,
    domain: experienceDto.domain,
    description: experienceDto.description,
    rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
    skillIds: [0],
    isCurrentlyWorking: false,
  },
];

export const invalidCreateExperienceDtoHaveBothDateToAndIsCurrentlyWorking: CreateExperienceDto =
  {
    projectName: experienceDto.projectName,
    dateFrom: experienceDto.dateFrom,
    dateTo: new Date('2024-01-24'),
    domain: experienceDto.domain,
    description: experienceDto.description,
    rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
    skillIds: [0],
    isCurrentlyWorking: true,
  };

export const invalidCreateExperienceDtoDateToBeforeDateFrom: CreateExperienceDto =
  {
    projectName: experienceDto.projectName,
    dateFrom: new Date('2024-01-24'),
    dateTo: new Date('2024-01-23'),
    domain: experienceDto.domain,
    description: experienceDto.description,
    rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
    skillIds: [0],
    isCurrentlyWorking: false,
  };

export const invalidCreateExperienceDtoSkillIdsEmpty: CreateExperienceDto = {
  projectName: experienceDto.projectName,
  dateFrom: new Date('2024-01-23'),
  dateTo: new Date('2024-01-24'),
  domain: experienceDto.domain,
  description: experienceDto.description,
  rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
  skillIds: [],
  isCurrentlyWorking: false,
};

export const invalidUpdateExperienceDtosHaveBothDateToAndIsCurrentlyWorking: UpdateExperienceDto[] =
  [
    {
      id: experienceDto.id,
      projectName: experienceDto.projectName,
      dateFrom: experienceDto.dateFrom,
      dateTo: new Date('2024-01-24'),
      domain: experienceDto.domain,
      description: experienceDto.description,
      rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
      skillIds: [0],
      isCurrentlyWorking: true,
    },
  ];

export const invalidUpdateExperienceDtosDateToBeforeDateFrom: UpdateExperienceDto[] =
  [
    {
      projectName: experienceDto.projectName,
      dateFrom: new Date('2024-01-24'),
      dateTo: new Date('2024-01-23'),
      domain: experienceDto.domain,
      description: experienceDto.description,
      rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
      skillIds: [0],
      isCurrentlyWorking: false,
      id: experienceDto.id,
    },
  ];

export const invalidUpdateExperienceDtosSkillIdsEmpty: UpdateExperienceDto[] = [
  {
    id: experienceDto.id,
    projectName: experienceDto.projectName,
    dateFrom: new Date('2024-01-23'),
    dateTo: new Date('2024-01-24'),
    domain: experienceDto.domain,
    description: experienceDto.description,
    rolesAndResponsibilities: experienceDto.rolesAndResponsibilities,
    skillIds: [],
    isCurrentlyWorking: false,
  },
];
