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
import type { UpdateEducationDto } from '../dtos';
import { CreateEducationDto, EducationDto } from '../dtos';
import type { UpdatePositionDto } from '../dtos/update-position.dto';
import { EducationService } from '../services/education.service';

@Controller('my-educations')
@ApiTags('my-educations')
@UseGuards(JwtAuthGuard)
export class MyEducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all my educations',
    type: [EducationDto],
  })
  async getMyEducations(@AuthUser() user: UserEntity): Promise<EducationDto[]> {
    return this.educationService.getEducationsByUserId(user.id);
  }

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create my education',
    type: EducationDto,
  })
  async createMyEducation(
    @AuthUser() user: UserEntity,
    @Body() createEducation: CreateEducationDto,
  ): Promise<EducationDto> {
    return this.educationService.createEducation(user.id, createEducation);
  }

  @Put(':id/toggle')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update tick/untick checkbox for my education by id',
  })
  async updateToggleEducation(
    @Param('id') educationId: number,
  ): Promise<EducationDto> {
    return this.educationService.updateToggleEducation(educationId);
  }

  @Put('positions')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update positions of my educations',
    type: [EducationDto],
  })
  async updateMyEducationPositions(
    @AuthUser() user: UserEntity,
    @Body() updatePositionDtos: UpdatePositionDto[],
  ): Promise<EducationDto[]> {
    return this.educationService.updateEducationPositions(
      user.id,
      updatePositionDtos,
    );
  }

  @Put()
  @ApiOkResponse({ description: 'Update a list of my educations' })
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  async updateEducation(
    @AuthUser() user: UserEntity,
    @Body() updateEducationDtos: UpdateEducationDto[],
  ): Promise<EducationDto[]> {
    return this.educationService.updateEducations(user, updateEducationDtos);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete education' })
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  async deleteEducation(
    @AuthUser() user: UserEntity,
    @Param('id') id: number,
  ): Promise<void> {
    return this.educationService.deleteEducation(user, id);
  }
}
