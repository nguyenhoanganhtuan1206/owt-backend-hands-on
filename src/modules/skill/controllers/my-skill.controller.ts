import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { SkillGroupDto } from '../../skill-group/dtos/skill-group.dto';
import { SkillGroupsPageOptionsDto } from '../../skill-group/dtos/skill-groups-page-options.dto';
import { SkillGroupService } from '../../skill-group/services/skill-group.service';
import { UserEntity } from '../../user/entities/user.entity';
import UpdateMySkillDto from '../dtos/update-my-skill.dto';
import type { UserSkillDto } from '../dtos/user-skill.dto';
import { SkillService } from '../services/skill.service';

@Controller('/my-skills')
@ApiTags('/my-skills')
@UseGuards(JwtAuthGuard)
export class MySkillController {
  constructor(
    private skillService: SkillService,
    private skillGroupService: SkillGroupService,
  ) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'get list skills of the current user',
    type: PageDto,
  })
  getMySkills(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: SkillGroupsPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<PageDto<SkillGroupDto>> {
    return this.skillService.getSkillsByUserId(pageOptionsDto, user.id);
  }

  @Get('search')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Search list skills of the current user',
    type: [SkillGroupDto],
  })
  searchMySkills(@Query('name') name?: string): Promise<SkillGroupDto[]> {
    return this.skillGroupService.searchSkills(name);
  }

  @Put(':id')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update skills of user by groupId',
  })
  updateMySkills(
    @Param('id') groupId: number,
    @AuthUser() user: UserEntity,
    @Body() updateMySkillDto: UpdateMySkillDto,
  ): Promise<UserSkillDto[]> {
    return this.skillService.updateSkills(groupId, user.id, updateMySkillDto);
  }

  @Put(':id/toggle')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update tick/untick checkbox for my skill by skill id',
  })
  updateToggleSkill(
    @Param('id') skillId: number,
    @AuthUser() user: UserEntity,
  ): Promise<UserSkillDto> {
    return this.skillService.updateToggleSkill(skillId, user.id);
  }

  @Put(':groupId/check')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update tick checkbox for group of skills',
  })
  checkToggleGroupSkills(
    @Param('groupId') groupId: number,
    @AuthUser() user: UserEntity,
  ): Promise<UserSkillDto[]> {
    return this.skillService.updateToggleGroupSkills(groupId, user.id, true);
  }

  @Put(':groupId/uncheck')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update untick checkbox for group of skills',
  })
  uncheckToggleGroupSkills(
    @Param('groupId') groupId: number,
    @AuthUser() user: UserEntity,
  ): Promise<UserSkillDto[]> {
    return this.skillService.updateToggleGroupSkills(groupId, user.id, false);
  }
}
