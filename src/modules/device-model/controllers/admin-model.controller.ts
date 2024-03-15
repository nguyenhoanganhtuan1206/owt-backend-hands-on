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
import { CreateDeviceModelDto } from '../dtos/create-device-model.dto';
import { DeviceModelDto } from '../dtos/device-model.dto';
import { UpdateDeviceModelDto } from '../dtos/update-device-model.dto';
import { DeviceModelService } from '../services/device-model.service';

@Controller('admin/devices/models')
@ApiTags('admin/devices/models')
@UseGuards(JwtAuthGuard)
export class AdminDeviceModelController {
  constructor(private readonly deviceModelService: DeviceModelService) {}

  @Get()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all device models',
    type: [DeviceModelDto],
  })
  async getAllDeviceModels(): Promise<DeviceModelDto[]> {
    return this.deviceModelService.getAllDeviceModels();
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Create device model',
    type: DeviceModelDto,
  })
  async createDeviceModel(
    @Body() createDeviceModelDto: CreateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    return this.deviceModelService.createDeviceModel(createDeviceModelDto);
  }

  @Put(':modelId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update device model',
    type: DeviceModelDto,
  })
  async updateDeviceModel(
    @Param('modelId') modelId: number,
    @Body() updateDeviceModelDto: UpdateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    return this.deviceModelService.updateDeviceModel(
      modelId,
      updateDeviceModelDto,
    );
  }

  @Delete(':modelId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device model',
  })
  async deleteDeviceModel(@Param('modelId') modelId: number): Promise<void> {
    return this.deviceModelService.deleteDeviceModel(modelId);
  }
}
