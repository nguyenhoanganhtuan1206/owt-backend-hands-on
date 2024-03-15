import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { BuddyBuddeePairEntity } from '../entities/buddy-buddee-pair.entity';

export class BuddyBuddeePairDto extends AbstractDto {
  @ApiProperty()
  buddy: UserDto;

  @ApiProperty()
  buddee: UserDto | undefined;

  constructor(buddyBuddeePairEntity: BuddyBuddeePairEntity) {
    super(buddyBuddeePairEntity);

    this.buddy = buddyBuddeePairEntity.buddy.toDto();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.buddee = buddyBuddeePairEntity.buddee
      ? buddyBuddeePairEntity.buddee.toDto()
      : undefined;
  }
}
