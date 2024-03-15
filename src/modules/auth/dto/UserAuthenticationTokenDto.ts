import { ApiProperty } from '@nestjs/swagger';

import { RoleType, TokenType } from '../../../constants';

export class UserAuthenticationTokenDto {
  @ApiProperty()
  type: TokenType;

  @ApiProperty()
  role: RoleType;

  @ApiProperty()
  timeOffRequestId: number;

  constructor(data: {
    type: TokenType;
    role: RoleType;
    timeOffRequestId: number;
  }) {
    this.type = data.type;
    this.role = data.role;
    this.timeOffRequestId = data.timeOffRequestId;
  }
}
