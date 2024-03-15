import {
  Body,
  Controller,
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
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateRepairRequestDto } from '../dtos/create-repair-request.dto';
import { RepairRequestDto } from '../dtos/repair-request.dto';
import { RepairRequestPageOptionsDto } from '../dtos/repair-request-page-options.dto';
import { RepairRequestService } from '../services/repair-request.service';

@Controller('devices/repair-requests')
@ApiTags('devices/repair-requests')
@UseGuards(JwtAuthGuard)
export class DeviceRepairRequestController {
  constructor(private readonly repairRequestService: RepairRequestService) {}

  @Get('/:deviceId')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'User get list repair requests of device is assigned',
    type: PageDto,
  })
  async getRepairRequestsOfDevice(
    @AuthUser() user: UserEntity,
    @Param('deviceId') deviceId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: RepairRequestPageOptionsDto,
  ): Promise<PageDto<RepairRequestDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.repairRequestService.getRepairRequestsOfDevice(
      deviceId,
      pageOptionsDto,
    );
  }

  @Post(':deviceId')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User create repair request',
    type: RepairRequestDto,
  })
  async createRepairRequest(
    @AuthUser() user: UserEntity,
    @Param('deviceId') deviceId: number,
    @Body() createRepairRequestDto: CreateRepairRequestDto,
  ): Promise<RepairRequestDto> {
    return this.repairRequestService.createRepairRequest(
      user.id,
      deviceId,
      createRepairRequestDto,
    );
  }
}
