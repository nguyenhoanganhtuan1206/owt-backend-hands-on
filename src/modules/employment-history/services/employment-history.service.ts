/* eslint-disable @typescript-eslint/no-unnecessary-condition */
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
import { CreateEmploymentHistoryDto } from '../dtos/create-employment-history.dto';
import type { EmploymentHistoryDto } from '../dtos/employment-history.dto';
import type { UpdateEmploymentHistoryDto } from '../dtos/update-employment-history.dto';
import type { UpdateEmploymentHistoryPositionDto } from '../dtos/update-employment-history-position.dto';
import { EmploymentHistoryEntity } from '../entities/employment-history.entity';
import EmploymentHistoryMapper from '../mapper/employment-history.mapper';

@Injectable()
export class EmploymentHistoryService {
  constructor(
    @InjectRepository(EmploymentHistoryEntity)
    private readonly employmentHistoryRepository: Repository<EmploymentHistoryEntity>,
    private readonly employmentHistoryMapper: EmploymentHistoryMapper,
  ) {}

  async getEmploymentHistoryByUserId(
    userId: number,
  ): Promise<EmploymentHistoryDto[]> {
    const employmentHistories =
      await this.getEmploymentHistoryEntitiesByUserId(userId);

    return employmentHistories.toDtos();
  }

  async getSelectedEmploymentHistoriesByUserId(
    userId: number,
  ): Promise<EmploymentHistoryEntity[]> {
    return this.employmentHistoryRepository.find({
      where: { user: { id: userId }, isSelected: true },
      order: { position: { direction: 'ASC' } },
    });
  }

  @Transactional()
  async createEmploymentHistory(
    userId: number,
    createEmploymentHistoryDto: CreateEmploymentHistoryDto,
  ): Promise<EmploymentHistoryDto> {
    this.validateEmploymentHistoryBeforeCreateOrUpdate(
      createEmploymentHistoryDto,
    );
    await this.incrementExistingEmploymentHistoriesPositions(userId);
    const newEmployment =
      await this.employmentHistoryMapper.createEmploymentHistory(
        userId,
        createEmploymentHistoryDto,
      );

    return newEmployment.toDto();
  }

  @Transactional()
  async deleteEmploymentHistory(userId: number, id: number): Promise<void> {
    const employmentHistoryEntity =
      await this.findEmploymentHistoryByIdAndUserIdOrThrow(id, userId);
    const positionBeforeDelete = employmentHistoryEntity.position;

    await this.employmentHistoryRepository.remove(employmentHistoryEntity);
    await this.updateEmploymentHistoryPositionsAfterDelete(
      userId,
      positionBeforeDelete,
    );
  }

  private async updateEmploymentHistoryPositionsAfterDelete(
    userId: number,
    deletedPosition: number,
  ): Promise<void> {
    const existingEmploymentHistories =
      await this.employmentHistoryRepository.find({
        where: { user: { id: userId }, position: MoreThan(deletedPosition) },
      });

    if (existingEmploymentHistories.length > 0) {
      const updatedEmploymentHistories = existingEmploymentHistories.map(
        (employment) => {
          employment.position -= 1;

          return employment;
        },
      );

      await this.employmentHistoryRepository.save(updatedEmploymentHistories);
    }
  }

  private async findEmploymentHistoryByIdAndUserIdOrThrow(
    id: number,
    userId: number,
  ): Promise<EmploymentHistoryEntity> {
    const employmentHistory = await this.employmentHistoryRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!employmentHistory) {
      throw new NotFoundException('Employment history not found');
    }

