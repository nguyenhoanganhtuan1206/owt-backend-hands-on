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
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import type { TimeOffCollaboratorDto } from '../dtos/time-off-collaborator.dto';
import { TimeOffCollaboratorPageOptionsDto } from '../dtos/time-off-collaborator-page-options.dto';
import { TimeOffCollaboratorService } from '../services/time-off-collaborator.service';

@Controller('time-off-requests')
@ApiTags('time-off-requests')
@UseGuards(JwtAuthGuard)
export class TimeOffCollaboratorController {
  constructor(
    private readonly timeOffCollaboratorService: TimeOffCollaboratorService,
  ) {}

  @Get('collaborators')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get list collaborators of current user login',
    type: PageDto,
  })
  getUserCollaborators(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffCollaboratorPageOptionsDto,
  ): Promise<PageDto<TimeOffCollaboratorDto>> {
    pageOptionsDto.employeeId = user.employeeId;

    return this.timeOffCollaboratorService.getAllCollaborators(pageOptionsDto);
  }
}
