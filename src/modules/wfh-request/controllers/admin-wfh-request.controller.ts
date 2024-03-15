import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { WfhRequestDto } from '../dtos/wfh-request.dto';
import { WfhRequestsPageOptionsDto } from '../dtos/wfh-requests-page-options.dto';
import { WfhRequestService } from '../services/wfh-request.service';

@Controller('admin/wfh-requests')
@ApiTags('admin/wfh-requests')
@UseGuards(JwtAuthGuard)
export class AdminWfhRequestController {
  constructor(private readonly wfhRequestService: WfhRequestService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all wfh requests',
    type: PageDto,
  })
  async getWfhRequests(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): Promise<PageDto<WfhRequestDto>> {
    return this.wfhRequestService.getAllWfhRequests(pageOptionsDto);
  }

  @Put(':wfhRequestId/approve')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status approve to wfh request',
    type: WfhRequestDto,
  })
  async approveWfhRequest(
    @Param('wfhRequestId') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.approveWfhRequest(wfhRequestId);
  }

  @Put(':wfhRequestId/refuse')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status refuse to wfh request',
    type: WfhRequestDto,
  })
  async refuseWfhRequest(
    @Param('wfhRequestId') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.refuseWfhRequest(wfhRequestId);
  }

  @Get(':userId/:wfhRequestId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get details wfh request of user',
    type: WfhRequestDto,
  })
  async getUserWfhRequestDetails(
    @Param('userId') userId: number,
    @Param('wfhRequestId') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.getWfhRequestDetails(userId, wfhRequestId);
  }
}
