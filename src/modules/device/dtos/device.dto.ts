import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DeviceStatus } from '../../../constants/device-status';
import type { UserDto } from '../../../modules/user/dtos/user.dto';
import { DeviceModelDto } from '../../device-model/dtos/device-model.dto';
import type { DeviceOwnerDto } from '../../device-owner/dtos/device-owner.dto';
import { DeviceTypeDto } from '../../device-type/dtos/device-type.dto';
import type { DeviceEntity } from '../entities/device.entity';

export class DeviceDto extends AbstractDto {
  @ApiProperty()
  model: DeviceModelDto;

  @ApiProperty()
  type: DeviceTypeDto;

  @ApiProperty()
  serialNumber: string;

  @ApiProperty()
  detail: string;

  @ApiPropertyOptional()
  code: string;

  @ApiPropertyOptional()
  note: string;

  @ApiPropertyOptional({ nullable: true })
  user: UserDto | null;

  @ApiProperty()
  status: DeviceStatus;

  @ApiPropertyOptional({ nullable: true })
  owner: DeviceOwnerDto | null;

  @ApiPropertyOptional()
  purchasedAt: Date;

  constructor(deviceEntity: DeviceEntity) {
    super(deviceEntity);
    this.model = deviceEntity.model;
    this.type = deviceEntity.type;
    this.serialNumber = deviceEntity.serialNumber;
    this.detail = deviceEntity.detail;
    this.note = deviceEntity.note;
    this.status = deviceEntity.status;
    this.code = deviceEntity.code;
    this.purchasedAt = deviceEntity.purchasedAt;
    this.owner = deviceEntity.owner ? deviceEntity.owner.toDto() : null;
    this.user = deviceEntity.user ? deviceEntity.user.toDto() : null;
  }
}
