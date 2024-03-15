import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import type { PageDto } from '../../../../common/dto/page.dto';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminSkillGroupController } from '../../controllers/admin-skill-group.controller';
import type { CreateSkillGroupDto } from '../../dtos/create-skill-group.dto';
import type { SkillGroupDto } from '../../dtos/skill-group.dto';
import type { UpdateSkillGroupDto } from '../../dtos/update-skill-group.dto';
import { SkillGroupService } from '../../services/skill-group.service';
import {
  createSkillGroupDto,
  skillGroupDto,
  skillGroupsPageDto,
  updateSkillGroupDto,
} from '../fakes/skill-group.fake';

describe('AdminSkillGroup', () => {
  let app: INestApplication;
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  let skillGroup: SkillGroupDto;
  let expectedSkillGroupDtos: PageDto<SkillGroupDto>;

  const mockSkillGroupService = {
    getAllSkillGroups: jest.fn(),
    createSkillGroup: jest.fn(),
    updateSkillGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSkillGroupController],
      providers: [
        {
          provide: SkillGroupService,
          useValue: mockSkillGroupService,
        },
      ],
    })
      .overrideGuard(AuthGuard) // mock @AuthUser() decorator
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = adminEntity;

          return req.user;
        },
      })
      .overrideGuard(JwtAuthGuard) // mock @UseGuards(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = adminEntity;

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

    adminDto = UserFake.buildAdminDto();
    adminEntity = UserFake.buildUserEntity(adminDto);
    skillGroup = skillGroupDto;
    expectedSkillGroupDtos = skillGroupsPageDto;

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /admin/skill-groups', () => {
    it('get all skill groups', () => {
      mockSkillGroupService.getAllSkillGroups = jest
        .fn()
        .mockResolvedValue(expectedSkillGroupDtos);

      return request(app.getHttpServer())
        .get('/admin/skill-groups')
        .expect(JSON.stringify(expectedSkillGroupDtos))
        .expect(200);
    });
  });

  describe('POST: /admin/skill-groups', () => {
    it('create skill group', () => {
      mockSkillGroupService.createSkillGroup = jest
        .fn()
        .mockResolvedValue(skillGroup);

      return request(app.getHttpServer())
        .post('/admin/skill-groups')
        .send(createSkillGroupDto)
        .expect(JSON.stringify(skillGroup))
        .expect(200);
    });

    it('create skill group fail because name not a string', () => {
      const createSkillGroup = { name: 123 };

      return request(app.getHttpServer())
        .post('/admin/skill-groups')
        .send(createSkillGroup)
        .expect(
          JSON.stringify({
            message: [`name must be a string`],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });

    it('create skill group fail because name is empty', () => {
      const createSkillGroup: CreateSkillGroupDto = { name: '' };

      return request(app.getHttpServer())
        .post('/admin/skill-groups')
        .send(createSkillGroup)
        .expect(
          JSON.stringify({
            message: [`name should not be empty`],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });

  describe('PUT: /admin/skill-groups/:skillGroupId', () => {
    it('update skill group successfully', () => {
      mockSkillGroupService.updateSkillGroup = jest
        .fn()
        .mockResolvedValue(skillGroup);

      return request(app.getHttpServer())
        .put('/admin/skill-groups/1')
        .send(updateSkillGroupDto)
        .expect(JSON.stringify(skillGroup))
        .expect(200);
    });

    it('update skill group fail because name not a string', () => {
      const updateSkillGroup = { name: 123 };

      return request(app.getHttpServer())
        .put('/admin/skill-groups/1')
        .send(updateSkillGroup)
        .expect(
          JSON.stringify({
            message: [`name must be a string`],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });

    it('update skill group fail because name is empty', () => {
      const updateSkillGroup: UpdateSkillGroupDto = { name: '' };

      return request(app.getHttpServer())
        .put('/admin/skill-groups/1')
        .send(updateSkillGroup)
        .expect(
          JSON.stringify({
            message: [`name should not be empty`],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400);
    });
  });
});
