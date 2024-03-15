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
import { Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CreateEmploymentHistoryDto } from '../dtos/create-employment-history.dto';
import { EmploymentHistoryDto } from '../dtos/employment-history.dto';
import type { UpdateEmploymentHistoryDto } from '../dtos/update-employment-history.dto';
import type { UpdateEmploymentHistoryPositionDto } from '../dtos/update-employment-history-position.dto';
import { EmploymentHistoryService } from '../services/employment-history.service';

@Controller('admin/employment-histories')
@ApiTags('admin/employment-histories')
@UseGuards(JwtAuthGuard)
export class AdminEmploymentHistoryController {
  constructor(
    private readonly employmentHistoryService: EmploymentHistoryService,
  ) {}

  @Get(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get list employment history of employee',
    type: [EmploymentHistoryDto],
  })
  async getEmploymentHistories(
    @Param('userId') userId: number,
  ): Promise<EmploymentHistoryDto[]> {
    return this.employmentHistoryService.getEmploymentHistoryByUserId(userId);
  }

  @Post(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create employment history for employee',
    type: EmploymentHistoryDto,
  })
  async createEmployeeEmploymentHistory(
    @Param('userId') userId: number,
    @Body() createEmploymentHistoryDto: CreateEmploymentHistoryDto,
  ): Promise<EmploymentHistoryDto> {
    return this.employmentHistoryService.createEmploymentHistory(
      userId,
      createEmploymentHistoryDto,
    );
  }

  @Put(':id/toggle')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update tick/untick checkbox for employment history by id',
  })
  async updateToggleEmploymentHistory(
    @Param('id') employmentHistoryId: number,
  ): Promise<EmploymentHistoryDto> {
    return this.employmentHistoryService.updateToggleEmploymentHistory(
      employmentHistoryId,
    );
  }

  @Delete('/:userId/:id')
  @Auth([RoleType.ADMIN])
  @ApiOkResponse({
    description: 'Delete employment history',
  })
  async deleteEmploymentHistory(
    @Param('id') employmentHistoryId: number,
    @Param('userId') userId: number,
  ): Promise<void> {
    return this.employmentHistoryService.deleteEmploymentHistory(
      userId,
      employmentHistoryId,
    );
  }

  @Put(':userId/positions')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update positions employment histories of employee',
    type: [EmploymentHistoryDto],
  })
  async updateEmployeeEmploymentHistoriesPositions(
    @Param('userId') userId: number,
    @Body() updatePositionDtos: UpdateEmploymentHistoryPositionDto[],
  ): Promise<EmploymentHistoryDto[]> {
    return this.employmentHistoryService.updateEmploymentHistoriesPositions(
      userId,
      updatePositionDtos,
    );
  }

  @Put(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiResponse({
    description: `Update employee's employment histories`,
  })
  async updateEmploymentHistories(
    @Param('userId') userId: number,
    @Body() updateEmploymentHistoryDtos: UpdateEmploymentHistoryDto[],
  ): Promise<EmploymentHistoryDto[]> {
    return this.employmentHistoryService.updateEmploymentHistories(
      userId,
      updateEmploymentHistoryDtos,
    );
  }
}
