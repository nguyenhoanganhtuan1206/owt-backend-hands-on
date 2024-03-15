import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminTimeOffCollaboratorController } from '../../controllers/admin-time-off-collaborator.controller';
import { TimeOffCollaboratorService } from '../../services/time-off-collaborator.service';
import { TimeOffCollaboratorFake } from '../fakes/time-off-collaborator.fake';

describe('AdminTimeOffCollaborator', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;

  const mockTimeCollaboratorService = {
    getAllTimeOffRequests: jest.fn(),
    getAllCollaborators: jest.fn(),
    approveTimeOffRequestByPM: jest.fn(),
    refuseTimeOffRequestByPM: jest.fn(),
    getTimeOffRequestDetailsByPM: jest.fn(),
    getTimeOffRequestDetails: jest.fn(),
    sendEmailToPM: jest.fn(),
    sendEmailToAssistant: jest.fn(),
    approveTimeOffRequestByAdminOrAssistant: jest.fn(),
    refuseTimeOffRequestByAdminOrAssistant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTimeOffCollaboratorController],
      providers: [
        {
          provide: TimeOffCollaboratorService,
          useValue: mockTimeCollaboratorService,
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

  describe('GET: /admin/time-off-requests/collaborators', () => {
    const pageOptionsDto =
      TimeOffCollaboratorFake.buildTimeOffCollaboratorPageOptionsDto();
    const timeOffCollaboratorDtos =
      TimeOffCollaboratorFake.buildTimeOffCollaboratorPageDto();

    it('Get list collaborators of employee', () => {
      mockTimeCollaboratorService.getAllCollaborators = jest
        .fn()
        .mockResolvedValueOnce(timeOffCollaboratorDtos);

      return request(app.getHttpServer())
        .get('/admin/time-off-requests/collaborators')
        .send(pageOptionsDto)
        .expect(JSON.stringify(timeOffCollaboratorDtos))
        .expect(200);
    });
  });
});
