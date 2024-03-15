import type { CreateEmploymentHistoryDto } from 'modules/employment-history/dtos/create-employment-history.dto';
import type { EmploymentHistoryDto } from 'modules/employment-history/dtos/employment-history.dto';
import type { UpdateEmploymentHistoryDto } from 'modules/employment-history/dtos/update-employment-history.dto';
import type { UpdateEmploymentHistoryPositionDto } from 'modules/employment-history/dtos/update-employment-history-position.dto';
import type { UserDto } from 'modules/user/dtos/user.dto';
import type { UserEntity } from 'modules/user/entities/user.entity';

import type { EmploymentHistoryEntity } from '../../entities/employment-history.entity';

export class EmploymentHistoryFake {
  static buildEmploymentHistoryEntity(
    user: UserEntity,
  ): EmploymentHistoryEntity {
    return {
      id: 1,
      user,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
      company: 'Openwt',
      dateFrom: new Date(),
      position: 1,
      isSelected: false,
      isCurrentlyWorking: false,
      toDto: jest.fn(),
      validate: jest.fn(),
    };
  }

  static buildEmploymentHistoryEntityFromDto(
    user: UserEntity,
    employmentHistoryDto: EmploymentHistoryDto,
  ): EmploymentHistoryEntity {
    return {
      id: 1,
      user,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
      company: employmentHistoryDto.company,
      dateFrom: new Date(),
      position: 1,
      isSelected: false,
      isCurrentlyWorking: false,
      toDto: jest.fn(() => employmentHistoryDto) as unknown,
      validate: jest.fn(),
    } as unknown as EmploymentHistoryEntity;
  }

  static buildCreateEmploymentHistoryDto(): CreateEmploymentHistoryDto {
    return {
      company: 'openwt',
      dateFrom: new Date(),
      dateTo: new Date(),
      isCurrentlyWorking: false,
    };
  }

  static buildUpdateEmploymentHistoryDto(
    employmentHistoryId: number,
  ): UpdateEmploymentHistoryDto {
    return {
      id: employmentHistoryId,
      company: 'openwt',
      dateFrom: new Date(),
      dateTo: new Date(),
      isCurrentlyWorking: false,
    };
  }

  static buildUpdateEmploymentHistoryPositionDto(
    employmentHistoryId: number,
  ): UpdateEmploymentHistoryPositionDto {
    return {
      employmentHistoryId,
      position: 2,
    };
  }

  static buildEmploymentHistoryDto(
    user: UserDto,
    employmentHistoryId,
  ): EmploymentHistoryDto {
    return {
      id: employmentHistoryId,
      company: 'openwt',
      dateFrom: new Date(),
      dateTo: new Date(),
      isCurrentlyWorking: false,
      isSelected: false,
      position: 2,
      user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
