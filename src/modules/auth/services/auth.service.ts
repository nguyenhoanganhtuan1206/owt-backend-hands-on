import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type SignOptions } from 'jsonwebtoken';

import { validateHash, validateUserEndDate } from '../../../common/utils';
import { RoleType, TokenType } from '../../../constants';
import { InvalidBadRequestException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import type { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { TokenPayloadDto } from '../dto/TokenPayloadDto';
import { UserAuthenticationTokenDto } from '../dto/UserAuthenticationTokenDto';
import type { UserLoginDto } from '../dto/UserLoginDto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private userService: UserService,
  ) {}

  async createAccessToken(data: {
    roles: RoleType[];
    userId: number;
  }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.authConfig.jwtExpirationTime,
      accessToken: await this.jwtService.signAsync({
        userId: data.userId,
        type: TokenType.ACCESS_TOKEN,
        roles: data.roles,
      }),
    });
  }

  async createExternalUserAccessToken(data: {
    userId: number;
  }): Promise<TokenPayloadDto> {
    const expiresIn = Number.MAX_VALUE;
    const signOptions: SignOptions = {
      expiresIn,
    };

    return new TokenPayloadDto({
      expiresIn,
      accessToken: await this.jwtService.signAsync(
        {
          userId: data.userId,
          type: TokenType.ACCESS_TOKEN,
          role: RoleType.EXTERNAL_USER,
        },
        signOptions,
      ),
    });
  }

  async createExternalUserAccessTokenToPM(data: {
    timeOffRequestId: number;
  }): Promise<TokenPayloadDto> {
    const expiresIn = this.configService.authConfig.jwtConfirmExpirationTime;
    const signOptions: SignOptions = {
      expiresIn,
    };

    return new TokenPayloadDto({
      expiresIn,
      accessToken: await this.jwtService.signAsync(
        {
          timeOffRequestId: data.timeOffRequestId,
          type: TokenType.ACCESS_TOKEN,
          role: RoleType.EXTERNAL_USER,
        },
        signOptions,
      ),
    });
  }

  async validateAdmin(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userService.findOne({
      companyEmail: userLoginDto.email,
    });

    await this.validatePassword(userLoginDto, user);

    if (!user) {
      throw new InvalidBadRequestException(ErrorCode.USERNAME_PASSWORD_INVALID);
    }

    if (!this.hasAdminOrAssistantRole(user)) {
      throw new ForbiddenException('Invalid user');
    }

    validateUserEndDate(user.endDate);

    return user;
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userService.findOne({
      companyEmail: userLoginDto.email,
    });

    if (!user) {
      throw new InvalidBadRequestException(ErrorCode.USERNAME_PASSWORD_INVALID);
    }

    validateUserEndDate(user.endDate);

    await this.validatePassword(userLoginDto, user);

    return user;
  }

  decodeToken(token: string): UserAuthenticationTokenDto | null {
    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.authConfig.privateKey,
      });

      if (
        !decodedToken ||
        typeof decodedToken !== 'object' ||
        typeof decodedToken.type !== 'string' ||
        typeof decodedToken.role !== 'string' ||
        typeof decodedToken.timeOffRequestId !== 'number'
      ) {
        return null;
      }

      return new UserAuthenticationTokenDto({
        type: decodedToken.type as TokenType,
        role: decodedToken.role as RoleType,
        timeOffRequestId: decodedToken.timeOffRequestId as number,
      });
    } catch {
      throw new UnauthorizedException('Token has expired');
    }
  }

  private async validatePassword(
    userLoginDto: UserLoginDto,
    userEntity: UserEntity | null,
  ): Promise<void> {
    const isPasswordValid = await validateHash(
      userLoginDto.password,
      userEntity?.password,
    );

    if (!isPasswordValid) {
      throw new InvalidBadRequestException(ErrorCode.USERNAME_PASSWORD_INVALID);
    }
  }

  private hasAdminOrAssistantRole(user: UserEntity): boolean {
    return user.permissions.some(
      (permission) =>
        permission.role === RoleType.ADMIN ||
        permission.role === RoleType.ASSISTANT,
    );
  }
}
