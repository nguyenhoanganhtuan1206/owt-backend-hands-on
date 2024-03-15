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
import httpMocks from 'node-mocks-http';
import request from 'supertest';

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminCvController } from '../../controllers/admin-cv.controller';
import { CvService } from '../../services/cv.service';

describe('AdminCv', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;

  const fileResponse = {
    file: Buffer.from('abc'),
    filename: 'abc.pdf',
  };

  const mockCvService = {
    exportCv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCvController],
      providers: [
        {
          provide: CvService,
          useValue: mockCvService,
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

  describe('GET /admin/cvs/:userId/export-pdf', () => {
    it('Export employee cv with pdf type successfully', async () => {
      const res = httpMocks.createResponse();
      mockCvService.exportCv = jest.fn().mockResolvedValueOnce(fileResponse);

      const actual = await request(app.getHttpServer())
        .get('/admin/cvs/1/export-pdf')
        .send(res)
        .expect(200);

      expect(actual.header['content-type']).toEqual('application/pdf');
      expect(actual.header['content-disposition']).toEqual(
        `attachment; filename=${fileResponse.filename}`,
      );
    });
  });
});
