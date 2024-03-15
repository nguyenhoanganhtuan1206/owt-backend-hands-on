import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from './page-meta.dto';
import type { PageOptionsDto } from './page-options.dto';

interface IPageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class BuddyPairPageMetaDto extends PageMetaDto {
  @ApiProperty()
  totalPairs: number;

  constructor(
    { pageOptionsDto, itemCount }: IPageMetaDtoParameters,
    totalPairs: number,
  ) {
    super({ pageOptionsDto, itemCount });
    this.totalPairs = totalPairs;
  }
}
