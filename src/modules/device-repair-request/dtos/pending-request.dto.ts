import { ApiProperty } from '@nestjs/swagger';

export class PendingRequestDto {
  @ApiProperty()
  total: number;
}
