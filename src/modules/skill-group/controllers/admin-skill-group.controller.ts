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
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CreateSkillGroupDto } from '../dtos/create-skill-group.dto';
import { SkillGroupDto } from '../dtos/skill-group.dto';
import { SkillGroupsPageOptionsDto } from '../dtos/skill-groups-page-options.dto';
import { UpdateSkillGroupDto } from '../dtos/update-skill-group.dto';
import { SkillGroupService } from '../services/skill-group.service';

@Controller('admin/skill-groups')
@ApiTags('admin/skill-groups')
@UseGuards(JwtAuthGuard)
export class AdminSkillGroupController {
  constructor(private readonly skillGroupService: SkillGroupService) {}

  @Get()
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all skill groups',
    type: PageDto,
  })
  async getAllSkillGroups(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: SkillGroupsPageOptionsDto,
  ): Promise<PageDto<SkillGroupDto>> {
    return this.skillGroupService.getAllSkillGroups(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Create skill group',
    type: SkillGroupDto,
  })
  async createSkillGroup(
    @Body() createSkillGroupDto: CreateSkillGroupDto,
  ): Promise<SkillGroupDto> {
    return this.skillGroupService.createSkillGroup(createSkillGroupDto);
  }

  @Put(':skillGroupId')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update skill group by id',
    type: SkillGroupDto,
  })
  async updateSkillGroup(
    @Param('skillGroupId') skillGroupId: number,
    @Body() updateSkillGroupDto: UpdateSkillGroupDto,
  ): Promise<SkillGroupDto> {
    return this.skillGroupService.updateSkillGroup(
      skillGroupId,
      updateSkillGroupDto,
    );
  }
}
