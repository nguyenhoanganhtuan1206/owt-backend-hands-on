import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { UserDto } from 'modules/user/dtos/user.dto';
import type { UserEntity } from 'modules/user/entities/user.entity';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { TimeOffCollaboratorController } from '../../controllers/time-off-collaborator.controller';
import { TimeOffCollaboratorService } from '../../services/time-off-collaborator.service';
import { TimeOffCollaboratorFake } from '../fakes/time-off-collaborator.fake';

describe('TimeOffCollaborator', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;

  const mockTimeOffCollaboratorService = {
    getTimeOffRequests: jest.fn(),
    getAllCollaborators: jest.fn(),
    getTimeOffRequestDetails: jest.fn(),
    createTimeOffRequest: jest.fn(),
    deleteTimeOffRequest: jest.fn(),
  };

  const mockAwsS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOffCollaboratorController],
      providers: [
        {
          provide: TimeOffCollaboratorService,
          useValue: mockTimeOffCollaboratorService,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // mock @UseGuards(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = userEntity;

          return req.user;
        },
      })
      .overrideGuard(RolesGuard) // mock @Auth() (should be @Role([...]))
      .useValue({
        canActivate: () => true,
      })
      .overrideInterceptor(AuthUserInterceptor)
      .useValue({
        intercept(context: ExecutionContext, next: CallHandler) {
          return next.handle();
        },
      })
      .compile();
    userDto = UserFake.buildUserDto();
    userEntity = UserFake.buildUserEntity(userDto);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /time-off-requests/collaborators', () => {
    const pageOptionsDto =
      TimeOffCollaboratorFake.buildTimeOffCollaboratorPageOptionsDto();
    const timeOffCollaboratorDtos =
      TimeOffCollaboratorFake.buildTimeOffCollaboratorPageDto();

    it('Get list collaborators of current user login', () => {
      mockTimeOffCollaboratorService.getAllCollaborators = jest
        .fn()
        .mockResolvedValueOnce(timeOffCollaboratorDtos);

      return request(app.getHttpServer())
        .get('/time-off-requests/collaborators')
        .send(pageOptionsDto)
        .expect(JSON.stringify(timeOffCollaboratorDtos))
        .expect(200);
    });
  });
});
