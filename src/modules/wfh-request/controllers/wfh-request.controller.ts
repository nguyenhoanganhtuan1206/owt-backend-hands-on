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
import { RoleType, WFH_REQUEST_ATTACH_FILE_FOLDER } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { IFile } from '../../../interfaces';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { validateFileType } from '../../../validators/file.validator';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateWfhRequestDto } from '../dtos/create-wfh-request.dto';
import { WfhRequestDto } from '../dtos/wfh-request.dto';
import { WfhRequestsPageOptionsDto } from '../dtos/wfh-requests-page-options.dto';
import { WfhRequestService } from '../services/wfh-request.service';

@Controller('wfh-requests')
@ApiTags('wfh-requests')
@UseGuards(JwtAuthGuard)
export class WfhRequestController {
  constructor(
    private readonly wfhRequestService: WfhRequestService,
    private s3Service: AwsS3Service,
  ) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get current user login list wfh requests',
    type: PageDto,
  })
  getWfhRequestByUserId(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): Promise<PageDto<WfhRequestDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.wfhRequestService.getAllWfhRequests(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User create wfh request',
    type: WfhRequestDto,
  })
  createWfhRequest(
    @Body() createWfhRequestDto: CreateWfhRequestDto,
    @AuthUser() user: UserEntity,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.createWfhRequest(
      user.id,
      createWfhRequestDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'User delete wfh request by id',
  })
  deleteWfhRequest(
    @AuthUser() user: UserEntity,
    @Param('id') wfhRequestId: number,
  ): Promise<void> {
    return this.wfhRequestService.deleteWfhRequest(user.id, wfhRequestId);
  }

  @Post('upload-file')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    description: 'User upload file for wfh request',
    type: String,
  })
  async uploadFile(@AuthUser() user: UserEntity, @UploadedFile() file: IFile) {
    validateFileType(file);

    const s3Path = await this.s3Service.uploadFile(
      file,
      WFH_REQUEST_ATTACH_FILE_FOLDER,
      user.id,
    );

    return { s3Path };
  }

  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User get wfh request by id',
    type: WfhRequestDto,
  })
  async getWfhRequestDetails(
    @AuthUser() user: UserEntity,
    @Param('id') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.getWfhRequestDetails(user.id, wfhRequestId);
  }
}
