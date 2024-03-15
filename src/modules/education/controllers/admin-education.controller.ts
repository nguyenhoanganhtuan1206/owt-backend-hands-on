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
import type { UpdateEducationDto } from '../dtos';
import { CreateEducationDto, EducationDto } from '../dtos';
import type { UpdatePositionDto } from '../dtos/update-position.dto';
import { EducationService } from '../services/education.service';

@Controller('/admin/educations')
@ApiTags('/admin/educations')
@UseGuards(JwtAuthGuard)
export class AdminEducationController {
  constructor(private educationService: EducationService) {}

  @Get(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get list educations of employee',
    type: [EducationDto],
  })
  async getEmployeeEducations(
    @Param('userId') userId: number,
  ): Promise<EducationDto[]> {
    return this.educationService.getEducationsByUserId(userId);
  }

  @Post(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create education for employee',
    type: EducationDto,
  })
  async createEmployeeEducation(
    @Param('userId') userId: number,
    @Body() createEducation: CreateEducationDto,
  ): Promise<EducationDto> {
    return this.educationService.createEducation(userId, createEducation);
  }

  @Put(':id/toggle')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update tick/untick checkbox for employee education by id',
  })
  async updateToggleEducation(
    @Param('id') educationId: number,
  ): Promise<EducationDto> {
    return this.educationService.updateToggleEducation(educationId);
  }

  @Put(':userId/positions')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update education positions for employee',
    type: [EducationDto],
  })
  async updateEducationPositions(
    @Param('userId') userId: number,
    @Body() updatePositionDtos: UpdatePositionDto[],
  ): Promise<EducationDto[]> {
    return this.educationService.updateEducationPositions(
      userId,
      updatePositionDtos,
    );
  }

  @Put('/:userId')
  @Auth([RoleType.ADMIN])
  @ApiOkResponse({
    description: 'Update a list of educations',
  })
  async updateEmployeeEducations(
    @Body() updateEducationDtos: UpdateEducationDto[],
    @Param('userId') userId: number,
  ): Promise<EducationDto[]> {
    return this.educationService.updateEmployeeEducations(
      userId,
      updateEducationDtos,
    );
  }

  @Delete('/:userId/:educationId')
  @Auth([RoleType.ADMIN])
  @ApiOkResponse({
    description: 'Delete an education',
  })
  async deleteEmployeeEducation(
    @Param('educationId') educationId: number,
    @Param('userId') userId: number,
  ): Promise<void> {
    return this.educationService.deleteEmployeeEducation(userId, educationId);
  }
}
