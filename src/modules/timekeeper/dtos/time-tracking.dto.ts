import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DateProvider } from '../../../providers';
import type { UserDto } from '../../user/dtos/user.dto';
import type { TimeKeeperEntity } from '../entities/timekeeper.entity';

export class TimeTrackingDto extends AbstractDto {
  @ApiPropertyOptional()
  date: Date;

  @ApiPropertyOptional()
  user?: UserDto | undefined;

  @ApiPropertyOptional()
  checkIn: Date;

  @ApiPropertyOptional()
  checkOut?: Date | null;

  @ApiPropertyOptional()
  totalPresence?: Date | null;

  constructor(
    timeKeeperCheckInEntity: TimeKeeperEntity,
    timeKeeperCheckoutEntity?: TimeKeeperEntity,
    totalPresence?: Date,
  ) {
    super(timeKeeperCheckInEntity);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.user = timeKeeperCheckInEntity.user
      ? timeKeeperCheckInEntity.user.toDto()
      : undefined;
    this.date = DateProvider.formatDateUTC(timeKeeperCheckInEntity.time);
    this.checkIn = DateProvider.formatTimeHHmmssUTC(
      timeKeeperCheckInEntity.time,
    );
    this.checkOut = timeKeeperCheckoutEntity
      ? DateProvider.formatTimeHHmmssUTC(timeKeeperCheckoutEntity.time)
      : null;
    this.totalPresence = totalPresence
      ? DateProvider.formatTimeHHmmssUTC(totalPresence)
      : null;
  }
}
