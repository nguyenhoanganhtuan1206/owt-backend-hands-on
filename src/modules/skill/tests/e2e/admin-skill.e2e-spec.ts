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

import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { AuthUserInterceptor } from '../../../../interceptors/auth-user-interceptor.service';
import { SkillGroupService } from '../../../skill-group/services/skill-group.service';
import { skillGroupsPageDto } from '../../../skill-group/tests/fakes/skill-group.fake';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminSkillController } from '../../controllers/admin-skill.controller';
import { SkillService } from '../../services/skill.service';
import {
  createSkillDto,
  skillDto,
  skillsPageDto,
  updateMySkillDto,
  updateSkillDto,
  userSkillDto,
} from '../fakes/skill.fake';

describe('AdminSkill', () => {
  let app: INestApplication;
  let adminDto: UserDto;
  let adminEntity: UserEntity;
  const userSkill = userSkillDto;
  const userSkills = [userSkill];
  const skillGroupDtos = skillGroupsPageDto;
  const mockSkillService = {
    getAllSkills: jest.fn(),
    getSkillsByUserId: jest.fn(),
    updateSkills: jest.fn(),
    updateToggleSkill: jest.fn(),
    updateToggleGroupSkills: jest.fn(),
    createSkill: jest.fn(),
    updateSkill: jest.fn(),
  };
  const mockSkillGroupService = {
    searchSkills: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSkillController],
      providers: [
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
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
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('GET: /admin/skills', () => {
    it('get all skills successfully', () => {
      mockSkillService.getAllSkills = jest
        .fn()
        .mockResolvedValue(skillsPageDto);

      return request(app.getHttpServer())
        .get('/admin/skills')
        .expect(JSON.stringify(skillsPageDto))
        .expect(200);
    });
  });

  describe('GET: /admin/skills/search', () => {
    it('Search skills of the current user successfully', () => {
      mockSkillGroupService.searchSkills = jest
        .fn()
        .mockResolvedValue(skillGroupDtos);

      return request(app.getHttpServer())
        .get('/admin/skills/search?name=something')
        .expect(JSON.stringify(skillGroupDtos))
        .expect(200);
    });
  });

  describe('GET: /admin/skills/:userId', () => {
    it('Admin get list of skills by user id', () => {
      mockSkillService.getSkillsByUserId = jest
        .fn()
        .mockResolvedValue(skillGroupsPageDto);

      return request(app.getHttpServer())
        .get('/admin/skills/1')
        .expect(JSON.stringify(skillGroupsPageDto))
        .expect(200);
    });
  });

  describe('GET: /admin/skills/:groupId/:userId', () => {
    it('Admin update skills by group id and user id successfully', () => {
      mockSkillService.updateSkills = jest.fn().mockResolvedValue(userSkills);

      return request(app.getHttpServer())
        .put('/admin/skills/1/1')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkills))
        .expect(200);
    });

    it('Admin update skills by group id and user id fail because validating dto', () =>
      request(app.getHttpServer())
        .put('/admin/skills/1/1')
        .expect(
          JSON.stringify({
            message: ['skills should not be empty', 'skills must be an array'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400));
  });

  describe('POST: /admin/skills', () => {
    it('Create skill successfully', () => {
      mockSkillService.createSkill = jest.fn().mockResolvedValue(userSkills);

      return request(app.getHttpServer())
        .post('/admin/skills')
        .send(createSkillDto)
        .expect(JSON.stringify(userSkills))
        .expect(200);
    });

    it('Create skill fail because validating dto', () =>
      request(app.getHttpServer())
        .post('/admin/skills')
        .expect(
          JSON.stringify({
            message: [
              'groupId must be a number conforming to the specified constraints',
              'groupId should not be empty',
              'name must be a string',
              'name should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400));
  });

  describe('PUT: /admin/skills/:skillId', () => {
    it('Update skill by id successfully', () => {
      mockSkillService.updateSkill = jest.fn().mockResolvedValue(skillDto);

      return request(app.getHttpServer())
        .put('/admin/skills/1')
        .send(updateSkillDto)
        .expect(JSON.stringify(skillDto))
        .expect(200);
    });

    it('Update skill by id fail because validating dto', () =>
      request(app.getHttpServer())
        .put('/admin/skills/1')
        .expect(
          JSON.stringify({
            message: [
              'groupId must be a number conforming to the specified constraints',
              'groupId should not be empty',
              'name must be a string',
              'name should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400));
  });

  describe('PUT: /admin/skills/:userId/:skillId/toggle', () => {
    it('Update tick/untick checkbox for skill by user id and skill id successfully', () => {
      mockSkillService.updateToggleSkill = jest
        .fn()
        .mockResolvedValue(userSkill);

      return request(app.getHttpServer())
        .put('/admin/skills/1/1/toggle')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkill))
        .expect(200);
    });
  });

  describe('PUT: /admin/skills/:userId/:groupId/check', () => {
    it('Admin update tick checkbox for group of skills successfully', () => {
      mockSkillService.updateToggleGroupSkills = jest
        .fn()
        .mockResolvedValue(userSkill);

      return request(app.getHttpServer())
        .put('/admin/skills/1/1/check')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkill))
        .expect(200);
    });
  });

  describe('PUT: /admin/skills/:userId/:groupId/uncheck', () => {
    it('Admin update untick checkbox for group of skills', () => {
      mockSkillService.updateToggleGroupSkills = jest
        .fn()
        .mockResolvedValue(userSkill);

      return request(app.getHttpServer())
        .put('/admin/skills/1/1/uncheck')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkill))
        .expect(200);
    });
  });
});