    return employmentHistory;
  }

  async updateEmploymentHistoriesPositions(
    userId: number,
    updatePositions: UpdateEmploymentHistoryPositionDto[],
  ): Promise<EmploymentHistoryDto[]> {
    const currentHistories =
      await this.getEmploymentHistoryEntitiesByUserId(userId);

    this.validateEmploymentHistoryPositions(currentHistories, updatePositions);

    const updatedHistories = currentHistories.map((history) => {
      const updatePosition = updatePositions.find(
        (position) => position.employmentHistoryId === history.id,
      );

      if (updatePosition) {
        history.position = updatePosition.position;
      }

      return history;
    });

    await this.employmentHistoryRepository.save(updatedHistories);

    return updatedHistories.toDtos();
  }

  @Transactional()
  async updateToggleEmploymentHistory(
    id: number,
  ): Promise<EmploymentHistoryDto> {
    const employmentHistory = await this.findEmploymentHistoryById(id);

    employmentHistory.isSelected = !employmentHistory.isSelected;

    const updatedEmploymentHistory =
      await this.employmentHistoryRepository.save(employmentHistory);

    return updatedEmploymentHistory.toDto();
  }

  private async findEmploymentHistoryById(
    id: number,
  ): Promise<EmploymentHistoryEntity> {
    const employmentHistory = await this.employmentHistoryRepository.findOneBy({
      id,
    });

    if (!employmentHistory) {
      throw new NotFoundException('Employment history not found');
    }

    return employmentHistory;
  }

  async getEmploymentHistoryEntitiesByUserId(
    userId: number,
  ): Promise<EmploymentHistoryEntity[]> {
    return this.employmentHistoryRepository.find({
      where: { user: { id: userId } },
      order: {
        position: Order.ASC,
      },
    });
  }

  private validateEmploymentHistoryPositions(
    currentEmploymentHistories: EmploymentHistoryEntity[],
    updatePositions: UpdateEmploymentHistoryPositionDto[],
  ): void {
    const uniquePositions = new Set<number>();

    for (const updatePosition of updatePositions) {
      if (uniquePositions.has(updatePosition.position)) {
        throw new BadRequestException(
          `Duplicate position ${updatePosition.position} found for user ID ${currentEmploymentHistories[0].user?.id} in the update request`,
        );
      } else {
        uniquePositions.add(updatePosition.position);
      }

      const matchingEmploymentHistory = currentEmploymentHistories.find(
        (history) => history.id === updatePosition.employmentHistoryId,
      );

      if (!matchingEmploymentHistory) {
        throw new BadRequestException(
          `Employment history with ID ${updatePosition.employmentHistoryId} not found`,
        );
      }
    }
  }

  private validateEmploymentHistoryBeforeCreateOrUpdate(
    upsertEmploymentHistoryDto:
      | CreateEmploymentHistoryDto
      | UpdateEmploymentHistoryDto,
  ): void {
    validateYearRange(upsertEmploymentHistoryDto.dateFrom);

    if (upsertEmploymentHistoryDto.dateTo) {
      if (upsertEmploymentHistoryDto.isCurrentlyWorking) {
        throw new BadRequestException(
          'Cannot have both dateTo and isCurrentlyWorking fields at the same time',
        );
      }

      validateYearRange(upsertEmploymentHistoryDto.dateTo);

      const dateFrom = DateProvider.extractDateFrom(
        upsertEmploymentHistoryDto.dateFrom,
      );
      const dateTo = DateProvider.extractDateTo(
        upsertEmploymentHistoryDto.dateTo,
      );

      if (dateTo < dateFrom) {
        throw new InvalidBadRequestException(
          ErrorCode.DATE_TO_BEFORE_DATE_FROM,
        );
      }
    }
  }

  private async incrementExistingEmploymentHistoriesPositions(
    userId: number,
  ): Promise<void> {
    const existingEmploymentHistories =
      await this.employmentHistoryRepository.find({
        where: { user: { id: userId } },
      });

    if (existingEmploymentHistories.length > 0) {
      for (const employmentHistory of existingEmploymentHistories) {
        employmentHistory.position += 1;
      }

      await this.employmentHistoryRepository.save(existingEmploymentHistories);
    }
  }

  public async updateEmploymentHistories(
    userId: number,
    updateEmploymentHistories: UpdateEmploymentHistoryDto[],
  ): Promise<EmploymentHistoryDto[]> {
    return Promise.all(
      updateEmploymentHistories.map(async (updateEmploymentHistory) => {
        this.validateEmploymentHistoryBeforeCreateOrUpdate(
          updateEmploymentHistory,
        );
        let employmentHistory =
          await this.findEmploymentHistoryByIdAndUserIdOrThrow(
            updateEmploymentHistory.id,
            userId,
          );
        employmentHistory = this.employmentHistoryMapper.updateEntity(
          updateEmploymentHistory,
          employmentHistory,
        );
        const updatedEmploymentHistory =
          await this.employmentHistoryRepository.save(employmentHistory);

        return updatedEmploymentHistory.toDto();
      }),
    );
  }
}
