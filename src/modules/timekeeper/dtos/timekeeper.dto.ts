import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import {
  TimeKeeperDeviceName,
  TimeKeeperState,
  TimeKeeperType,
} from '../../../constants';
import { UserDto } from '../../user/dtos/user.dto';
import type { TimeKeeperEntity } from '../entities/timekeeper.entity';

export class TimeKeeperDto extends AbstractDto {
  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  timekeeperUserId: number;

  @ApiProperty()
  time: Date;

  @ApiProperty()
  state: TimeKeeperState;

  @ApiProperty()
  type: TimeKeeperType;

  @ApiProperty()
  deviceName: TimeKeeperDeviceName;

  constructor(timeKeeperEntity: TimeKeeperEntity) {
    super(timeKeeperEntity);
    this.user = timeKeeperEntity.user.toDto();
    this.timekeeperUserId = timeKeeperEntity.timekeeperUserId;
    this.time = timeKeeperEntity.time;
    this.state = timeKeeperEntity.state;
    this.type = timeKeeperEntity.type;
    this.deviceName = timeKeeperEntity.deviceName;
  }
}
