import type { PageDto } from 'common/dto/page.dto';
import { differenceInBusinessDays } from 'date-fns';
import type { IFile } from 'interfaces/IFile';

import {
  ContractType,
  GenderType,
  Order,
  RoleType,
  TOTAL_WORK_DAYS_IN_YEAR,
} from '../../../../constants';
import type { LevelDto } from '../../dtos/level.dto';
import type { PasswordDto } from '../../dtos/password.dto';
import type { PermissionDto } from '../../dtos/permission.dto';
import type { PositionDto } from '../../dtos/position.dto';
import type UpdateProfileDto from '../../dtos/update-profile.dto';
import type UpdateUserDto from '../../dtos/update-user.dto';
import type { UserDto } from '../../dtos/user.dto';
import type UserCreationDto from '../../dtos/user-creation.dto';
import type { UsersPageOptionsDto } from '../../dtos/users-page-options.dto';
import type { PermissionEntity } from '../../entities/permission.entity';
import type { UserEntity } from '../../entities/user.entity';

export class UserFake {
  static date = new Date('2024-01-17');

  static buildAdminDto(): UserDto {
    const userDto: UserDto = {
      id: 1,
      firstName: 'test',
      lastName: 'test',
      trigram: 'TT',
      idNo: 1234,
      phoneNo: '123456789',
      qrCode: '12345',
      photo: 'https://s3/avatar/test.png',
      dateOfBirth: UserFake.date,
      timekeeperUserId: 1,
      university: 'test',
      cv: {
        id: 1,
        cv: 'https://s3/cv/test.pdf',
        createdBy: 1,
        updatedBy: 1,
        createdAt: UserFake.date,
        updatedAt: UserFake.date,
      },
      companyEmail: 'test@example.com',
      gender: GenderType.MALE,
      roles: [RoleType.ADMIN],
      contractType: ContractType.FULLTIME,
      isPairing: false,
      introduction: 'introduction',
      firstLogin: true,
      isActive: true,
      position: UserFake.buildPositionDto(),
      level: UserFake.buildLevelDto(),
      startDate: UserFake.date,
      endDate: UserFake.date,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    };

    return userDto;
  }

  static buildUserDto(): UserDto {
    const userDto: UserDto = {
      id: 1,
      firstName: 'test',
      lastName: 'test',
      trigram: 'TT',
      idNo: 1234,
      phoneNo: '123456789',
      qrCode: '12345',
      photo: 'https://s3/avatar/test.png',
      dateOfBirth: UserFake.date,
      university: 'test',
      cv: {
        id: 1,
        cv: 'https://s3/cv/test.pdf',
        createdBy: 1,
        updatedBy: 1,
        createdAt: UserFake.date,
        updatedAt: UserFake.date,
      },
      companyEmail: 'test@example.com',
      gender: GenderType.MALE,
      roles: [RoleType.USER],
      contractType: ContractType.FULLTIME,
      timekeeperUserId: 1,
      isActive: true,
      position: UserFake.buildPositionDto(),
      level: UserFake.buildLevelDto(),
      startDate: UserFake.date,
      endDate: UserFake.date,
      isPairing: true,
      introduction: 'introduction',
      firstLogin: true,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    };

    return userDto;
  }

  static buildLevelDto(): LevelDto {
    const levelDto: LevelDto = {
      id: 1,
      label: 'Senior',
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    };

    return levelDto;
  }

  static buildPositionDto(): PositionDto {
    const positionDto: PositionDto = {
      id: 1,
      name: 'Dev',
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    };

    return positionDto;
  }

  static buildUserDtoBy(id: number, email: string): UserDto {
    const userDto = this.buildUserDto();
    userDto.id = id;
    userDto.companyEmail = email;

    return userDto;
  }

  static buildUserEntity(user: UserDto): UserEntity {
    return {
      id: user.id,
      permissions: user.roles,
      password: 'password',
      isActive: user.isActive,
      timekeeperUserId: user.id,
      toDto: jest.fn(() => user) as unknown,
    } as unknown as UserEntity;
  }

