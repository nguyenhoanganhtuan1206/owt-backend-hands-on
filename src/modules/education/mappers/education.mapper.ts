import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import UserMapper from '../../../modules/user/mappers/user.mapper';
import type { CreateEducationDto } from '../dtos/create-education.dto';
import type { UpdateEducationDto } from '../dtos/update-education.dto';
import { EducationEntity } from '../entities/education.entity';

@Injectable()
export default class EducationMapper {
  constructor(
    @InjectRepository(EducationEntity)
    private readonly educationRepository: Repository<EducationEntity>,
    private readonly userMapper: UserMapper,
  ) {}

  async toEducationEntityFromId(id: number): Promise<EducationEntity> {
    const educationEntity = await this.educationRepository.findOneBy({
      id,
    });

    if (!educationEntity) {
      throw new InvalidNotFoundException(ErrorCode.EDUCATION_NOT_FOUND);
    }

    return educationEntity;
  }

  async toEducationEntity(
    userId: number,
    createEducation: CreateEducationDto,
  ): Promise<EducationEntity> {
    const educationEntity = plainToInstance(EducationEntity, createEducation);

    educationEntity.user = await this.userMapper.toUserEntityFromId(userId);
    educationEntity.position = 0;

    return educationEntity;
  }

  updateEntity(updateDto: UpdateEducationDto, entity: EducationEntity) {
    entity.institution = updateDto.institution;
    entity.degree = updateDto.degree;
    entity.dateFrom = updateDto.dateFrom;
    entity.dateTo = updateDto.dateTo;

    return entity;
  }
}
