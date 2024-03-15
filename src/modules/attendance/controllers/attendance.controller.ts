import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { DeleteFileDto } from '../dtos/delete-file.dto';
import { TotalRequestDto } from '../dtos/total-request.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller('attendances')
@ApiTags('attendances')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private s3Service: AwsS3Service,
  ) {}

  @Get('/total-requests')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get total requests for current user login',
    type: TotalRequestDto,
  })
  getTotalRequests(@AuthUser() user: UserEntity): Promise<TotalRequestDto> {
    return this.attendanceService.findTotalRequestsForUser(user);
  }

  @Delete('delete-file')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ASSISTANT, RoleType.ADMIN])
  @ApiOkResponse({
    description: 'Delete attach file by user login',
  })
  async deleteFile(@Body() deleteFileDto: DeleteFileDto): Promise<void> {
    await this.s3Service.deleteFile(deleteFileDto.fileUrl);
  }
}
