import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { DeviceModelEntity } from '../../device-model/entities/device-model.entity';
import { DeviceTypeDto } from '../dtos/device-type.dto';

@Entity({ name: 'device_types' })
@UseDto(DeviceTypeDto)
export class DeviceTypeEntity extends AbstractEntity<DeviceTypeDto> {
  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @OneToMany(
    () => DeviceModelEntity,
    (deviceModelEntity) => deviceModelEntity.type,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'type_id' })
  models: DeviceModelEntity[];
}
