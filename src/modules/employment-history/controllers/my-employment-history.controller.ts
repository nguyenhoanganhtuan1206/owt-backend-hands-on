import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateEmploymentHistoryDto } from '../dtos/create-employment-history.dto';
import { EmploymentHistoryDto } from '../dtos/employment-history.dto';
import type { UpdateEmploymentHistoryDto } from '../dtos/update-employment-history.dto';
import type { UpdateEmploymentHistoryPositionDto } from '../dtos/update-employment-history-position.dto';
import { EmploymentHistoryService } from '../services/employment-history.service';

@Controller('my-employment-histories')
@ApiTags('my-employment-histories')
@UseGuards(JwtAuthGuard)
export class MyEmploymentHistoryController {
  constructor(
    private readonly employmentHistoryService: EmploymentHistoryService,
  ) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all my employment histories',
    type: [EmploymentHistoryDto],
  })
  async getMyEmploymentHistories(
    @AuthUser() user: UserEntity,
  ): Promise<EmploymentHistoryDto[]> {
    return this.employmentHistoryService.getEmploymentHistoryByUserId(user.id);
  }

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create my employment history',
    type: EmploymentHistoryDto,
  })
  async createEmploymentHistory(
    @AuthUser() user: UserEntity,
    @Body() createEmploymentHistoryDto: CreateEmploymentHistoryDto,
  ): Promise<EmploymentHistoryDto> {
    return this.employmentHistoryService.createEmploymentHistory(
      user.id,
      createEmploymentHistoryDto,
    );
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete employment history' })
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  async deleteEmploymentHistory(
    @AuthUser() user: UserEntity,
    @Param('id') id: number,
  ): Promise<void> {
    return this.employmentHistoryService.deleteEmploymentHistory(user.id, id);
  }

  @Put('positions')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update positions of my employment histories',
    type: [EmploymentHistoryDto],
  })
  async updateMyEmploymentHistoriesPositions(
    @AuthUser() user: UserEntity,
    @Body() updatePositionDtos: UpdateEmploymentHistoryPositionDto[],
  ): Promise<EmploymentHistoryDto[]> {
    return this.employmentHistoryService.updateEmploymentHistoriesPositions(
      user.id,
      updatePositionDtos,
    );
  }

  @Put(':id/toggle')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update tick/untick checkbox for my employment history by id',
  })
  async updateToggleEmploymentHistory(
    @Param('id') id: number,
  ): Promise<EmploymentHistoryDto> {
    return this.employmentHistoryService.updateToggleEmploymentHistory(id);
  }

  @Put()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiResponse({
    description: 'Update my employment histories',
  })
  async updateEmploymentHistories(
    @AuthUser() user: UserEntity,
    @Body() updateEmploymentHistoryDtos: UpdateEmploymentHistoryDto[],
  ): Promise<EmploymentHistoryDto[]> {
    return this.employmentHistoryService.updateEmploymentHistories(
      user.id,
      updateEmploymentHistoryDtos,
    );
  }
}
