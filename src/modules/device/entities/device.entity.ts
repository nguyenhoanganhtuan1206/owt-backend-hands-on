import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { DeviceStatus } from '../../../constants/device-status';
import { UseDto } from '../../../decorators';
import { DeviceModelEntity } from '../../device-model/entities/device-model.entity';
import { DeviceOwnerEntity } from '../../device-owner/entities/device-owner.entity';
import { RepairHistoryEntity } from '../../device-repair-history/entities/repair-history.entity';
import { DeviceTypeEntity } from '../../device-type/entities/device-type.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { DeviceDto } from '../dtos/device.dto';

@Entity({ name: 'devices' })
@UseDto(DeviceDto)
export class DeviceEntity extends AbstractEntity<DeviceDto> {
  @ManyToOne(() => DeviceModelEntity, { eager: true })
  @JoinColumn({ name: 'model_id' })
  model: DeviceModelEntity;

  @ManyToOne(() => DeviceTypeEntity, { eager: true })
  @JoinColumn({ name: 'type_id' })
  type: DeviceTypeEntity;

  @Column()
  serialNumber: string;

  @Column({ nullable: false })
  detail: string;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({ nullable: false })
  code: string;

  @Column({ type: 'date' })
  purchasedAt: Date;

  @ManyToOne(() => DeviceOwnerEntity, { eager: true })
  @JoinColumn({ name: 'owner_id' })
  owner: DeviceOwnerEntity | null;

  @Column({ type: 'enum', enum: DeviceStatus })
  status: DeviceStatus;

  @OneToMany(
    () => RepairHistoryEntity,
    (repairHistory) => repairHistory.device,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'device_id' })
  repairHistories: RepairHistoryEntity[];
}
