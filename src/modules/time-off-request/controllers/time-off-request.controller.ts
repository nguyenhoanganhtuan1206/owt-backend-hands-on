import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import {
  RoleType,
  TIME_OFF_REQUEST_ATTACH_FILE_FOLDER,
} from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { IFile } from '../../../interfaces';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { validateFileType } from '../../../validators/file.validator';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';
import { TimeOffRequestDto } from '../dtos/time-off-request.dto';
import { TimeOffRequestsPageOptionsDto } from '../dtos/time-off-requests-page-options.dto';
import { TimeOffRequestService } from '../services/time-off-request.service';

@Controller('time-off-requests')
@ApiTags('time-off-requests')
@UseGuards(JwtAuthGuard)
export class TimeOffRequestController {
  constructor(
    private readonly timeOffRequestService: TimeOffRequestService,
    private s3Service: AwsS3Service,
  ) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get current user login list time-off requests',
    type: PageDto,
  })
  getTimeOffRequests(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.timeOffRequestService.getTimeOffRequests(
      user.id,
      pageOptionsDto,
    );
  }

  @Get('accrued-balance')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: `Get employee's accrued balance`,
  })
  async getUserAccruedBalance(@AuthUser() user: UserEntity): Promise<number> {
    return this.timeOffRequestService.getAccruedBalance(user.id);
  }

  @Post('upload-file')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER, RoleType.ASSISTANT, RoleType.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    description: 'User attach file for time-off request',
    type: String,
  })
  async uploadFile(@AuthUser() user: UserEntity, @UploadedFile() file: IFile) {
    validateFileType(file);

    const s3Path = await this.s3Service.uploadFile(
      file,
      TIME_OFF_REQUEST_ATTACH_FILE_FOLDER,
      user.id,
    );

    return { s3Path };
  }

  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User get time-off request by id',
    type: TimeOffRequestDto,
  })
  async getTimeOffRequestDetails(
    @Param('id') timeOffRequestId: number,
    @AuthUser() user: UserEntity,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.getTimeOffRequestDetails(
      timeOffRequestId,
      user.id,
    );
  }

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'create time-off request by user',
    type: TimeOffRequestDto,
  })
  createTimeOffRequest(
    @AuthUser() user: UserEntity,
    @Body() createTimeOffRequestDto: CreateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.createTimeOffRequest(
      user,
      createTimeOffRequestDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'User delete time-off request by id',
  })
  deleteTimeOffRequest(
    @AuthUser() user: UserEntity,
    @Param('id') timeOffRequestId: number,
  ): Promise<void> {
    return this.timeOffRequestService.deleteTimeOffRequest(
      user.id,
      timeOffRequestId,
    );
  }
}
