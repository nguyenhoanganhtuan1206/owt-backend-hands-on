import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { SkillGroupDto } from '../../skill-group/dtos/skill-group.dto';
import { SkillGroupsPageOptionsDto } from '../../skill-group/dtos/skill-groups-page-options.dto';
import { SkillGroupService } from '../../skill-group/services/skill-group.service';
import { CreateSkillDto } from '../dtos/create-skill.dto';
import { SkillDto } from '../dtos/skill.dto';
import { SkillPageOptionsDto } from '../dtos/skill-page-options.dto';
import UpdateMySkillDto from '../dtos/update-my-skill.dto';
import { UpdateSkillDto } from '../dtos/update-skill.dto';
import type { UserSkillDto } from '../dtos/user-skill.dto';
import { SkillService } from '../services/skill.service';

@Controller('admin/skills')
@ApiTags('admin/skills')
@UseGuards(JwtAuthGuard)
export class AdminSkillController {
  constructor(
    private skillService: SkillService,
    private skillGroupService: SkillGroupService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'get all skills',
    type: PageDto,
  })
  getAllSkills(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: SkillPageOptionsDto,
  ): Promise<PageDto<SkillDto>> {
    return this.skillService.getAllSkills(pageOptionsDto);
  }

  @Get('search')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Search skills of the current user',
    type: [SkillGroupDto],
  })
  searchSkills(@Query('name') name?: string): Promise<SkillGroupDto[]> {
    return this.skillGroupService.searchSkills(name);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Admin get list of skills by user id',
    type: PageDto,
  })
  getSkillsByUserId(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: SkillGroupsPageOptionsDto,
    @Param('id') userId: number,
  ): Promise<PageDto<SkillGroupDto>> {
    return this.skillService.getSkillsByUserId(pageOptionsDto, userId);
  }

  @Put(':groupId/:userId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiOkResponse({
    description: 'Admin update skills by group id and user id',
  })
  updateSkills(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
    @Body() updateMySkillDto: UpdateMySkillDto,
  ): Promise<UserSkillDto[]> {
    return this.skillService.updateSkills(groupId, userId, updateMySkillDto);
  }

  @Post()
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Create skill',
    type: SkillDto,
  })
  async createSkill(@Body() createSkillDto: CreateSkillDto): Promise<SkillDto> {
    return this.skillService.createSkill(createSkillDto);
  }

  @Put(':skillId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update skill by id',
    type: SkillDto,
  })
  async updateSkill(
    @Param('skillId') skillId: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<SkillGroupDto> {
    return this.skillService.updateSkill(skillId, updateSkillDto);
  }

  @Put(':userId/:skillId/toggle')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Update tick/untick checkbox for skill by user id and skill id',
  })
  updateToggleSkill(
    @Param('userId') userId: number,
    @Param('skillId') skillId: number,
  ): Promise<UserSkillDto> {
    return this.skillService.updateToggleSkill(skillId, userId);
  }

  @Put(':userId/:groupId/check')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Admin update tick checkbox for group of skills',
  })
  checkToggleGroupSkills(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<UserSkillDto[]> {
    return this.skillService.updateToggleGroupSkills(groupId, userId, true);
  }

  @Put(':userId/:groupId/uncheck')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Admin update untick checkbox for group of skills',
  })
  uncheckToggleGroupSkills(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<UserSkillDto[]> {
    return this.skillService.updateToggleGroupSkills(groupId, userId, false);
  }
}
