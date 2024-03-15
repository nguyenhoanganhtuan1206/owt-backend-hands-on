import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';

import { InvalidNotFoundException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import type UpdateUserDto from '../dtos/update-user.dto';
import type UserCreationDto from '../dtos/user-creation.dto';
import { UserEntity } from '../entities/user.entity';
import LevelMapper from './level.mapper';
import PositionMapper from './position.mapper';

@Injectable()
export default class UserMapper {
  constructor(
    private readonly positionMapper: PositionMapper,
    private readonly levelMapper: LevelMapper,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async toUserEntity(userCreationDto: UserCreationDto): Promise<UserEntity> {
    const userEntity = plainToInstance(UserEntity, userCreationDto);
    // Update user entity
    userEntity.position = await this.positionMapper.toPositionEntityFromId(
      userCreationDto.positionId,
    );
    userEntity.level = await this.levelMapper.toLevelEntityFromId(
      userCreationDto.levelId,
    );

    return userEntity;
  }

  async toUserEntityToUpdate(
    existingUserEntity: UserEntity,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const editableFields: Array<keyof UpdateUserDto> = [
      'firstName',
      'lastName',
      'trigram',
      'idNo',
      'phoneNo',
      'companyEmail',
      'gender',
      'contractType',
      'dateOfBirth',
      'address',
      'university',
      'startDate',
      'endDate',
      'timekeeperUserId',
    ];

    for (const field of editableFields) {
      existingUserEntity[field] = updateUserDto[field];
    }

    // Update user entity
    existingUserEntity.position =
      await this.positionMapper.toPositionEntityFromId(
        updateUserDto.positionId,
      );
    existingUserEntity.level = await this.levelMapper.toLevelEntityFromId(
      updateUserDto.levelId,
    );

    return existingUserEntity;
  }

  async toUserEntityFromId(userId: number): Promise<UserEntity> {
    const userEntity = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!userEntity) {
      throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    return userEntity;
  }

  async toUserEntities(userIds: number[]): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: {
        id: In(userIds),
      },
    });
  }
}
