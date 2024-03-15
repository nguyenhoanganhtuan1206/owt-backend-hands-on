import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { DeviceAssigneeHistoryDto } from '../dtos/device-assignee-history.dto';
import { DeviceEntity } from './device.entity';

@Entity({ name: 'device_assignee_histories' })
@UseDto(DeviceAssigneeHistoryDto)
export class DeviceAssigneeHistoryEntity extends AbstractEntity<DeviceAssigneeHistoryDto> {
  @ManyToOne(() => DeviceEntity, { eager: true })
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  returnedAt: Date | null;
}
