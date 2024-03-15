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
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { DeviceAssigneeHistoryDto } from '../dtos/device-assignee-history.dto';
import { DevicesPageOptionsDto } from '../dtos/device-page-options.dto';
import { DeviceService } from '../services/device.service';

@Controller('devices')
@ApiTags('devices')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description:
      'Gets the list of current users logged into the currently assigned device',
    type: PageDto,
  })
  async getMyDevicesCurrentlyAssigned(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: DevicesPageOptionsDto,
  ): Promise<PageDto<DeviceAssigneeHistoryDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.deviceService.getMyDevicesCurrentlyAssigned(pageOptionsDto);
  }

  @Get(':deviceAssignId')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User get device assign detail by id',
    type: DeviceAssigneeHistoryDto,
  })
  getDeviceAssignHistoryDetail(
    @AuthUser() user: UserEntity,
    @Param('deviceAssignId') deviceAssignId: number,
  ): Promise<DeviceAssigneeHistoryDto> {
    return this.deviceService.getDeviceAssignHistoryDetail(
      user,
      deviceAssignId,
    );
  }
}
