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
import { DeviceModelDto } from '../../device-model/dtos/device-model.dto';
import { CreateDeviceOwnerDto } from '../dtos/create-device-owner.dto';
import { DeviceOwnerDto } from '../dtos/device-owner.dto';
import { UpdateDeviceOwnerDto } from '../dtos/update-device-owner.dto';
import { DeviceOwnerService } from '../services/device-owner.service';

@Controller('admin/devices/owners')
@ApiTags('admin/devices/owners')
@UseGuards(JwtAuthGuard)
export class AdminDeviceOwnerController {
  constructor(private readonly deviceOwnerService: DeviceOwnerService) {}

  @Get()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all device owners',
    type: [DeviceOwnerDto],
  })
  async getAllDeviceOwners(): Promise<DeviceOwnerDto[]> {
    return this.deviceOwnerService.getAllDeviceOwners();
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Create device owner',
    type: DeviceOwnerDto,
  })
  async createDeviceOwner(
    @Body() createDeviceOwnerDto: CreateDeviceOwnerDto,
  ): Promise<DeviceOwnerDto> {
    return this.deviceOwnerService.createDeviceOwner(createDeviceOwnerDto);
  }

  @Put(':ownerId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update device owner',
    type: DeviceModelDto,
  })
  async updateDeviceOwner(
    @Param('ownerId') ownerId: number,
    @Body() updateDeviceOwnerDto: UpdateDeviceOwnerDto,
  ): Promise<DeviceOwnerDto> {
    return this.deviceOwnerService.updateDeviceOwner(
      ownerId,
      updateDeviceOwnerDto,
    );
  }

  @Delete(':ownerId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device owner',
  })
  async deleteDeviceOwner(@Param('ownerId') ownerId: number): Promise<void> {
    return this.deviceOwnerService.deleteDeviceOwner(ownerId);
  }
}
