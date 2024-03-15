import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { validateYearRange } from '../../../common/utils';
import { Order } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { DateProvider } from '../../../providers';
import { SkillService } from '../../skill/services/skill.service';
import { CreateExperienceDto } from '../dtos/create-experience.dto';
import type { ExperienceDto } from '../dtos/experience.dto';
import type { UpdateExperienceDto } from '../dtos/update-experience.dto';
import type { UpdateExperiencePositionDto } from '../dtos/update-experience-position.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { ExperienceSkillEntity } from '../entities/experience-skill.entity';
import ExperienceMapper from '../mappers/experience.mapper';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(ExperienceEntity)
    private readonly experienceRepository: Repository<ExperienceEntity>,
    @InjectRepository(ExperienceSkillEntity)
    private readonly experienceSkillRepository: Repository<ExperienceSkillEntity>,
    private readonly experienceMapper: ExperienceMapper,
    private readonly skillService: SkillService,
  ) {}

  @Transactional()
  async createExperience(
    userId: number,
    createExperience: CreateExperienceDto,
  ): Promise<ExperienceDto> {
    this.validateExperienceBeforeCreateOrUpdate(createExperience);

    const experienceEntity = await this.experienceMapper.toExperienceEntity(
      userId,
      createExperience,
    );

    await this.incrementExistingExperiencePositions(userId);

    const newExperience =
      await this.experienceRepository.save(experienceEntity);

    const skillEntities = await this.skillService.getSkillsByIds(
      createExperience.skillIds,
    );

    const experienceSkillsEntities = skillEntities.map((skillEntity) => ({
      experience: newExperience,
      skill: skillEntity,
    }));

    const newExperienceSkills = await this.experienceSkillRepository.save(
      experienceSkillsEntities,
    );
    newExperience.experienceSkills = newExperienceSkills;

    return newExperience.toDto();
  }

  async getExperiencesByUserId(userId: number): Promise<ExperienceDto[]> {
    const experiences = await this.experienceRepository
      .createQueryBuilder('experience')
      .leftJoinAndSelect('experience.user', 'user')
      .leftJoinAndSelect('experience.experienceSkills', 'experienceSkills')
      .leftJoinAndSelect('experienceSkills.skill', 'skill')
      .where('experience.user_id = :userId', { userId })
      .orderBy('experience.position', Order.ASC)
      .getMany();

    return experiences.map((experience) => experience.toDto());
  }

  async getSelectedExperiencesByUserId(
    userId: number,
  ): Promise<ExperienceEntity[]> {
    return this.experienceRepository
      .createQueryBuilder('experience')
      .leftJoinAndSelect('experience.user', 'user')
      .leftJoinAndSelect('experience.experienceSkills', 'experienceSkills')
      .leftJoinAndSelect('experienceSkills.skill', 'skill')
      .where('experience.user_id = :userId', { userId })
      .andWhere('experience.isSelected = :isSelected', { isSelected: true })
      .orderBy('experience.position', 'ASC')
      .getMany();
  }

  @Transactional()
  async updateToggleExperience(
    userId: number,
    experienceId: number,
  ): Promise<ExperienceDto> {
    const experience =
      await this.experienceMapper.toExperienceEntityFromIdAndUserId(
        userId,
        experienceId,
      );

    experience.isSelected = !experience.isSelected;

    const updatedExperience = await this.experienceRepository.save(experience);

    return updatedExperience.toDto();
  }

  @Transactional()
  async updateExperiencePositions(
    userId: number,
    updatePositions: UpdateExperiencePositionDto[],
  ): Promise<ExperienceDto[]> {
    const currentExperiences = await this.getExperienceEntitiesByUserId(userId);

    this.validateExperiencePositions(currentExperiences, updatePositions);

    const updatedExperiences = currentExperiences.map((experience) => {
      const updatePosition = updatePositions.find(
        (update) => update.experienceId === experience.id,
      );

      if (updatePosition) {
        experience.position = updatePosition.position;
      }

      return experience;
    });

    await this.experienceRepository.save(updatedExperiences);

    return updatedExperiences.map((experience) => experience.toDto());
  }

  private validateExperiencePositions(
    currentExperiences: ExperienceEntity[],
    updatePositions: UpdateExperiencePositionDto[],
  ): void {
    const uniquePositions = new Set<number>();

    for (const updatePosition of updatePositions) {
      if (uniquePositions.has(updatePosition.position)) {
        throw new BadRequestException(
          `Duplicate position ${updatePosition.position} found for user ID ${currentExperiences[0].user.id} in the update request`,
        );
      } else {
        uniquePositions.add(updatePosition.position);
      }

      const matchingExperience = currentExperiences.find(
        (experience) => experience.id === updatePosition.experienceId,
      );

      if (!matchingExperience) {
        throw new BadRequestException(
          `Experience with ID ${updatePosition.experienceId} not found`,
        );
      }
    }
  }

  private async getExperienceEntitiesByUserId(
    userId: number,
  ): Promise<ExperienceEntity[]> {
    return this.experienceRepository
      .createQueryBuilder('experience')
      .leftJoinAndSelect('experience.user', 'user')
      .leftJoinAndSelect('experience.experienceSkills', 'experienceSkills')
      .leftJoinAndSelect('experienceSkills.skill', 'skill')
      .leftJoinAndSelect('skill.group', 'group')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .where('user.id = :userId', { userId })
      .orderBy('experience.position', 'ASC')
      .getMany();
  }

  private async incrementExistingExperiencePositions(
    userId: number,
  ): Promise<void> {
    const existingExperiences = await this.experienceRepository.find({
      where: { user: { id: userId } },
    });

    if (existingExperiences.length > 0) {
      for (const experience of existingExperiences) {
        experience.position += 1;
      }

      await this.experienceRepository.save(existingExperiences);
    }
  }

  private validateExperienceBeforeCreateOrUpdate(
    upsertExperienceDto: CreateExperienceDto | UpdateExperienceDto,
  ): void {
    this.validateSkillIds(upsertExperienceDto.skillIds);
    validateYearRange(upsertExperienceDto.dateFrom);

    if (upsertExperienceDto.dateTo) {
      if (upsertExperienceDto.isCurrentlyWorking) {
        throw new BadRequestException(
          'Cannot have both dateTo and isCurrentlyWorking fields at the same time',
        );
      }

      validateYearRange(upsertExperienceDto.dateTo);

      const dateFrom = DateProvider.extractDateFrom(
        upsertExperienceDto.dateFrom,
      );
      const dateTo = DateProvider.extractDateTo(upsertExperienceDto.dateTo);

      if (dateTo < dateFrom) {
        throw new InvalidBadRequestException(
          ErrorCode.DATE_TO_BEFORE_DATE_FROM,
        );
      }
    }
  }

  private validateSkillIds(skillIds: number[]): void {
    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      throw new BadRequestException(
        'At least one skill is required for the experience.',
      );
    }
  }

  async getExperienceByIdAndUserIdOrThrow(id: number, userId: number) {
    const experience = await this.experienceRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    return experience;
  }

  @Transactional()
  public async updateExperiences(
    userId: number,
    updateExperienceDtos: UpdateExperienceDto[],
  ): Promise<ExperienceDto[]> {
    return Promise.all(
      updateExperienceDtos.map(async (updateExperienceDto) => {
        let experience = await this.getExperienceByIdAndUserIdOrThrow(
          updateExperienceDto.id,
          userId,
        );
        const { skillIds } = updateExperienceDto;
        this.validateExperienceBeforeCreateOrUpdate(updateExperienceDto);

        await Promise.all(
          skillIds.map(async (skillId) => {
            const experienceSkill =
              await this.experienceSkillRepository.findOne({
                where: { experienceId: experience.id, skillId },
              });

            if (!experienceSkill) {
              await this.experienceSkillRepository.save({
                experienceId: experience.id,
                skillId,
              });
            }
          }),
        );

        const allExperienceSkills = await this.experienceSkillRepository.find({
          where: { experienceId: experience.id },
        });

        const needToRemovingExperienceSkills = allExperienceSkills.filter(
          (experienceSkill) => !skillIds.includes(experienceSkill.skillId),
        );

        await this.experienceSkillRepository.remove(
          needToRemovingExperienceSkills,
        );

        experience = this.experienceMapper.updateEntity(
          experience,
          updateExperienceDto,
        );

        const updatedExperience =
          await this.experienceRepository.save(experience);

        return updatedExperience.toDto();
      }),
    );
  }

  @Transactional()
  async deleteExperience(userId: number, id: number) {
    const experienceEntity = await this.getExperienceByIdAndUserIdOrThrow(
      id,
      userId,
    );

    const positionBeforeDelete = experienceEntity.position;

    await this.experienceRepository.remove(experienceEntity);

    await this.updateExperiencePositionsAfterDelete(
      userId,
      positionBeforeDelete,
    );
  }

  private async updateExperiencePositionsAfterDelete(
    userId: number,
    deletedPosition: number,
  ): Promise<void> {
    const existingExperiences = await this.experienceRepository.find({
      where: { user: { id: userId }, position: MoreThan(deletedPosition) },
    });

    if (existingExperiences.length > 0) {
      const updatedExperiences = existingExperiences.map((experience) => {
        experience.position -= 1;

        return experience;
      });

      await this.experienceRepository.save(updatedExperiences);
    }
  }
}
