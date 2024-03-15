import {
  Body,
  Controller,
  Get,
  Headers,
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
import { ExternalUserAccessDto } from '../../auth/dto/ExternalUserAccessDto';
import { TimeOffRequestDto } from '../dtos/time-off-request.dto';
import { TimeOffRequestsPageOptionsDto } from '../dtos/time-off-requests-page-options.dto';
import { UpdateTimeOffRequestDto } from '../dtos/update-time-off-request-dto';
import { TimeOffRequestService } from '../services/time-off-request.service';

@Controller('admin/time-off-requests')
@ApiTags('admin/time-off-requests')
export class AdminTimeOffRequestController {
  constructor(private readonly timeOffRequestService: TimeOffRequestService) {}

  @Get()
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all time-off requests by Admin/Assistant',
    type: PageDto,
  })
  getTimeOffRequests(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    return this.timeOffRequestService.getAllTimeOffRequests(pageOptionsDto);
  }

  @Put('pm/approve')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Approve time-off request by PM',
    type: TimeOffRequestDto,
  })
  async approveTimeOffRequestByPM(
    @Body() externalAccess: ExternalUserAccessDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.approveTimeOffRequestByPM(externalAccess);
  }

  @Put('pm/refuse')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status refuse to time-off request by PM',
    type: TimeOffRequestDto,
  })
  async refuseTimeOffRequestByPM(
    @Body() externalAccess: ExternalUserAccessDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.refuseTimeOffRequestByPM(externalAccess);
  }

  @Get('external/details')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get details time-off request by PM',
    type: TimeOffRequestDto,
  })
  async getTimeOffRequestDetailsByPM(
    @Headers('x-external-token') externalToken: string,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.getTimeOffRequestDetailsByPM(
      externalToken,
    );
  }

  @Get(':timeOffRequestId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get details time-off request of user by Admin/Assistant',
    type: TimeOffRequestDto,
  })
  async getTimeOffRequestDetails(
    @Param('timeOffRequestId') timeOffRequestId: number,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.getTimeOffRequestDetails(
      timeOffRequestId,
    );
  }

  @Put(':timeOffRequestId/email-pm')
  @Auth([RoleType.ADMIN])
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Send email confirm time-off request to Project Manager',
    type: TimeOffRequestDto,
  })
  async sendEmailToPM(
    @Param('timeOffRequestId') timeOffRequestId: number,
    @Body() updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.sendEmailToPM(
      timeOffRequestId,
      updateTimeOffRequestDto,
    );
  }

  @Put(':timeOffRequestId/email-assistant')
  @Auth([RoleType.ADMIN])
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Send email confirm time-off request to Assistant',
    type: TimeOffRequestDto,
  })
  async sendEmailToAssistant(
    @Param('timeOffRequestId') timeOffRequestId: number,
    @Body() updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.sendEmailToAssistant(
      timeOffRequestId,
      updateTimeOffRequestDto,
    );
  }

  @Put(':timeOffRequestId/approve')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status approve to time-off request by Admin/Assistant',
    type: TimeOffRequestDto,
  })
  async approveTimeOffRequestByAdminOrAssistant(
    @Param('timeOffRequestId') timeOffRequestId: number,
    @Body() updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.approveTimeOffRequestByAdminOrAssistant(
      timeOffRequestId,
      updateTimeOffRequestDto,
    );
  }

  @Put(':timeOffRequestId/refuse')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status refuse to time-off request by Admin/Assistant',
    type: TimeOffRequestDto,
  })
  async refuseTimeOffRequestByAdminOrAssistant(
    @Param('timeOffRequestId') timeOffRequestId: number,
    @Body() updateTimeOffRequestDto: UpdateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.refuseTimeOffRequestByAdminOrAssistant(
      timeOffRequestId,
      updateTimeOffRequestDto,
    );
  }
}
