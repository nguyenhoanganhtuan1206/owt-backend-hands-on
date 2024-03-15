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
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import type { EducationDto, UpdateEducationDto } from '../dtos';
import { CreateEducationDto } from '../dtos';
import type { UpdatePositionDto } from '../dtos/update-position.dto';
import { EducationEntity } from '../entities/education.entity';
import EducationMapper from '../mappers/education.mapper';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(EducationEntity)
    private readonly educationRepository: Repository<EducationEntity>,
    private readonly educationMapper: EducationMapper,
    private readonly userService: UserService,
  ) {}

  async getEducationByIdAndUserIdOrThrow(id: number, userId: number) {
    const education = await this.educationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!education) {
      throw new NotFoundException('Education not found');
    }

    return education;
  }

  async updateEducations(
    user: UserEntity,
    updateEducationDtos: UpdateEducationDto[],
  ): Promise<EducationDto[]> {
    return Promise.all(
      updateEducationDtos.map(async (updateEducationDto) => {
        this.validateEducationBeforeUpdate(updateEducationDto);
        let educationEntity = await this.getEducationByIdAndUserIdOrThrow(
          updateEducationDto.id,
          user.id,
        );

        educationEntity = this.educationMapper.updateEntity(
          updateEducationDto,
          educationEntity,
        );
        const updatedEducation =
          await this.educationRepository.save(educationEntity);

        return updatedEducation.toDto();
      }),
    );
  }

  @Transactional()
  async deleteEducation(user: UserEntity, id: number) {
    const educationEntity = await this.getEducationByIdAndUserIdOrThrow(
      id,
      user.id,
    );
    const positionBeforeDelete = educationEntity.position;

    await this.educationRepository.remove(educationEntity);
    await this.updateEducationPositionsAfterDelete(
      user.id,
      positionBeforeDelete,
    );
  }

  private async updateEducationPositionsAfterDelete(
    userId: number,
    deletedPosition: number,
  ): Promise<void> {
    const existingEducations = await this.educationRepository.find({
      where: { user: { id: userId }, position: MoreThan(deletedPosition) },
    });

    if (existingEducations.length > 0) {
      const updatedEducations = existingEducations.map((education) => {
        education.position -= 1;

        return education;
      });

      await this.educationRepository.save(updatedEducations);
    }
  }

  async getEducationsByUserId(userId: number): Promise<EducationDto[]> {
    const educations = await this.getEducationEntitiesByUserId(userId);

    return educations.toDtos();
  }

  async getSelectedEducationsByUserId(
    userId: number,
  ): Promise<EducationEntity[]> {
    return this.educationRepository.find({
      where: { user: { id: userId }, isSelected: true },
      order: { position: { direction: 'ASC' } },
    });
  }

  @Transactional()
  async createEducation(
    userId: number,
    createEducation: CreateEducationDto,
  ): Promise<EducationDto> {
    this.validateEducationBeforeCreate(createEducation);

    const educationEntity = await this.educationMapper.toEducationEntity(
      userId,
      createEducation,
    );

    await this.incrementExistingEducationPositions(userId);

    const newEducation = await this.educationRepository.save(educationEntity);

    return newEducation.toDto();
  }

  @Transactional()
  async updateToggleEducation(educationId: number): Promise<EducationDto> {
    const education =
      await this.educationMapper.toEducationEntityFromId(educationId);

    education.isSelected = !education.isSelected;

    const updatedEducation = await this.educationRepository.save(education);

    return updatedEducation.toDto();
  }

  async updateEducationPositions(
    userId: number,
    updatePositions: UpdatePositionDto[],
  ): Promise<EducationDto[]> {
    const currentEducations = await this.getEducationEntitiesByUserId(userId);

    this.validateEducationPositions(currentEducations, updatePositions);

    const updatedEducations = currentEducations.map((education) => {
      const updatePosition = updatePositions.find(
        (update) => update.educationId === education.id,
      );

      if (updatePosition) {
        education.position = updatePosition.position;
      }

      return education;
    });

    await this.educationRepository.save(updatedEducations);

    return updatedEducations.toDtos();
  }

  private validateEducationPositions(
    currentEducations: EducationEntity[],
    updatePositions: UpdatePositionDto[],
  ): void {
    const uniquePositions = new Set<number>();

    for (const updatePosition of updatePositions) {
      if (uniquePositions.has(updatePosition.position)) {
        throw new BadRequestException(
          `Duplicate position ${updatePosition.position} found for user ID ${currentEducations[0]?.user?.id} in the update request`,
        );
      } else {
        uniquePositions.add(updatePosition.position);
      }

      const matchingEducation = currentEducations.find(
        (education) => education.id === updatePosition.educationId,
      );

      if (!matchingEducation) {
        throw new BadRequestException(
          `Education with ID ${updatePosition.educationId} not found`,
        );
      }
    }
  }

  async getEducationEntitiesByUserId(
    userId: number,
  ): Promise<EducationEntity[]> {
    return this.educationRepository.find({
      where: { user: { id: userId } },
      order: {
        position: Order.ASC,
      },
    });
  }

  private validateEducationBeforeCreate(
    createEducation: CreateEducationDto,
  ): void {
    validateYearRange(createEducation.dateFrom);
    validateYearRange(createEducation.dateTo);

    const dateFrom = DateProvider.extractDateFrom(createEducation.dateFrom);
    const dateTo = DateProvider.extractDateTo(createEducation.dateTo);

    if (dateTo < dateFrom) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }
  }

  private validateEducationBeforeUpdate(
    updateEducationDto: UpdateEducationDto,
  ): void {
    const { dateTo, dateFrom } = updateEducationDto;
    validateYearRange(dateFrom);
    validateYearRange(dateTo);

    if (dateTo < dateFrom) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }
  }

  private async incrementExistingEducationPositions(
    userId: number,
  ): Promise<void> {
    const existingEducations = await this.educationRepository.find({
      where: { user: { id: userId } },
    });

    if (existingEducations.length > 0) {
      for (const education of existingEducations) {
        education.position += 1;
      }

      await this.educationRepository.save(existingEducations);
    }
  }

  async updateEmployeeEducations(
    userId: number,
    updateEducationDtos: UpdateEducationDto[],
  ): Promise<EducationDto[]> {
    const user = await this.userService.findUserById(userId);

    return this.updateEducations(user, updateEducationDtos);
  }

  @Transactional()
  async deleteEmployeeEducation(
    userId: number,
    educationId: number,
  ): Promise<void> {
    const user = await this.userService.findUserById(userId);

    return this.deleteEducation(user, educationId);
  }
}
