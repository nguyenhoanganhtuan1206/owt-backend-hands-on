import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { DateType, RequestStatusType } from '../../../constants';
import { UseDto } from '../../../decorators';
import { TimeOffCollaboratorEntity } from '../../time-off-collaborator/entities/time-off-collaborator.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { TimeOffRequestDto } from '../dtos/time-off-request.dto';

@Entity({ name: 'attendance_time_off_requests' })
@UseDto(TimeOffRequestDto)
export class TimeOffRequestEntity extends AbstractEntity<TimeOffRequestDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'date' })
  dateFrom: Date;

  @Column({ type: 'date' })
  dateTo: Date;

  @Column({ type: 'enum', enum: DateType })
  dateType: string;

  @Column({ type: 'float' })
  totalDays: number;

  @Column()
  details: string;

  @Column({ type: 'text', nullable: true })
  attachedFile?: string | null;

  @Column({ type: 'text', nullable: true })
  assistantAttachFile?: string | null;

  @Column({ type: 'enum', enum: RequestStatusType })
  status: string;

  @ManyToOne(() => TimeOffCollaboratorEntity, { eager: true })
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: TimeOffCollaboratorEntity | null;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'assistant_id' })
  assistant: UserEntity | null;

  @Column({ nullable: true })
  pmNote?: string;

  @Column({ nullable: true })
  adminNote?: string;
}
