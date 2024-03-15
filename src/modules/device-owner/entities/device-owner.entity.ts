import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { DeviceEntity } from '../../device/entities/device.entity';
import { DeviceOwnerDto } from '../dtos/device-owner.dto';

@Entity({ name: 'device_owners' })
@UseDto(DeviceOwnerDto)
export class DeviceOwnerEntity extends AbstractEntity<DeviceOwnerDto> {
  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @OneToMany(() => DeviceEntity, (device) => device.owner, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'owner_id' })
  devices: DeviceEntity[];
}
