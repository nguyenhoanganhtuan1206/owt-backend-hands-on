import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import SkillGroupMapper from '../../skill-group/mappers/skill-group.mapper';
import type { CreateSkillDto } from '../dtos/create-skill.dto';
import type { UpdateSkillDto } from '../dtos/update-skill.dto';
import { SkillEntity } from '../entities/skill.entity';

@Injectable()
export default class SkillMapper {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
    private readonly skillGroupMapper: SkillGroupMapper,
  ) {}

  async toSkillEntityFromId(id: number): Promise<SkillEntity> {
    const skillEntity = await this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.group', 'group')
      .where('skill.id = :id', { id })
      .getOne();

    if (!skillEntity) {
      throw new InvalidNotFoundException(ErrorCode.SKILL_NOT_FOUND);
    }

    return skillEntity;
  }

  async toSkillEntity(createSkillDto: CreateSkillDto): Promise<SkillEntity> {
    const skillEntity = plainToInstance(SkillEntity, createSkillDto);

    skillEntity.group = await this.skillGroupMapper.toSkillGroupEntityFromId(
      createSkillDto.groupId,
    );

    return skillEntity;
  }

  async toSkillEntityToUpdate(
    existingSkillEntity: SkillEntity,
    updateSkillDto: UpdateSkillDto,
  ): Promise<SkillEntity> {
    existingSkillEntity.name = updateSkillDto.name;

    existingSkillEntity.group =
      await this.skillGroupMapper.toSkillGroupEntityFromId(
        updateSkillDto.groupId,
      );

    return existingSkillEntity;
  }
}
