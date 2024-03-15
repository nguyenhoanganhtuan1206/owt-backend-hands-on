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
import { CreateDeviceDto } from '../dtos/create-device.dto';
import { DeviceDto } from '../dtos/device.dto';
import { DeviceAssignHistoryPageOptionsDto } from '../dtos/device-assign-history-page-options.dto';
import type { DeviceAssigneeHistoryDto } from '../dtos/device-assignee-history.dto';
import { DevicesPageOptionsDto } from '../dtos/device-page-options.dto';
import { UpdateDeviceDto } from '../dtos/update-device.dto';
import { DeviceService } from '../services/device.service';

@Controller('admin/devices')
@ApiTags('admin/devices')
@UseGuards(JwtAuthGuard)
export class AdminDeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all devices',
    type: PageDto,
  })
  async getAllDevices(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: DevicesPageOptionsDto,
  ): Promise<PageDto<DeviceDto>> {
    return this.deviceService.getAllDevices(pageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get device details by id',
    type: DeviceDto,
  })
  getDeviceDetails(@Param('id') deviceId: number): Promise<DeviceDto> {
    return this.deviceService.getDeviceDetails(deviceId);
  }

  @Get(':deviceId/assignee-histories')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all assignee history of device',
    type: PageDto,
  })
  async getAllDeviceAssignHistoriesById(
    @Param('deviceId') deviceId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: DeviceAssignHistoryPageOptionsDto,
  ): Promise<PageDto<DeviceAssigneeHistoryDto>> {
    return this.deviceService.getAllDeviceAssignHistoriesById(
      deviceId,
      pageOptionsDto,
    );
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create device',
    type: DeviceDto,
  })
  async createDevice(
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceDto> {
    return this.deviceService.createDevice(createDeviceDto);
  }

  @Put(':deviceId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update device by id',
    type: DeviceDto,
  })
  async updateDevice(
    @Param('deviceId') deviceId: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceDto> {
    return this.deviceService.updateDevice(deviceId, updateDeviceDto);
  }
}