  static buildUserCreationDto(): UserCreationDto {
    const userCreationDto: UserCreationDto = {
      firstName: 'test',
      lastName: 'test',
      trigram: 'TT',
      idNo: 1234,
      phoneNo: '123456789',
      dateOfBirth: UserFake.date,
      university: 'test',
      companyEmail: 'test@example.com',
      gender: GenderType.MALE,
      contractType: ContractType.FULLTIME,
      positionId: 1,
      levelId: 1,
      startDate: UserFake.date,
      endDate: UserFake.date,
    };

    return userCreationDto;
  }

  static buildUpdateUserDto(): UpdateUserDto {
    const updateUserDto: UpdateUserDto = {
      firstName: 'test',
      lastName: 'test',
      trigram: 'TT',
      idNo: 1234,
      phoneNo: '123456789',
      dateOfBirth: UserFake.date,
      university: 'test',
      companyEmail: 'test@example.com',
      gender: GenderType.MALE,
      contractType: ContractType.FULLTIME,
      positionId: 1,
      levelId: 1,
      startDate: UserFake.date,
      endDate: UserFake.date,
    };

    return updateUserDto;
  }

  static buildUpdateProfileDto(): UpdateProfileDto {
    const profileUpdate: UpdateProfileDto = {
      phoneNo: '123456789',
      address: 'fake address',
    };

    return profileUpdate;
  }

  static buildAvatarIFile(): IFile {
    const file: IFile = {
      encoding: 'fakeEncoding',
      buffer: Buffer.from('fakeBufferContent'),
      fieldname: 'avatar',
      mimetype: 'image/jpeg',
      originalname: 'test.jpeg',
      size: 1,
    };

    return file;
  }

  static buildCvIFile(): IFile {
    const file: IFile = {
      encoding: 'fakeEncoding',
      buffer: Buffer.from('fakeBufferContent'),
      fieldname: 'document',
      mimetype: 'application/pdf',
      originalname: 'test.pdf',
      size: 1,
    };

    return file;
  }

  static buildPasswordDto(): PasswordDto {
    const passwordDto: PasswordDto = {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword',
    };

    return passwordDto;
  }

  static buildPermissionDto(): PermissionDto[] {
    const permissionDto: PermissionDto = {
      id: 2,
      role: RoleType.USER,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    };

    return [permissionDto];
  }

  static buildPermissionEntity(
    user: UserEntity,
    permissions: PermissionDto,
  ): PermissionEntity {
    const permissionEntity: PermissionEntity = {
      id: 1,
      user,
      role: RoleType.USER,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
      toDto: jest.fn(() => permissions),
    };

    return permissionEntity;
  }

  static buildUsersPageOptionsDto(): UsersPageOptionsDto {
    const pageOptions: UsersPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
    };

    return pageOptions;
  }

  static buildUsersPageDto(): PageDto<UserDto> {
    const userDtos: PageDto<UserDto> = {
      data: [UserFake.buildUserDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return userDtos;
  }

  static calculateUserAccruedBalance(
    user: UserEntity,
    lastYearBalance: number,
  ): number {
    const totalWorkDaysInYear = TOTAL_WORK_DAYS_IN_YEAR;
    const startOfCurrentDay = new Date();
    startOfCurrentDay.setUTCHours(0, 0, 0, 0);

    const currentYear = startOfCurrentDay.getUTCFullYear();
    let fullYearBalance = user.yearlyAllowance;

    if (user.startDate && user.startDate.getUTCFullYear() >= currentYear) {
      user.startDate.setUTCHours(0, 0, 0, 0);

      const workDaysToEndYearDate = differenceInBusinessDays(
        new Date(Date.UTC(currentYear, 11, 31)),
        user.startDate,
      );
      fullYearBalance =
        (user.yearlyAllowance / totalWorkDaysInYear) * workDaysToEndYearDate;
    }

    const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
    const workDaysToDate = differenceInBusinessDays(
      startOfCurrentDay,
      startOfYear,
    );

    return (
      (fullYearBalance / totalWorkDaysInYear) * workDaysToDate + lastYearBalance
    );
  }
}
