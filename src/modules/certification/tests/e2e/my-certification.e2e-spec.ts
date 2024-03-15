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
import { MyCertificationController } from '../../controllers/my-certification.controller';
import type { CertificationDto } from '../../dtos/certification.dto';
import { CertificationService } from '../../services/certification.service';
import { CertificationFake } from '../fakes/certification.fake';

describe('MyCertification', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  let certification: CertificationDto;
  let certifications: CertificationDto[];

  const mockCertificationService = {
    getCertificationsByUserId: jest.fn(),
    createCertification: jest.fn(),
    updateToggleCertification: jest.fn(),
    updateCertificationPositions: jest.fn(),
    updateCertifications: jest.fn(),
    deleteCertification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyCertificationController],
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

  describe('GET: /my-certifications', () => {
    it('Get all my certifications', () => {
      mockCertificationService.getCertificationsByUserId = jest
        .fn()
        .mockResolvedValueOnce(certifications);

      return request(app.getHttpServer())
        .get('/my-certifications')
        .expect(JSON.stringify(certifications))
        .expect(200);
    });
  });

  describe('POST: /my-certifications', () => {
    it('Create my certification', () => {
      const createCertification =
        CertificationFake.buildCreateCertificationDto();

      mockCertificationService.createCertification = jest
        .fn()
        .mockResolvedValueOnce(certification);

      return request(app.getHttpServer())
        .post('/my-certifications')
        .send(createCertification)
        .expect(JSON.stringify(certification))
        .expect(200);
    });

    it('Create my certification fail because validating', () => {
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
        .post('/my-certifications')
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

  describe('PUT: /my-certifications/:id/toggle', () => {
    it('Update tick/untick checkbox for my certification by id', () => {
      mockCertificationService.updateToggleCertification = jest
        .fn()
        .mockResolvedValueOnce(certification);

      return request(app.getHttpServer())
        .put('/my-certifications/1/toggle')
        .expect(JSON.stringify(certification))
        .expect(200);
    });
  });

  describe('PUT: /my-certifications/positions', () => {
    it('Update positions of my certifications', () => {
      const updatePositionDtos = [
        CertificationFake.buildUpdateCertificationPositionDto(),
      ];

      mockCertificationService.updateCertificationPositions = jest
        .fn()
        .mockResolvedValueOnce(certifications);

      return request(app.getHttpServer())
        .put('/my-certifications/positions')
        .send(updatePositionDtos)
        .expect(JSON.stringify(certifications))
        .expect(200);
    });

    it('Update positions of my certifications because validating', () => {
      const invalidUpdatePositionDtos = [
        {
          ...CertificationFake.buildUpdateCertificationPositionDto(),
          certificationId: null,
          position: null,
        },
      ];

      return request(app.getHttpServer())
        .put('/my-certifications/positions')
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

  describe('PUT: /my-certifications', () => {
    it('Update a list of my certifications', () => {
      const updateCertificationDtos = [
        CertificationFake.buildUpdateCertificationDto(),
      ];

      mockCertificationService.updateCertifications = jest
        .fn()
        .mockResolvedValueOnce(certifications);

      return request(app.getHttpServer())
        .put('/my-certifications')
        .send(updateCertificationDtos)
        .expect(JSON.stringify(certifications))
        .expect(200);
    });

    it('Update a list of my certifications fail because validating', () => {
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
        .put('/my-certifications')
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

  describe('DELETE: /my-certifications/:id', () => {
    it('Delete certification', () =>
      request(app.getHttpServer()).delete('/my-certifications/1').expect(200));
  });
});
