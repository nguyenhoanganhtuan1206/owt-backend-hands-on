import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';
import { BuddyBuddeeTouchpointPageOptionsDto } from '../dtos/buddy-buddee-touchpoint-page-options.dto';
import { CreateBuddyBuddeeTouchpointRequestDto } from '../dtos/create-buddy-buddee-touchpoint-request.dto';
import { UpdateBuddyBuddeeTouchpointRequestDto } from '../dtos/update-buddy-buddee-touchpoint-request.dto';
import { BuddyBuddeeTouchpointService } from '../services/buddy-buddee-touchpoint.service';

@Controller('buddies')
@ApiTags('buddies')
@UseGuards(JwtAuthGuard)
export class BuddyBuddeeTouchpointController {
  constructor(
    private readonly buddyTouchpointService: BuddyBuddeeTouchpointService,
  ) {}

  @Get('my-touch-points')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'User get touch-points of a buddy',
    type: PageDto,
  })
  async getTouchpoints(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    return this.buddyTouchpointService.getMyTouchpoints(
      user.id,
      pageOptionsDto,
    );
  }

  @Post('touch-points')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User create touch-point of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async createTouchpoint(
    @AuthUser() user: UserEntity,
    @Body() createTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    createTouchpointRequestDto.buddyId = user.id;

    return this.buddyTouchpointService.createBuddyBuddeeTouchpoint(
      createTouchpointRequestDto,
    );
  }

  @Post('touch-points/draft')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User create draft touch-point of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async createDraftBuddyBuddeeTouchpoint(
    @AuthUser() user: UserEntity,
    @Body() createTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    createTouchpointRequestDto.buddyId = user.id;

    return this.buddyTouchpointService.createDraftBuddyBuddeeTouchpoint(
      createTouchpointRequestDto,
    );
  }

  @Put('touch-points/draft/:id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User update draft touch-point of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async updateDraftBuddyBuddeeTouchpoint(
    @Param('id') id: number,
    @AuthUser() user: UserEntity,
    @Body() updateTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    return this.buddyTouchpointService.updateDraftBuddyBuddeeTouchpoint(
      id,
      updateTouchpointRequestDto,
    );
  }

  @Put('touch-points/:id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User submit touch-point of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async submitDraftBuddyBuddeeTouchpoint(
    @Param('id') id: number,
    @AuthUser() user: UserEntity,
    @Body() updateTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    return this.buddyTouchpointService.submitDraftBuddyBuddeeTouchpoint(
      id,
      updateTouchpointRequestDto,
    );
  }
}
