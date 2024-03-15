import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { RequestStatusType } from '../../../constants';
import { UseDto } from '../../../decorators';
import { DeviceEntity } from '../../device/entities/device.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { RepairRequestDto } from '../dtos/repair-request.dto';

@Entity({ name: 'repair_requests' })
@UseDto(RepairRequestDto)
export class RepairRequestEntity extends AbstractEntity<RepairRequestDto> {
  @ManyToOne(() => DeviceEntity, { eager: true })
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @Column({ nullable: false })
  reason: string;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'enum', enum: RequestStatusType })
  status: RequestStatusType;
}
