import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { UserEntity } from '../../../modules/user/entities/user.entity';
import { DateProvider } from '../../../providers';
import { UserDto } from '../../user/dtos/user.dto';

export class OtherUserDto extends AbstractDto {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  user: UserDto;

  constructor(userEntity: UserEntity, date: Date) {
    super(userEntity);
    this.date = DateProvider.formatDateUTC(date);
    this.user = userEntity.toDto();
    userEntity.password = undefined;
  }
}
