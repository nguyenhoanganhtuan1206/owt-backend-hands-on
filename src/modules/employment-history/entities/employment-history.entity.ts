import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { validateIsCurrentlyWorking } from '../../../common/utils';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { EmploymentHistoryDto } from '../dtos/employment-history.dto';

@Entity('employment_histories')
@UseDto(EmploymentHistoryDto)
export class EmploymentHistoryEntity extends AbstractEntity<EmploymentHistoryDto> {
  @BeforeInsert()
  @BeforeUpdate()
  validate() {
    validateIsCurrentlyWorking(this);
  }

  @ManyToOne(() => UserEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employments_user_id_fkey',
  })
  user?: UserEntity;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'company', length: '256' })
  company: string;

  @Column({ type: 'date' })
  dateFrom: Date;

  @Column({ type: 'date', nullable: true })
  dateTo?: Date;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ name: 'is_selected', type: 'boolean', default: false })
  isSelected: boolean;

  @Column({ name: 'is_currently_working', type: 'boolean', default: false })
  isCurrentlyWorking: boolean;
}
