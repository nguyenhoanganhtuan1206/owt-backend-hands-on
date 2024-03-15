import { RoleType, TokenType } from '../../../../constants';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { ForgotPassswordDto } from '../../dto/ForgotPasswordDto';
import type { LoginPayloadDto } from '../../dto/LoginPayloadDto';
import type { TokenPayloadDto } from '../../dto/TokenPayloadDto';
import type { UserAuthenticationTokenDto } from '../../dto/UserAuthenticationTokenDto';
import type { UserLoginDto } from '../../dto/UserLoginDto';

export class AuthFake {
  static buildUserLoginDto(): UserLoginDto {
    const user: UserLoginDto = {
      email: 'test@example.com',
      password: 'testpassword',
    };

    return user;
  }

  static buildForgotPasswordDto(): ForgotPassswordDto {
    const forgotPasswordDto: ForgotPassswordDto = {
      email: 'test@example.com',
    };

    return forgotPasswordDto;
  }

  static buildTokenPayloadDto(): TokenPayloadDto {
    const tokenPayloadDto: TokenPayloadDto = {
      expiresIn: 3600,
      accessToken: 'fakeAccessToken',
    };

    return tokenPayloadDto;
  }

  static buildLoginPayloadDto(): LoginPayloadDto {
    const loginPayloadDto: LoginPayloadDto = {
      user: UserFake.buildUserDto(),
      token: this.buildTokenPayloadDto(),
    };

    return loginPayloadDto;
  }

  static buildUserAuthenticationTokenDto(): UserAuthenticationTokenDto {
    const userAuthenticationTokenDto: UserAuthenticationTokenDto = {
      type: TokenType.ACCESS_TOKEN,
      role: RoleType.ADMIN,
      timeOffRequestId: 1,
    };

    return userAuthenticationTokenDto;
  }

  static buildCreateUserDto() {
    return {
      firstName: 'User',
      lastName: 'Test',
      gender: 'MALE',
      companyEmail: 'usertest01@gmail.com',
      contractType: 'FULLTIME',
      positionId: 3,
      levelId: 3,
      startDate: '2023-10-25',
    };
  }
}
