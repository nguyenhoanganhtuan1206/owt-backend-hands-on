import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserTimekeeperDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  timekeeperUserId?: number;
}
