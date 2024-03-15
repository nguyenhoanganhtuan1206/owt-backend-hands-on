import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CreateExperienceDto } from '../dtos/create-experience.dto';
import { ExperienceDto } from '../dtos/experience.dto';
import { UpdateExperienceDto } from '../dtos/update-experience.dto';
import { UpdateExperiencePositionDto } from '../dtos/update-experience-position.dto';
import { ExperienceService } from '../services/experience.service';

@Controller('admin/experiences')
@ApiTags('admin/experiences')
@UseGuards(JwtAuthGuard)
export class AdminExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get experiences of employee',
    type: ExperienceDto,
  })
  async getExperiences(
    @Param('userId') userId: number,
  ): Promise<ExperienceDto[]> {
    return this.experienceService.getExperiencesByUserId(userId);
  }

  @Post(':userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create experience for employee',
    type: ExperienceDto,
  })
  async createExperience(
    @Param('userId') userId: number,
    @Body() createExperienceDto: CreateExperienceDto,
  ): Promise<ExperienceDto> {
    return this.experienceService.createExperience(userId, createExperienceDto);
  }

  @Put(':userId/positions')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update experience positions for employee',
    type: [ExperienceDto],
  })
  async updateExperiencePositions(
    @Param('userId') userId: number,
    @Body(new ParseArrayPipe({ items: UpdateExperiencePositionDto }))
    updatePositionDtos: UpdateExperiencePositionDto[],
  ): Promise<ExperienceDto[]> {
    return this.experienceService.updateExperiencePositions(
      userId,
      updatePositionDtos,
    );
  }

  @Put('/:userId/:id/toggle')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiOkResponse({
    description: `Update tick/untick checkbox for employee's experiences by id`,
  })
  async updateToggleExperience(
    @Param('userId') userId: number,
    @Param('id') experienceId: number,
  ): Promise<ExperienceDto> {
    return this.experienceService.updateToggleExperience(userId, experienceId);
  }

  @Put('/:userId')
  @ApiOkResponse({ description: `Update a list of employee's experiences` })
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  async updateExperiences(
    @Body(new ParseArrayPipe({ items: UpdateExperienceDto }))
    updateExperienceDtos: UpdateExperienceDto[],
    @Param('userId') userId: number,
  ): Promise<ExperienceDto[]> {
    return this.experienceService.updateExperiences(
      userId,
      updateExperienceDtos,
    );
  }

  @Delete('/:userId/:id')
  @ApiOkResponse({ description: 'Delete experience' })
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  async deleteExperience(
    @Param('userId') userId: number,
    @Param('id') id: number,
  ): Promise<void> {
    return this.experienceService.deleteExperience(userId, id);
  }
}
