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
import { AdminCertificationController } from '../../controllers/admin-certification.controller';
import type { CertificationDto } from '../../dtos/certification.dto';
import { CertificationService } from '../../services/certification.service';
import { CertificationFake } from '../fakes/certification.fake';

describe('AdminCertification', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  let certification: CertificationDto;
  let certifications: CertificationDto[];

  const mockCertificationService = {
    getCertificationsByUserId: jest.fn(),
    createCertification: jest.fn(),
    updateCertificationPositions: jest.fn(),
    updateToggleCertification: jest.fn(),
    updateCertifications: jest.fn(),
    deleteCertification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCertificationController],
      providers: [
        {
          provide: CertificationService,
          useValue: mockCertificationService,
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
    certification = CertificationFake.buildCertificationDto();
    certifications = [certification];

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /admin/certifications/:userId', () => {
    it('Get all certifications of employee', () => {
      mockCertificationService.getCertificationsByUserId = jest
        .fn()
        .mockResolvedValueOnce(certifications);

      return request(app.getHttpServer())
        .get('/admin/certifications/1')
        .expect(JSON.stringify(certifications))
        .expect(200);
    });
  });

  describe('POST: /admin/certifications/:userId', () => {
    it('Create certification for employee', () => {
      const createCertification =
        CertificationFake.buildCreateCertificationDto();

      mockCertificationService.createCertification = jest
        .fn()
        .mockResolvedValueOnce(certification);

      return request(app.getHttpServer())
        .post('/admin/certifications/1')
        .send(createCertification)
        .expect(JSON.stringify(certification))
        .expect(200);
    });

    it('Create certification for employee fail because validating', () => {
      const invalidCreateCertification = {
        ...CertificationFake.buildCreateCertificationDto(),
        name: undefined,
        issuingOrganisation: undefined,
        issueDate: '',
        expirationDate: '',
        credentialId: 1,
        credentialUrl: 1,
      };

      return request(app.getHttpServer())
        .post('/admin/certifications/1')
        .send(invalidCreateCertification)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'name must be less than 256 characters',
              'name must be a string',
              'name should not be empty',
              'issuingOrganisation must be less than 256 characters',
              'issuingOrganisation must be a string',
              'issuingOrganisation should not be empty',
              'issueDate must be a valid ISO 8601 date string',
              'expirationDate must be a valid ISO 8601 date string',
              'credentialId must be less than 256 characters',
              'credentialId must be a string',
              'credentialUrl must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/certifications/:userId/positions', () => {
    it('Update positions certifications of employee', () => {
      const updatePositionDtos = [
        CertificationFake.buildUpdateCertificationPositionDto(),
      ];

      mockCertificationService.updateCertificationPositions = jest
        .fn()
        .mockResolvedValueOnce(certifications);

      return request(app.getHttpServer())
        .put('/admin/certifications/1/positions')
        .send(updatePositionDtos)
        .expect(JSON.stringify(certifications))
        .expect(200);
    });

    it('Update positions certifications of employee fail because validating', () => {
      const invalidUpdatePositionDtos = [
        {
          ...CertificationFake.buildUpdateCertificationPositionDto(),
          certificationId: null,
          position: null,
        },
      ];

      return request(app.getHttpServer())
        .put('/admin/certifications/1/positions')
        .send(invalidUpdatePositionDtos)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'certificationId must be an integer number',
              'certificationId should not be empty',
              'position must be an integer number',
              'position should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('PUT: /admin/certifications/:userId/:id/toggle', () => {
    it(`Update tick/untick checkbox for employee's certifications by id`, () => {
      mockCertificationService.updateToggleCertification = jest
        .fn()
        .mockResolvedValueOnce(certification);

      return request(app.getHttpServer())
        .put('/admin/certifications/1/1/toggle')
        .expect(JSON.stringify(certification))
        .expect(200);
    });
  });

  describe('PUT: /admin/certifications/:userId', () => {
    it(`Update a list of employee's certifications`, () => {
      const updateCertificationDtos = [
        CertificationFake.buildUpdateCertificationDto(),
      ];

      mockCertificationService.updateCertifications = jest
        .fn()
        .mockResolvedValueOnce(certifications);

      return request(app.getHttpServer())
        .put('/admin/certifications/1')
        .send(updateCertificationDtos)
        .expect(JSON.stringify(certifications))
        .expect(200);
    });

    it(`Update a list of employee's certifications fail because validating`, () => {
      const invalidUpdateCertificationDtos = [
        {
          ...CertificationFake.buildUpdateCertificationDto(),
          id: '1',
          name: null,
          issuingOrganisation: null,
          issueDate: '',
          expirationDate: '',
          credentialId: 1,
          credentialUrl: 1,
        },
      ];

      return request(app.getHttpServer())
        .put('/admin/certifications/1')
        .send(invalidUpdateCertificationDtos)
        .expect(400)
        .expect(
          JSON.stringify({
            message: [
              'id must be an integer number',
              'name must be less than 256 characters',
              'name must be a string',
              'name should not be empty',
              'issuingOrganisation must be less than 256 characters',
              'issuingOrganisation must be a string',
              'issuingOrganisation should not be empty',
              'issueDate must be a valid ISO 8601 date string',
              'expirationDate must be a valid ISO 8601 date string',
              'credentialId must be less than 256 characters',
              'credentialId must be a string',
              'credentialUrl must be a string',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
    });
  });

  describe('DELETE: /admin/certifications/:userId/:id', () => {
    it('Delete certification', () =>
      request(app.getHttpServer())
        .delete('/admin/certifications/1/1')
        .expect(200));
  });
});
