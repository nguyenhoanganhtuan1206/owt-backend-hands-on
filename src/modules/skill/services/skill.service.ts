import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { In, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { PageDto } from '../../../common/dto/page.dto';
import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import { SkillGroupDto } from '../../skill-group/dtos/skill-group.dto';
import type { SkillGroupsPageOptionsDto } from '../../skill-group/dtos/skill-groups-page-options.dto';
import type { SkillGroupEntity } from '../../skill-group/entities/skill-group.entity';
import { SkillGroupService } from '../../skill-group/services/skill-group.service';
import { UserService } from '../../user/services/user.service';
import { CreateSkillDto } from '../dtos/create-skill.dto';
import type { SkillDto } from '../dtos/skill.dto';
import type { SkillPageOptionsDto } from '../dtos/skill-page-options.dto';
import UpdateMySkillDto from '../dtos/update-my-skill.dto';
import { UpdateSkillDto } from '../dtos/update-skill.dto';
import type { UserSkillDto } from '../dtos/user-skill.dto';
import { SkillEntity } from '../entities/skill.entity';
import { UserSkillEntity } from '../entities/user-skill.entity';
import SkillMapper from '../mappers/skill.mapper';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
    private readonly skillGroupService: SkillGroupService,
    @InjectRepository(UserSkillEntity)
    private readonly userSkillRepository: Repository<UserSkillEntity>,
    private readonly userService: UserService,
    private readonly skillMapper: SkillMapper,
  ) {}

  async getSkillsByUserId(
    pageOptionsDto: SkillGroupsPageOptionsDto,
    userId: number,
  ): Promise<PageDto<SkillGroupDto>> {
    const user = await this.userService.findUserById(userId);
    const userSkillEntities = await this.getAllUserSkillsByUserIdAndGroupId(
      user.id,
    );

    const userSkillDtos: UserSkillDto[] = userSkillEntities.toDtos();

    const skillGroupQueryBuilder =
      this.skillGroupService.getSkillGroupQueryBuilderByOrderBy(pageOptionsDto);
    const [items, pageMetaDto] =
      await skillGroupQueryBuilder.paginate(pageOptionsDto);

    const skillGroupDtos = items.map(
      (skillGroupEntity) => new SkillGroupDto(skillGroupEntity),
    );

    const skillGroupUserDtos = this.updateSkillGroupDtos(
      skillGroupDtos,
      userSkillDtos,
    );

    return new PageDto(skillGroupUserDtos, pageMetaDto);
  }

  async getSelectedUserSkillsByUserId(
    userId: number,
  ): Promise<UserSkillEntity[]> {
    return this.userSkillRepository.find({
      where: { user: { id: userId }, isSelected: true },
      relations: ['skill'],
    });
  }

  async getSkillsByIds(skillIds: number[]): Promise<SkillEntity[]> {
    return this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.group', 'group')
      .where('skill.id IN (:...skillIds)', { skillIds })
      .getMany();
  }

  @Transactional()
  async updateSkills(
    groupId: number,
    userId: number,
    updateMySkillDto: UpdateMySkillDto,
  ): Promise<UserSkillDto[]> {
    const skillGroup = await this.skillGroupService.findSkillGroupById(groupId);

    this.validateSkillInGroup(skillGroup, updateMySkillDto);

    const userSkillsInGroupEntities =
      await this.getAllUserSkillsByUserIdAndGroupId(userId, groupId);

    const userSkillsInGroup: UserSkillDto[] =
      userSkillsInGroupEntities.toDtos();

    await this.removeUserSkillLevelZero(userSkillsInGroup, updateMySkillDto);

    return this.createOrUpdateUserSkills(
      userId,
      userSkillsInGroup,
      updateMySkillDto,
    );
  }

  @Transactional()
  async updateToggleSkill(
    skillId: number,
    userId: number,
  ): Promise<UserSkillDto> {
    const userSkill = await this.findUserSkillByUserIdAndSkillId(
      userId,
      skillId,
    );

    userSkill.isSelected = !userSkill.isSelected;

    const updatedSkill = await this.userSkillRepository.save(userSkill);

    return updatedSkill.toDto();
  }

  @Transactional()
  async updateToggleGroupSkills(
    groupId: number,
    userId: number,
    isCheck: boolean,
  ): Promise<UserSkillDto[]> {
    const userSkillsInGroupEntities =
      await this.getAllUserSkillsByUserIdAndGroupId(userId, groupId);

    this.validateUserSkills(userSkillsInGroupEntities);

    await Promise.all(
      userSkillsInGroupEntities.map(async (userSkill) => {
        userSkill.isSelected = isCheck;
        await this.userSkillRepository.save(userSkill);
      }),
    );

    return userSkillsInGroupEntities.toDtos();
  }

  private validateUserSkills(userSkills: UserSkillEntity[]) {
    if (userSkills.length === 0) {
      throw new BadRequestException(
        'The group should have skills with level greater than zero',
      );
    }
  }

  private async createOrUpdateUserSkills(
    userId: number,
    userSkillsInGroup: UserSkillDto[],
    updateMySkillDto: UpdateMySkillDto,
  ): Promise<UserSkillDto[]> {
    const updateMySkills = updateMySkillDto.skills.filter(
      (dto) => dto.level !== 0,
    );

    const updatedUserSkills: UserSkillDto[] = [];

    const promises: Array<Promise<void>> = updateMySkills.map(async (dto) => {
      const userSkillInGroup = userSkillsInGroup.find(
        (userSkill) => userSkill.skill.id === dto.skillId,
      );

      if (userSkillInGroup) {
        const userSkill = await this.findUserSkillByUserIdAndSkillId(
          userId,
          dto.skillId,
        );

        userSkill.level = dto.level;

        const updateUserSkill = await this.userSkillRepository.save(userSkill);

        updatedUserSkills.push(updateUserSkill.toDto());
      } else {
        const newUserSkill = new UserSkillEntity();

        newUserSkill.user = await this.userService.findUserById(userId);
        newUserSkill.skill = await this.findSkillById(dto.skillId);
        newUserSkill.level = dto.level;

        const createUserSkill =
          await this.userSkillRepository.save(newUserSkill);

        updatedUserSkills.push(createUserSkill.toDto());
      }
    });

    await Promise.all(promises);

    return updatedUserSkills;
  }

  private async removeUserSkillLevelZero(
    userSkillsInGroup: UserSkillDto[],
    updateMySkillDto: UpdateMySkillDto,
  ): Promise<void> {
    const skillsWithLevelZero = updateMySkillDto.skills.filter(
      (dto) => dto.level === 0,
    );

    if (skillsWithLevelZero.length > 0) {
      const userSkillIds = skillsWithLevelZero.map((dto) => {
        const skillInGroup = userSkillsInGroup.find(
          (userSkill) => userSkill.skill.id === dto.skillId,
        );

        if (skillInGroup) {
          return skillInGroup.id;
        }
      });

      const userSkills = await this.userSkillRepository.findBy({
        id: In(userSkillIds),
      });

      if (userSkills.length > 0) {
        await this.userSkillRepository.remove(userSkills);
      }
    }
  }

  private async findSkillById(skillId: number): Promise<SkillEntity> {
    const skill = await this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.group', 'group')
      .where('skill.id = :id', { id: skillId })
      .getOne();

    if (!skill) {
      throw new InvalidNotFoundException(ErrorCode.SKILL_NOT_FOUND);
    }

    return skill;
  }

  private async findUserSkillByUserIdAndSkillId(
    userId: number,
    skillId: number,
  ): Promise<UserSkillEntity> {
    const userSkill = await this.userSkillRepository
      .createQueryBuilder('userSkill')
      .leftJoinAndSelect('userSkill.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('userSkill.skill', 'skill')
      .leftJoinAndSelect('skill.group', 'group')
      .where('user.id = :userId', { userId })
      .andWhere('skill.id = :skillId', { skillId })
      .getOne();

    if (!userSkill) {
      throw new InvalidNotFoundException(ErrorCode.USER_SKILL_NOT_FOUND);
    }

    return userSkill;
  }

  private validateSkillInGroup(
    skillGroup: SkillGroupEntity,
    updateMySkillDto: UpdateMySkillDto,
  ) {
    const invalidSkillIds = updateMySkillDto.skills
      .map((dto) => dto.skillId)
      .filter(
        (skillId) => !skillGroup.skills.some((skill) => skill.id === skillId),
      );

    if (invalidSkillIds.length > 0) {
      throw new BadRequestException(
        `Invalid skillId(s) in the updateMySkillDto: ${JSON.stringify(
          invalidSkillIds,
        )}`,
      );
    }

    const missingSkillIds = skillGroup.skills
      .filter(
        (skill) =>
          !updateMySkillDto.skills.some((dto) => dto.skillId === skill.id),
      )
      .map((missingSkill) => missingSkill.id);

    if (missingSkillIds.length > 0) {
      throw new BadRequestException(
        `Missing skillId(s) in the updateMySkillDto: ${JSON.stringify(
          missingSkillIds,
        )}`,
      );
    }

    const duplicateSkillIds = updateMySkillDto.skills
      .map((dto) => dto.skillId)
      .filter((skillId, index, arr) => arr.indexOf(skillId) !== index);

    if (duplicateSkillIds.length > 0) {
      throw new BadRequestException(
        `Duplicate skillId(s) found in the updateMySkillDto: ${JSON.stringify(
          duplicateSkillIds,
        )}`,
      );
    }
  }

  async getAllSkills(
    pageOptionsDto: SkillPageOptionsDto,
  ): Promise<PageDto<SkillDto>> {
    const queryBuilder = this.getSkillQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createSkill(createSkillDto: CreateSkillDto): Promise<SkillDto> {
    await this.verifySkillBeforeCreate(createSkillDto);

    const skillEntity = await this.skillMapper.toSkillEntity(createSkillDto);
    const skill = await this.skillRepository.save(skillEntity);

    return skill.toDto();
  }

  @Transactional()
  async updateSkill(
    skillId: number,
    updateSkillDto: UpdateSkillDto,
  ): Promise<SkillGroupDto> {
    await this.verifySkillBeforeUpdate(skillId, updateSkillDto);

    const currentSkill = await this.skillMapper.toSkillEntityFromId(skillId);

    const skillEntity = await this.skillMapper.toSkillEntityToUpdate(
      currentSkill,
      updateSkillDto,
    );

    const updatedSkill = await this.skillRepository.save(skillEntity);

    return updatedSkill.toDto();
  }

  private async verifySkillBeforeCreate(createSkill: CreateSkillDto) {
    const existingSkill = await this.skillRepository
      .createQueryBuilder('skill')
      .where('skill.name ILIKE :name', {
        name: createSkill.name,
      })
      .getOne();

    if (existingSkill) {
      throw new BadRequestException(`Skill ${existingSkill.name} is existing`);
    }
  }

  private async verifySkillBeforeUpdate(
    skillId: number,
    updateSkillDto: UpdateSkillDto,
  ) {
    const existingSkill = await this.skillRepository
      .createQueryBuilder('skill')
      .where('skill.id <> :skillId AND skill.name ILIKE :name', {
        skillId,
        name: updateSkillDto.name,
      })
      .getOne();

    if (existingSkill) {
      throw new BadRequestException(`Skill ${existingSkill.name} is existing`);
    }
  }

  private updateSkillGroupDtos(
    skillGroupDtos: SkillGroupDto[],
    userSkills: UserSkillDto[],
  ): SkillGroupDto[] {
    return skillGroupDtos.map((skillGroupDto) => {
      const updatedSkills = skillGroupDto.skills?.map((skillWithLevelDto) => {
        const matchingUserSkill = userSkills.find(
          (userSkill) =>
            userSkill.skill.id === skillWithLevelDto.id &&
            userSkill.skill.group &&
            userSkill.skill.group.id === skillGroupDto.id,
        );

        if (matchingUserSkill) {
          skillWithLevelDto.level = matchingUserSkill.level;
          skillWithLevelDto.isSelected = matchingUserSkill.isSelected;
        }

        return skillWithLevelDto;
      });

      const sortedSkills = updatedSkills?.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      return {
        ...skillGroupDto,
        skills: sortedSkills,
      };
    });
  }

  private getSkillQueryBuilder(
    pageOptionsDto: SkillPageOptionsDto,
  ): SelectQueryBuilder<SkillEntity> {
    const { name, orderBy } = pageOptionsDto;

    const queryBuilder = this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.group', 'group');

    if (name) {
      queryBuilder.andWhere('skill.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    queryBuilder.orderBy('skill.name', orderBy);

    return queryBuilder;
  }

  private async getAllUserSkillsByUserIdAndGroupId(
    userId: number,
    groupId?: number,
  ): Promise<UserSkillEntity[]> {
    const queryBuilder = this.userSkillRepository
      .createQueryBuilder('userSkill')
      .leftJoinAndSelect('userSkill.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('userSkill.skill', 'skill')
      .leftJoinAndSelect('skill.group', 'group')
      .where('user.id = :userId', { userId });

    if (groupId) {
      queryBuilder.andWhere('group.id = :groupId', { groupId });
    }

    return queryBuilder.getMany();
  }
}
