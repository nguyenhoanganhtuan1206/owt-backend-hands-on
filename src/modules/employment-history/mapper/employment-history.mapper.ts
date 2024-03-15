import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { CreateEmploymentHistoryDto } from '../dtos/create-employment-history.dto';
import type { UpdateEmploymentHistoryDto } from '../dtos/update-employment-history.dto';
import { EmploymentHistoryEntity } from '../entities/employment-history.entity';

@Injectable()
export default class EmploymentHistoryMapper {
  constructor(
    @InjectRepository(EmploymentHistoryEntity)
    private readonly employmentHistoryRepository: Repository<EmploymentHistoryEntity>,
  ) {}

  async createEmploymentHistory(
    userId: number,
    createEmploymentHistoryDto: CreateEmploymentHistoryDto,
  ): Promise<EmploymentHistoryEntity> {
    const createdEmployment = this.employmentHistoryRepository.create({
      ...createEmploymentHistoryDto,
      userId,
    });

    return this.employmentHistoryRepository.save(createdEmployment);
  }

  updateEntity(
    updateDto: UpdateEmploymentHistoryDto,
    entity: EmploymentHistoryEntity,
  ) {
    entity.company = updateDto.company;
    entity.isCurrentlyWorking = updateDto.isCurrentlyWorking;
    entity.dateFrom = updateDto.dateFrom;
    entity.dateTo = updateDto.dateTo;

    return entity;
  }
}
