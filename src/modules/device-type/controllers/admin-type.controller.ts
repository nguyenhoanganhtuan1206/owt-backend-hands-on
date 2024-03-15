import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CreateDeviceTypeDto } from '../dtos/create-device-type.dto';
import { DeviceTypeDto } from '../dtos/device-type.dto';
import { UpdateDeviceTypeDto } from '../dtos/update-device-type.dto';
import { DeviceTypeService } from '../services/device-type.service';

@Controller('admin/devices/types')
@ApiTags('admin/devices/types')
@UseGuards(JwtAuthGuard)
export class AdminDeviceTypeController {
  constructor(private readonly deviceTypeService: DeviceTypeService) {}

  @Get()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all device types',
    type: [DeviceTypeDto],
  })
  async getAllDeviceTypes(): Promise<DeviceTypeDto[]> {
    return this.deviceTypeService.getAllDeviceTypes();
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Create device type',
    type: DeviceTypeDto,
  })
  async createDeviceType(
    @Body() createDeviceTypeDto: CreateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    return this.deviceTypeService.createDeviceType(createDeviceTypeDto);
  }

  @Put(':typeId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update device type',
    type: DeviceTypeDto,
  })
  async updateDeviceType(
    @Param('typeId') typeId: number,
    @Body() updateDeviceTypeDto: UpdateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    return this.deviceTypeService.updateDeviceType(typeId, updateDeviceTypeDto);
  }

  @Delete(':typeId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device type',
  })
  async deleteDeviceType(@Param('typeId') typeId: number): Promise<void> {
    return this.deviceTypeService.deleteDeviceType(typeId);
  }
}
