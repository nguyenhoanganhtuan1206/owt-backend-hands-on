import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserDto } from '../../user/dtos/user.dto';

export class AllowanceDto {
  @ApiPropertyOptional()
  user?: UserDto;

  @ApiProperty()
  total: number;

  @ApiProperty()
  taken: number;

  @ApiProperty()
  balance: number;

  constructor(allowance: number) {
    this.total = allowance;
  }
}
