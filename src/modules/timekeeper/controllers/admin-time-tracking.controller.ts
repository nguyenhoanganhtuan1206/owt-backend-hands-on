import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { setDefaultDateRange } from '../../../providers';
import type { TimeTrackingDto } from '../dtos/time-tracking.dto';
import { TimeTrackingPageOptionsDto } from '../dtos/time-tracking-page-options.dto';
import { UserTimekeeperDto } from '../dtos/user-timekeeper.dto';
import { TimeTrackingService } from '../services/time-tracking.service';

@Controller('/admin/time-trackings')
@ApiTags('/admin/time-trackings')
@UseGuards(JwtAuthGuard)
export class AdminTimeTrackingController {
  constructor(private timeTrackingService: TimeTrackingService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @ApiPageOkResponse({
    description: 'admin get list time trackings for all user',
    type: PageDto,
  })
  getTimeTrackings(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeTrackingPageOptionsDto,
  ): Promise<PageDto<TimeTrackingDto>> {
    const updatedPageOptionsDto = setDefaultDateRange(pageOptionsDto, true);

    return this.timeTrackingService.getTimeTrackings(updatedPageOptionsDto);
  }

  @Get('users')
  @Auth([RoleType.ADMIN])
  @ApiPageOkResponse({
    description: 'admin get list users timekeeper',
    type: UserTimekeeperDto,
  })
  getUserTimekeepers(): Promise<UserTimekeeperDto[]> {
    return this.timeTrackingService.getUserTimekeepers();
  }
}
