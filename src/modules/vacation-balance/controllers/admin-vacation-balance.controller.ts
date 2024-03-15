import {
  Body,
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
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RequestStatusType, RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import type { TimeOffRequestDto } from '../../time-off-request/dtos/time-off-request.dto';
import { TimeOffRequestsPageOptionsDto } from '../../time-off-request/dtos/time-off-requests-page-options.dto';
import { TimeOffRequestService } from '../../time-off-request/services/time-off-request.service';
import { AllowanceDto } from '../dtos/allowance.dto';
import { UpdateAllowanceDto } from '../dtos/update-allowance.dto';
import { VacationBalancesPageOptionsDto } from '../dtos/vacation-balances-page-options.dto';
import { VacationBalanceService } from '../services/vacation-balance.service';

@Controller('admin/vacation-balances')
@ApiTags('admin/vacation-balances')
@UseGuards(JwtAuthGuard)
export class AdminVacationBalanceController {
  constructor(
    private readonly vacationBalanceService: VacationBalanceService,
    private readonly timeOffRequestService: TimeOffRequestService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all vacation balances',
    type: PageDto,
  })
  async getVacationBalances(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: VacationBalancesPageOptionsDto,
  ): Promise<PageDto<AllowanceDto>> {
    return this.vacationBalanceService.getAllVacationBalances(pageOptionsDto);
  }

  @Get(':userId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get list time-off requests by userId',
    type: PageDto,
  })
  getTimeOffRequests(
    @Param('userId') userId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    pageOptionsDto.userIds = [userId];
    pageOptionsDto.statuses = [RequestStatusType.APPROVED];

    return this.timeOffRequestService.getTimeOffRequests(
      userId,
      pageOptionsDto,
    );
  }

  @Put()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update total allowance for the user by admin',
    type: AllowanceDto,
  })
  async updateTotalAllowances(
    @Body() updateAllowanceDto: UpdateAllowanceDto,
  ): Promise<AllowanceDto> {
    return this.vacationBalanceService.updateTotalAllowances(
      updateAllowanceDto,
    );
  }
}
