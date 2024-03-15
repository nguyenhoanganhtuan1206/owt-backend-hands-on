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
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';
import { BuddyBuddeeTouchpointPageOptionsDto } from '../dtos/buddy-buddee-touchpoint-page-options.dto';
import { CreateBuddyBuddeeTouchpointRequestDto } from '../dtos/create-buddy-buddee-touchpoint-request.dto';
import { UpdateBuddyBuddeeTouchpointRequestDto } from '../dtos/update-buddy-buddee-touchpoint-request.dto';
import { BuddyBuddeeTouchpointService } from '../services/buddy-buddee-touchpoint.service';

@Controller('admin/buddies/touch-points')
@ApiTags('admin/buddies/touch-points')
@UseGuards(JwtAuthGuard)
export class AdminBuddyBuddeeTouchpointController {
  constructor(
    private readonly buddyTouchpointService: BuddyBuddeeTouchpointService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get latest touchpoint of buddy and buddee pair',
    type: PageDto,
  })
  async getBuddyPairTouchpoints(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    return this.buddyTouchpointService.getBuddyPairTouchpoints(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create touchpoint of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async createBuddyBuddeeTouchpoint(
    @Body() createTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    return this.buddyTouchpointService.createBuddyBuddeeTouchpoint(
      createTouchpointRequestDto,
    );
  }

  @Post('draft')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create draft touchpoint of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async createDraftBuddyBuddeeTouchpoint(
    @Body() createTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    return this.buddyTouchpointService.createDraftBuddyBuddeeTouchpoint(
      createTouchpointRequestDto,
    );
  }

  @Put('draft/:id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update draft touchpoint of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async updateDraftBuddyBuddeeTouchpoint(
    @Param('id') id: number,
    @Body() updateTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    return this.buddyTouchpointService.updateDraftBuddyBuddeeTouchpoint(
      id,
      updateTouchpointRequestDto,
    );
  }

  @Put(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Submit draft touchpoint of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async submitDraftBuddyBuddeeTouchpoint(
    @Param('id') id: number,
    @Body() updateTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    return this.buddyTouchpointService.submitDraftBuddyBuddeeTouchpoint(
      id,
      updateTouchpointRequestDto,
    );
  }
}
