import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UseLanguageInterceptor } from '../../../interceptors/language-interceptor.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { LevelDto } from '../dtos/level.dto';
import { PositionDto } from '../dtos/position.dto';
import { UpdateCustomPositionDto } from '../dtos/update-custom-position.dto';
import { UpdateIntroductionDto } from '../dtos/update-introduction.dto';
import UserToUpdateDto from '../dtos/update-user.dto';
import { UserDto } from '../dtos/user.dto';
import UserCreationDto from '../dtos/user-creation.dto';
import { UsersPageOptionsDto } from '../dtos/users-page-options.dto';
import { UserEntity } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('/admin/users')
@ApiTags('/admin/users')
@UseGuards(JwtAuthGuard)
export class AdminUserController {
  constructor(
    private userService: UserService,
    private readonly translationService: TranslationService,
  ) {}

  @Get('admin')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @UseLanguageInterceptor()
  async admin(@AuthUser() user: UserEntity) {
    const translation = await this.translationService.translate(
      'admin.keywords.admin',
    );

    return {
      text: `${translation} ${user.firstName}`,
    };
  }

  @Get('find-coaches')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get users by name(fistName, lastName, companyEmail)',
    type: UserDto,
  })
  findUsers(@Query('keyword') keyword: string): Promise<UserDto[]> {
    return this.userService.findUsersByKeyword(keyword);
  }

  @Get()
  @Version('1/metadata')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all users without pagination',
    type: PageDto,
  })
  getUsersWithoutPageDto(): Promise<UserDto[]> {
    return this.userService.getUsersWithoutPageDto();
  }

  @Get()
  @Version('1/external')
  @Auth([RoleType.EXTERNAL_USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all users (external usage)',
    type: PageDto,
  })
  getUsersForExternalSystem(): Promise<UserDto[]> {
    Logger.log(`External user is attempting to get list of users`);

    return this.userService.getUsersWithoutPageDto();
  }

  @Get()
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get profile list',
    type: PageDto,
  })
  getUsers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.getUsers(pageOptionsDto);
  }

  @Get('assistants')
  @Auth([RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get list assistants',
    type: PageDto,
  })
  getListAssistants(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.getListAssistants(pageOptionsDto);
  }

  @Get('positions')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get positions list',
    type: PositionDto,
  })
  getPositions(): Promise<PositionDto[]> {
    return this.userService.findAllPositions();
  }

  @Get('levels')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get levels list',
    type: LevelDto,
  })
  getLevels(): Promise<LevelDto[]> {
    return this.userService.findAllLevels();
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Create new user profile',
    type: UserDto,
  })
  createUser(@Body() user: UserCreationDto): Promise<UserDto> {
    return this.userService.createUser(user);
  }

  @Put(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Update existing user profile',
    type: UserDto,
  })
  updateUser(
    @Param('id') userId: number,
    @Body() user: UserToUpdateDto,
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, user);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get profile details',
    type: UserDto,
  })
  async getUserDetails(@Param('id') userId: number): Promise<UserDto> {
    return this.userService.getUserById(userId);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Deactivate user profile',
    type: UserDto,
  })
  deactivateUser(@Param('id') userId: number): Promise<void> {
    return this.userService.deactivatedUser(userId);
  }

  @Put(':id/introduction')
  @Auth([RoleType.ADMIN])
  @ApiOkResponse({
    description: `Update employee's introduction`,
  })
  async updateIntroduction(
    @Body() updateIntroductionDto: UpdateIntroductionDto,
    @Param('id') userId: number,
  ): Promise<UserDto> {
    return this.userService.updateIntroduction(userId, updateIntroductionDto);
  }

  @Put(':userId/custom-position')
  @Auth([RoleType.ASSISTANT, RoleType.ADMIN])
  @ApiOkResponse({
    description: `Update employee's custom position`,
  })
  async updateCustomPosition(
    @Body() updateCustomPositionDto: UpdateCustomPositionDto,
    @Param('userId') userId: number,
  ): Promise<UserDto> {
    return this.userService.updateCustomPosition(
      userId,
      updateCustomPositionDto,
    );
  }
}
