import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import type { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import type { OtherUserDto } from '../dtos/other-user.dto';
import { OtherUsersPageOptionsDto } from '../dtos/other-users-page-options.dto';
import { TotalRequestDto } from '../dtos/total-request.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller('admin/attendances')
@ApiTags('admin/attendances')
@UseGuards(JwtAuthGuard)
export class AdminAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('/total-requests')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get total requests for current admin, assistant login',
    type: TotalRequestDto,
  })
  getTotalRequests(): Promise<TotalRequestDto> {
    return this.attendanceService.findTotalRequestsAllUsers();
  }

  @Get('/others')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Get the list of people whose names are not shown on the other 3 previous tabs(in-office, time-off, wfh)',
  })
  getOtherUsers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: OtherUsersPageOptionsDto,
  ): Promise<PageDto<OtherUserDto>> {
    return this.attendanceService.getOtherUsers(pageOptionsDto);
  }
}
