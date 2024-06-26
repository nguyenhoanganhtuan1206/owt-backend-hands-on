import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import UseQueryArrayTransformer from '../../../decorators/use-query-array-transformer.decorator';

export class TimeTrackingPageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @UseQueryArrayTransformer()
  userIds?: number[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateTo?: Date;
}
