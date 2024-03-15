import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { DateFieldOptional } from '../../../decorators';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class OtherUsersPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];

  @ApiPropertyOptional()
  @DateFieldOptional({
    default: new Date(),
  })
  dateFrom?: Date = new Date();

  @DateFieldOptional({
    default: new Date(),
  })
  @ApiPropertyOptional()
  dateTo?: Date = new Date();
}
