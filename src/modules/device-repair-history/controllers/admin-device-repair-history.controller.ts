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
import { CreateDeviceRepairHistoryDto } from '../dtos/create-device-repair-history.dto';
import { DeviceRepairHistoryPageOptionsDto } from '../dtos/device-repair-history-page-options.dto';
import { RepairHistoryDto } from '../dtos/repair-history.dto';
import { RepairHistoryService } from '../services/repair-history.service';

@Controller('admin/devices')
@ApiTags('admin/devices')
@UseGuards(JwtAuthGuard)
export class AdminDeviceRepairHistoryController {
  constructor(private readonly repairHistoryService: RepairHistoryService) {}

  @Get(':deviceId/repair-histories')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all device repair history by deviceId',
    type: PageDto,
  })
  async getAllDeviceRepairHistories(
    @Param('deviceId') deviceId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: DeviceRepairHistoryPageOptionsDto,
  ): Promise<PageDto<RepairHistoryDto>> {
    return this.repairHistoryService.getAllDeviceRepairHistories(
      deviceId,
      pageOptionsDto,
    );
  }

  @Post('repair-histories')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create device repair history',
    type: RepairHistoryDto,
  })
  async createDeviceRepairHistory(
    @Body() createDeviceRepairHistoryDto: CreateDeviceRepairHistoryDto,
  ): Promise<RepairHistoryDto> {
    return this.repairHistoryService.createDeviceRepairHistory(
      createDeviceRepairHistoryDto,
    );
  }

  @Delete('repair-histories/:repairHistoryId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device repair history',
  })
  async deleteDeviceRepairHistory(
    @Param('repairHistoryId') repairHistoryId: number,
  ): Promise<void> {
    return this.repairHistoryService.deleteDeviceRepairHistory(repairHistoryId);
  }
}
