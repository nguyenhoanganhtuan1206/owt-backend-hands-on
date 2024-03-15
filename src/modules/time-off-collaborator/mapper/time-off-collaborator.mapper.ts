import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import { TimeOffCollaboratorEntity } from '../entities/time-off-collaborator.entity';

@Injectable()
export class TimeOffCollaboratorMapper {
  constructor(
    @InjectRepository(TimeOffCollaboratorEntity)
    private readonly timeOffCollaboratorRepository: Repository<TimeOffCollaboratorEntity>,
  ) {}

  async toTimeOffCollaboratorEntityFromId(
    id: number,
  ): Promise<TimeOffCollaboratorEntity> {
    const timeOffCollaboratorEntity =
      await this.timeOffCollaboratorRepository.findOneBy({
        id,
      });

    if (!timeOffCollaboratorEntity) {
      throw new InvalidNotFoundException(
        ErrorCode.TIME_OFF_COLLABORATOR_NOT_FOUND,
      );
    }

    return timeOffCollaboratorEntity;
  }
}
