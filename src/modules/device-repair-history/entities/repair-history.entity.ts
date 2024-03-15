import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { DeviceEntity } from '../../device/entities/device.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { RepairHistoryDto } from '../dtos/repair-history.dto';

@Entity({ name: 'repair_histories' })
@UseDto(RepairHistoryDto)
export class RepairHistoryEntity extends AbstractEntity<RepairHistoryDto> {
  @ManyToOne(() => DeviceEntity, { eager: true })
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @Column({ nullable: false })
  repairDetail: string;

  @Column({ nullable: true })
  supplier: string;

  @Column({ type: 'date' })
  repairDate: Date;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'requested_by' })
  requestedBy: UserEntity;
}
