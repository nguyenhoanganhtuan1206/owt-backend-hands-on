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
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { setDefaultDateRange } from '../../../providers';
import { UserEntity } from '../../user/entities/user.entity';
import type { TimeTrackingDto } from '../dtos/time-tracking.dto';
import { TimeTrackingPageOptionsDto } from '../dtos/time-tracking-page-options.dto';
import { TimeTrackingService } from '../services/time-tracking.service';

@Controller('/my-time-trackings')
@ApiTags('/my-time-trackings')
@UseGuards(JwtAuthGuard)
export class MyTimeTrackingController {
  constructor(private timeTrackingService: TimeTrackingService) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiPageOkResponse({
    description: 'Get the list of time tracking of the current user',
    type: PageDto,
  })
  getMyTimeTrackings(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeTrackingPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<PageDto<TimeTrackingDto>> {
    pageOptionsDto.userIds = [user.id];
    const updatedPageOptionsDto = setDefaultDateRange(pageOptionsDto);

    return this.timeTrackingService.getTimeTrackings(updatedPageOptionsDto);
  }
}
