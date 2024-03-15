import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import _ from 'lodash';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RoleType, TokenType } from '../../constants';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { PermissionEntity } from '../user/entities/permission.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ApiConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.publicKey,
    });
  }

  async validate(args: {
    userId: number;
    roles: RoleType[];
    type: TokenType;
  }): Promise<UserEntity> {
    if (args.type !== TokenType.ACCESS_TOKEN) {
      throw new UnauthorizedException();
    }

    if (args.userId === 0) {
      return this.buildExternalUser(args.userId, args.roles);
    }

    const user = await this.userService.findOne({
      id: args.userId,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const userRoles = new Set(
      user.permissions.map((permission) => permission.role),
    );
    const hasRole = _.isEqual([...userRoles], args.roles);

    if (!hasRole) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private buildExternalUser(id: number, roles: RoleType[]): UserEntity {
    const externalUser = new UserEntity();
    const externalPermission = new PermissionEntity();

    externalPermission.user = externalUser;

    if (roles.length === 1 && roles[0] === RoleType.EXTERNAL_USER) {
      externalPermission.role = roles[0];
    }

    externalUser.id = id;
    externalUser.permissions = [externalPermission];

    return externalUser;
  }
}
