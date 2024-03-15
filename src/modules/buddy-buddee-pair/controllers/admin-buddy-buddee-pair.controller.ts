import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { BuddyDto } from '../../buddy/dtos/buddy.dto';
import { BuddyPageOptionsDto } from '../../buddy/dtos/buddy-page-options.dto';
import type { BuddyBuddeeTouchpointDto } from '../../buddy-buddee-touchpoint/dtos/buddy-buddee-touchpoint.dto';
import { BuddyBuddeeTouchpointPageOptionsDto } from '../../buddy-buddee-touchpoint/dtos/buddy-buddee-touchpoint-page-options.dto';
import { BuddyBuddeeTouchpointService } from '../../buddy-buddee-touchpoint/services/buddy-buddee-touchpoint.service';
import type { BuddyBuddeePairDto } from '../dtos/buddy-buddee-pair.dto';
import { CreateBuddyBuddeesPairRequestDto } from '../dtos/create-buddy-buddees-pair-request.dto';
import { BuddyBuddeePairService } from '../services/buddy-buddee-pair.service';

@Controller('admin/buddies/pairs')
@ApiTags('admin/buddies/pairs')
@UseGuards(JwtAuthGuard)
export class AdminBuddyBuddeePairController {
  constructor(
    private readonly buddyPairService: BuddyBuddeePairService,
    private readonly buddyTouchpointService: BuddyBuddeeTouchpointService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get pairs of buddy and buddees',
    type: PageDto,
  })
  async getBuddyPairs(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeePairDto>> {
    return this.buddyPairService.getBuddyPairs(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create pairs of buddy and buddees',
    type: BuddyDto,
  })
  async createBuddyPairs(
    @Body() createBuddyBuddeesPairRequestDto: CreateBuddyBuddeesPairRequestDto,
  ): Promise<BuddyBuddeePairDto[]> {
    return this.buddyPairService.createBuddyPairs(
      createBuddyBuddeesPairRequestDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete a pair of buddy and buddee by id',
  })
  deleteBuddyPair(@Param('id') id: number): Promise<void> {
    return this.buddyPairService.deleteBuddyPair(id);
  }

  @Get(':id/touch-points')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get touch-points of a pair',
    type: PageDto,
  })
  async getTouchpoints(
    @Param('id') id: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    return this.buddyTouchpointService.getTouchpointsByPairId(
      id,
      pageOptionsDto,
    );
  }
}
