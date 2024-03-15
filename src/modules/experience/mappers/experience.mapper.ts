import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import UserMapper from '../../../modules/user/mappers/user.mapper';
import type { CreateExperienceDto } from '../dtos/create-experience.dto';
import type { UpdateExperienceDto } from '../dtos/update-experience.dto';
import { ExperienceEntity } from '../entities/experience.entity';

@Injectable()
export default class ExperienceMapper {
  constructor(
    @InjectRepository(ExperienceEntity)
    private readonly experienceRepository: Repository<ExperienceEntity>,
    private readonly userMapper: UserMapper,
  ) {}

  async toExperienceEntityFromId(id: number): Promise<ExperienceEntity> {
    const experienceEntity = await this.experienceRepository
      .createQueryBuilder('experience')
      .leftJoinAndSelect('experience.user', 'user')
      .leftJoinAndSelect('experience.experienceSkills', 'experienceSkills')
      .leftJoinAndSelect('experienceSkills.skill', 'skill')
      .leftJoinAndSelect('skill.group', 'group')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .where('experience.id = :id', { id })
      .getOne();

    if (!experienceEntity) {
      throw new InvalidNotFoundException(ErrorCode.EXPERIENCE_NOT_FOUND);
    }

    return experienceEntity;
  }

  async toExperienceEntityFromIdAndUserId(
    userId: number,
    id: number,
  ): Promise<ExperienceEntity> {
    const experienceEntity = await this.experienceRepository
      .createQueryBuilder('experience')
      .leftJoinAndSelect('experience.user', 'user')
      .leftJoinAndSelect('experience.experienceSkills', 'experienceSkills')
      .leftJoinAndSelect('experienceSkills.skill', 'skill')
      .leftJoinAndSelect('skill.group', 'group')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .where('experience.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!experienceEntity) {
      throw new InvalidNotFoundException(ErrorCode.EXPERIENCE_NOT_FOUND);
    }

    return experienceEntity;
  }

  async toExperienceEntity(
    userId: number,
    createExperience: CreateExperienceDto,
  ): Promise<ExperienceEntity> {
    const experienceEntity = plainToInstance(
      ExperienceEntity,
      createExperience,
    );

    experienceEntity.user = await this.userMapper.toUserEntityFromId(userId);
    experienceEntity.position = 0;

    return experienceEntity;
  }

  updateEntity(
    experienceEntity: ExperienceEntity,
    updateExperienceDto: UpdateExperienceDto,
  ): ExperienceEntity {
    experienceEntity.dateFrom = updateExperienceDto.dateFrom;
    experienceEntity.dateTo = updateExperienceDto.dateTo;
    experienceEntity.description = updateExperienceDto.description;
    experienceEntity.domain = updateExperienceDto.domain;
    experienceEntity.isCurrentlyWorking =
      updateExperienceDto.isCurrentlyWorking;
    experienceEntity.projectName = updateExperienceDto.projectName;
    experienceEntity.rolesAndResponsibilities =
      updateExperienceDto.rolesAndResponsibilities;

    return experienceEntity;
  }
}
