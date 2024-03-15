import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import type { TimeOffCollaboratorDto } from '../dtos/time-off-collaborator.dto';
import { TimeOffCollaboratorPageOptionsDto } from '../dtos/time-off-collaborator-page-options.dto';
import { TimeOffCollaboratorService } from '../services/time-off-collaborator.service';

@Controller('admin/time-off-requests')
@ApiTags('admin/time-off-requests')
export class AdminTimeOffCollaboratorController {
  constructor(
    private readonly timeOffCollaboratorService: TimeOffCollaboratorService,
  ) {}

  @Get('collaborators')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get list collaborators of employee',
    type: PageDto,
  })
  getCollaborators(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffCollaboratorPageOptionsDto,
  ): Promise<PageDto<TimeOffCollaboratorDto>> {
    return this.timeOffCollaboratorService.getAllCollaborators(pageOptionsDto);
  }
}
