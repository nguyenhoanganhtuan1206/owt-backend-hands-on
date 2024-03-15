import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { DeviceOwnerEntity } from '../entities/device-owner.entity';

export class DeviceOwnerDto extends AbstractDto {
  @ApiPropertyOptional()
  name: string;

  constructor(deviceOwnerEntity: DeviceOwnerEntity) {
    super(deviceOwnerEntity);
    this.name = deviceOwnerEntity.name;
  }
}
