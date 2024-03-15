import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DateProvider } from '../../../providers';
import { DeviceDto } from '../../device/dtos/device.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { RepairHistoryEntity } from '../entities/repair-history.entity';

export class RepairHistoryDto extends AbstractDto {
  @ApiProperty()
  device: DeviceDto;

  @ApiProperty()
  requestedBy: UserDto;

  @ApiProperty()
  repairDate: Date;

  @ApiProperty()
  repairDetail: string;

  @ApiProperty()
  supplier: string;

  constructor(repairHistoryEntity: RepairHistoryEntity) {
    super(repairHistoryEntity);
    this.device = repairHistoryEntity.device.toDto();
    this.requestedBy = repairHistoryEntity.requestedBy.toDto();
    this.repairDate = DateProvider.formatDate(repairHistoryEntity.repairDate);
    this.repairDetail = repairHistoryEntity.repairDetail;
    this.supplier = repairHistoryEntity.supplier;
  }
}
