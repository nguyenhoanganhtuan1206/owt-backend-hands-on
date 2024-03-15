import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PageDto } from 'common/dto/page.dto';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import { CreateSkillGroupDto } from '../dtos/create-skill-group.dto';
import type { SkillGroupDto } from '../dtos/skill-group.dto';
import type { SkillGroupsPageOptionsDto } from '../dtos/skill-groups-page-options.dto';
import { UpdateSkillGroupDto } from '../dtos/update-skill-group.dto';
import { SkillGroupEntity } from '../entities/skill-group.entity';
import SkillGroupMapper from '../mappers/skill-group.mapper';

@Injectable()
export class SkillGroupService {
  constructor(
    @InjectRepository(SkillGroupEntity)
    private readonly skillGroupRepository: Repository<SkillGroupEntity>,
    private readonly skillGroupMapper: SkillGroupMapper,
  ) {}

  async getAllSkillGroups(
    pageOptionsDto: SkillGroupsPageOptionsDto,
  ): Promise<PageDto<SkillGroupDto>> {
    const queryBuilder = this.getSkillGroupQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  private getSkillGroupQueryBuilder(
    pageOptionsDto: SkillGroupsPageOptionsDto,
  ): SelectQueryBuilder<SkillGroupEntity> {
    const { name, orderBy } = pageOptionsDto;

    const queryBuilder = this.skillGroupRepository
      .createQueryBuilder('skillGroup')
      .leftJoinAndSelect('skillGroup.skills', 'skills');

    if (name) {
      queryBuilder.andWhere('skillGroup.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    queryBuilder.orderBy('skillGroup.name', orderBy);
    queryBuilder.addOrderBy('skills.name', orderBy);

    return queryBuilder;
  }

  @Transactional()
  async createSkillGroup(
    createSkillGroupDto: CreateSkillGroupDto,
  ): Promise<SkillGroupDto> {
    await this.verifySkillGroupBeforeCreate(createSkillGroupDto);

    const skillGroupEntity =
      this.skillGroupMapper.toSkillGroupEntity(createSkillGroupDto);
    const skillGroup = await this.skillGroupRepository.save(skillGroupEntity);

    return skillGroup.toDto();
  }

  @Transactional()
  async updateSkillGroup(
    groupId: number,
    updateSkillGroupDto: UpdateSkillGroupDto,
  ): Promise<SkillGroupDto> {
    await this.verifySkillGroupBeforeUpdate(groupId, updateSkillGroupDto);

    const currentGroup =
      await this.skillGroupMapper.toSkillGroupEntityFromId(groupId);

    const skillGroupEntity = this.skillGroupMapper.toSkillGroupEntityToUpdate(
      currentGroup,
      updateSkillGroupDto,
    );

    const updatedGroup = await this.skillGroupRepository.save(skillGroupEntity);

    return updatedGroup.toDto();
  }

  private async verifySkillGroupBeforeCreate(
    createSkillGroup: CreateSkillGroupDto,
  ) {
    const existingGroup = await this.skillGroupRepository
      .createQueryBuilder('skillGroup')
      .where('LOWER(skillGroup.name) = LOWER(:groupName)', {
        groupName: createSkillGroup.name,
      })
      .getOne();

    if (existingGroup) {
      throw new BadRequestException(
        `Skill group ${existingGroup.name} is existing`,
      );
    }
  }

  private async verifySkillGroupBeforeUpdate(
    groupId: number,
    updateSkillGroupDto: UpdateSkillGroupDto,
  ) {
    const existingGroup = await this.skillGroupRepository
      .createQueryBuilder('skillGroup')
      .where(
        'skillGroup.id <> :groupId AND LOWER(skillGroup.name) = LOWER(:groupName)',
        { groupId, groupName: updateSkillGroupDto.name },
      )
      .getOne();

    if (existingGroup) {
      throw new BadRequestException(
        `Skill group ${existingGroup.name} is existing`,
      );
    }
  }

  async searchSkills(name?: string): Promise<SkillGroupDto[]> {
    const skillQueryBuilder = this.skillGroupRepository
      .createQueryBuilder('skillGroup')
      .leftJoinAndSelect('skillGroup.skills', 'skills')
      .orderBy('skillGroup.name', 'ASC');

    if (name) {
      skillQueryBuilder.andWhere('skills.name ILIKE :search', {
        search: `%${name}%`,
      });
      skillQueryBuilder.addOrderBy('skills.name', 'ASC');
    }

    const skills = await skillQueryBuilder.getMany();

    return skills.toDtos();
  }

  public async findSkillGroupById(groupId: number): Promise<SkillGroupEntity> {
    const skillGroup = await this.skillGroupRepository.findOneBy({
      id: groupId,
    });

    if (!skillGroup) {
      throw new InvalidNotFoundException(ErrorCode.SKILL_GROUP_NOT_FOUND);
    }

    return skillGroup;
  }

  public getSkillGroupQueryBuilderByOrderBy(
    pageOptionsDto: SkillGroupsPageOptionsDto,
  ): SelectQueryBuilder<SkillGroupEntity> {
    const { orderBy } = pageOptionsDto;

    return this.skillGroupRepository
      .createQueryBuilder('skillGroup')
      .leftJoinAndSelect('skillGroup.skills', 'skills')
      .orderBy('skillGroup.name', orderBy);
  }
}
