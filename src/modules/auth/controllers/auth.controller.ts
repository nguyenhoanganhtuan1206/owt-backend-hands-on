import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    UseGuards,
    Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserDto } from '../../user/dtos/user.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { ForgotPassswordDto } from '../dto/ForgotPasswordDto';
import { LoginPayloadDto } from '../dto/LoginPayloadDto';
import { TokenPayloadDto } from '../dto/TokenPayloadDto';
import { UserLoginDto } from '../dto/UserLoginDto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
    ) { }

    @Post('admin/login')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: 'Admin info with access token',
    })
    async adminLogin(
        @Body() userLoginDto: UserLoginDto,
    ): Promise<LoginPayloadDto> {
        const userEntity = await this.authService.validateAdmin(userLoginDto);
        const userRoles = userEntity.permissions.map(
            (permission) => permission.role,
        );
        const token = await this.authService.createAccessToken({
            roles: userRoles,
            userId: userEntity.id,
        });

        const userDto = userEntity.toDto();

        return new LoginPayloadDto(userDto, token);
    }

    @Get('test')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    testing(): string {
        return 'Testing';
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: 'User info with access token',
    })
    async userLogin(
        @Body() userLoginDto: UserLoginDto,
    ): Promise<LoginPayloadDto> {
        const userEntity = await this.authService.validateUser(userLoginDto);
        const userRoles = userEntity.permissions.map(
            (permission) => permission.role,
        );
        const token = await this.authService.createAccessToken({
            roles: userRoles,
            userId: userEntity.id,
        });

        const userDto = userEntity.toDto();

        return new LoginPayloadDto(userDto, token);
    }

    @Post('generate-access-token')
    @Version('1/external')
    @Auth([RoleType.ADMIN])
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Generate access token for external user',
        type: TokenPayloadDto,
    })
    generateAccessTokenForExternalUser(): Promise<TokenPayloadDto> {
        return this.authService.createExternalUserAccessToken({
            userId: 0,
        });
    }

    @Version('1')
    @Get('me')
    @HttpCode(HttpStatus.OK)
    @Auth([RoleType.USER, RoleType.ADMIN, RoleType.ASSISTANT])
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ type: UserDto, description: 'current user info' })
    getCurrentUser(@AuthUser() user: UserEntity): UserDto {
        return user.toDto();
    }

    @Put('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Request forgot password',
    })
    forgotPassword(@Body() forgotPassword: ForgotPassswordDto): Promise<void> {
        return this.userService.forgotPassword(forgotPassword.email);
    }
}