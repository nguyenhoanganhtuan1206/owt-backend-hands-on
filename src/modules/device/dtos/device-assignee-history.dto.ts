import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import { DateProvider } from '../../../providers';
import type { DeviceAssigneeHistoryEntity } from '../entities/device-assiginee-history.entity';
import { DeviceDto } from './device.dto';

export class DeviceAssigneeHistoryDto extends AbstractDto {
  @ApiProperty()
  device: DeviceDto;

  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  assignedAt: Date;

  @ApiProperty()
  returnedAt: Date | null;

  constructor(deviceAssigneeHistoryEntity: DeviceAssigneeHistoryEntity) {
    super(deviceAssigneeHistoryEntity);
    this.device = deviceAssigneeHistoryEntity.device.toDto();
    this.user = deviceAssigneeHistoryEntity.user.toDto();
    this.assignedAt = DateProvider.formatDateUTC(
      deviceAssigneeHistoryEntity.assignedAt,
    );
    this.returnedAt = deviceAssigneeHistoryEntity.returnedAt
      ? DateProvider.formatDateUTC(deviceAssigneeHistoryEntity.returnedAt)
      : null;
  }
}
