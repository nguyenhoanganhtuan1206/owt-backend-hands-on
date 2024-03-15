import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  RoleType,
  USER_AVATAR_FOLDER,
  USER_CV_FOLDER,
} from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { IFile } from '../../../interfaces';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import {
  validateDocument,
  validateImage,
} from '../../../validators/file.validator';
import { PasswordDto } from '../dtos/password.dto';
import { UpdateCustomPositionDto } from '../dtos/update-custom-position.dto';
import { UpdateIntroductionDto } from '../dtos/update-introduction.dto';
import UpdateProfileDto from '../dtos/update-profile.dto';
import { UserDto } from '../dtos/user.dto';
import { UserEntity } from '../entities/user.entity';
import { CvService } from '../services/cv.service';
import { UserService } from '../services/user.service';

@Controller('profile')
@ApiTags('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private s3Service: AwsS3Service,
    private readonly cvService: CvService,
  ) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User get profile',
    type: UserDto,
  })
  async getUser(@AuthUser() user: UserEntity): Promise<UserDto> {
    return this.userService.getUserById(user.id);
  }

  @Put()
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'User update profile',
    type: UserDto,
  })
  updateProfile(
    @AuthUser() user: UserEntity,
    @Body() profileUpdate: UpdateProfileDto,
  ): Promise<UserDto> {
    return this.userService.updateProfile(user.id, profileUpdate);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    description: 'User update avatar',
    type: String,
  })
  async updateAvatar(
    @AuthUser() user: UserEntity,
    @UploadedFile() file: IFile,
  ) {
    validateImage(file);

    const s3Path = await this.s3Service.uploadFile(
      file,
      USER_AVATAR_FOLDER,
      user.id,
    );

    await this.userService.updateUserPhoto(user.id, s3Path);

    return { s3Path };
  }

  @Post('cv')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    description: 'User update cv',
    type: String,
  })
  async updateCv(@AuthUser() user: UserEntity, @UploadedFile() file: IFile) {
    validateDocument(file);

    const s3Path = await this.s3Service.uploadFile(
      file,
      USER_CV_FOLDER,
      user.id,
    );

    await this.cvService.updateUserCv(user.id, s3Path);

    return { s3Path };
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User change password',
  })
  async changePassword(
    @AuthUser() user: UserEntity,
    @Body() passwordDto: PasswordDto,
  ): Promise<void> {
    return this.userService.changePassword(user.id, passwordDto);
  }

  @Put('introduction')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiOkResponse({
    description: 'User upsert introduction',
  })
  async updateIntroduction(
    @AuthUser() user: UserEntity,
    @Body() updateIntroductionDto: UpdateIntroductionDto,
  ): Promise<UserDto> {
    return this.userService.updateIntroduction(user.id, updateIntroductionDto);
  }

  @Put('custom-position')
  @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
  @ApiOkResponse({
    description: 'User update custom position',
  })
  async updateCustomPosition(
    @AuthUser() user: UserEntity,
    @Body() updateCustomPositionDto: UpdateCustomPositionDto,
  ): Promise<UserDto> {
    return this.userService.updateCustomPosition(
      user.id,
      updateCustomPositionDto,
    );
  }
}
