import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import type { CreateSkillGroupDto } from '../dtos/create-skill-group.dto';
import type { UpdateSkillGroupDto } from '../dtos/update-skill-group.dto';
import { SkillGroupEntity } from '../entities/skill-group.entity';

@Injectable()
export default class SkillGroupMapper {
  constructor(
    @InjectRepository(SkillGroupEntity)
    private readonly skillGroupRepository: Repository<SkillGroupEntity>,
  ) {}

  async toSkillGroupEntityFromId(id: number): Promise<SkillGroupEntity> {
    const skillGroupEntity = await this.skillGroupRepository.findOneBy({
      id,
    });

    if (!skillGroupEntity) {
      throw new InvalidNotFoundException(ErrorCode.SKILL_GROUP_NOT_FOUND);
    }

    return skillGroupEntity;
  }

  toSkillGroupEntity(
    createSkillGroupDto: CreateSkillGroupDto,
  ): SkillGroupEntity {
    return plainToInstance(SkillGroupEntity, createSkillGroupDto);
  }

  toSkillGroupEntityToUpdate(
    existingSkillGroupEntity: SkillGroupEntity,
    updateSkillGroupDto: UpdateSkillGroupDto,
  ): SkillGroupEntity {
    existingSkillGroupEntity.name = updateSkillGroupDto.name;

    return existingSkillGroupEntity;
  }
}
