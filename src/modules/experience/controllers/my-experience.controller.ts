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
import { Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateExperienceDto } from '../dtos/create-experience.dto';
import { ExperienceDto } from '../dtos/experience.dto';
import { UpdateExperienceDto } from '../dtos/update-experience.dto';
import { UpdateExperiencePositionDto } from '../dtos/update-experience-position.dto';
import { ExperienceService } from '../services/experience.service';

@Controller('my-experiences')
@ApiTags('my-experiences')
@UseGuards(JwtAuthGuard)
export class MyExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create my experience',
    type: ExperienceDto,
  })
  async createMyExperience(
    @AuthUser() user: UserEntity,
    @Body() createExperienceDto: CreateExperienceDto,
  ): Promise<ExperienceDto> {
    return this.experienceService.createExperience(
      user.id,
      createExperienceDto,
    );
  }

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get my experiences',
    type: ExperienceDto,
  })
  async getMyExperiences(
    @AuthUser() user: UserEntity,
  ): Promise<ExperienceDto[]> {
    return this.experienceService.getExperiencesByUserId(user.id);
  }

  @Put(':id/toggle')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update tick/untick checkbox for my experience by id',
  })
  async updateToggleExperience(
    @AuthUser() user: UserEntity,
    @Param('id') experienceId: number,
  ): Promise<ExperienceDto> {
    return this.experienceService.updateToggleExperience(user.id, experienceId);
  }

  @Put('positions')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update positions of my experience',
    type: [ExperienceDto],
  })
  async updateMyExperiencePositions(
    @AuthUser() user: UserEntity,
    @Body(new ParseArrayPipe({ items: UpdateExperiencePositionDto }))
    updatePositionDtos: UpdateExperiencePositionDto[],
  ): Promise<ExperienceDto[]> {
    return this.experienceService.updateExperiencePositions(
      user.id,
      updatePositionDtos,
    );
  }

  @Put()
  @ApiOkResponse({ description: 'Update a list of my experiences' })
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  async updateMyExperiences(
    @AuthUser() user: UserEntity,
    @Body(new ParseArrayPipe({ items: UpdateExperienceDto }))
    updateExperienceDtos: UpdateExperienceDto[],
  ): Promise<ExperienceDto[]> {
    return this.experienceService.updateExperiences(
      user.id,
      updateExperienceDtos,
    );
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete experience' })
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  async deleteExperience(
    @AuthUser() user: UserEntity,
    @Param('id') id: number,
  ): Promise<void> {
    return this.experienceService.deleteExperience(user.id, id);
  }
}
