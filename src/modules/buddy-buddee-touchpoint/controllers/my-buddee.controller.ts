import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { BuddyBuddeePairPageOptionsDto } from '../../buddy-buddee-pair/dtos/buddy-buddee-pair-page-options.dto';
import { UserEntity } from '../../user/entities/user.entity';
import type { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';
import { BuddyBuddeeTouchpointPageOptionsDto } from '../dtos/buddy-buddee-touchpoint-page-options.dto';
import { BuddyBuddeeTouchpointService } from '../services/buddy-buddee-touchpoint.service';

@Controller('buddies/my-buddees')
@ApiTags('buddies/my-buddees')
@UseGuards(JwtAuthGuard)
export class MyBuddeeController {
  constructor(
    private readonly buddyTouchpointService: BuddyBuddeeTouchpointService,
  ) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'User get my buddees and latest touch-point',
    type: PageDto,
  })
  async getMyBuddees(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeePairPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    return this.buddyTouchpointService.getMyBuddees(user.id, pageOptionsDto);
  }

  @Get(':buddeeId/touch-points')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'User get touch-points of a buddee',
    type: PageDto,
  })
  async getTouchpoints(
    @AuthUser() user: UserEntity,
    @Param('buddeeId') buddeeId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    return this.buddyTouchpointService.getTouchpointsByBuddyIdAndBuddeeId(
      user.id,
      buddeeId,
      pageOptionsDto,
    );
  }
}
