import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { TimeOffCollaboratorDto } from '../dtos/time-off-collaborator.dto';

@Entity({ name: 'time_off_collaborators' })
@UseDto(TimeOffCollaboratorDto)
export class TimeOffCollaboratorEntity extends AbstractEntity<TimeOffCollaboratorDto> {
  @Column({ nullable: false })
  employeeId: string;

  @Column({ nullable: false, length: 255 })
  collaboratorEmail: string;

  @Column({ nullable: false, length: 255 })
  collaboratorFirstName: string;

  @Column({ nullable: false, length: 255 })
  collaboratorLastName: string;

  @Column({ type: 'date' })
  startDate?: Date;

  @Column({ type: 'date' })
  endDate?: Date;
}
