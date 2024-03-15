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
import { MySkillController } from '../../controllers/my-skill.controller';
import { SkillService } from '../../services/skill.service';
import { updateMySkillDto, userSkillDto } from '../fakes/skill.fake';

describe('MySkill', () => {
  let app: INestApplication;
  let userDto: UserDto;
  let userEntity: UserEntity;
  const userSkill = userSkillDto;
  const userSkills = [userSkill];
  const skillGroupDtos = skillGroupsPageDto;
  const mockSkillService = {
    getSkillsByUserId: jest.fn(),
    updateSkills: jest.fn(),
    updateToggleSkill: jest.fn(),
    updateToggleGroupSkills: jest.fn(),
  };
  const mockSkillGroupService = {
    searchSkills: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MySkillController],
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
          req.user = userEntity;

          return req.user;
        },
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

  describe('GET: /my-skills', () => {
    it('get list skills of the current user successfully', () => {
      mockSkillService.getSkillsByUserId = jest
        .fn()
        .mockResolvedValue(skillGroupDtos);

      return request(app.getHttpServer())
        .get('/my-skills')
        .expect(JSON.stringify(skillGroupDtos))
        .expect(200);
    });
  });

  describe('GET: /my-skills/search', () => {
    it('Search list skills of the current user successfully', () => {
      mockSkillGroupService.searchSkills = jest
        .fn()
        .mockResolvedValue(skillGroupDtos);

      return request(app.getHttpServer())
        .get('/my-skills/search?name=something')
        .expect(JSON.stringify(skillGroupDtos))
        .expect(200);
    });
  });

  describe('PUT: /my-skills/:groupId', () => {
    it('Update skills of user by groupId successfully', () => {
      mockSkillService.updateSkills = jest.fn().mockResolvedValue(userSkills);

      return request(app.getHttpServer())
        .put('/my-skills/1')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkills))
        .expect(200);
    });

    it('Update skills of user by groupId fail because validating dto', () =>
      request(app.getHttpServer())
        .put('/my-skills/1')
        .expect(
          JSON.stringify({
            message: ['skills should not be empty', 'skills must be an array'],
            error: 'Bad Request',
            statusCode: 400,
          }),
        )
        .expect(400));
  });

  describe('PUT: /my-skills/:skillId/toggle', () => {
    it('Update tick/untick checkbox for my skill by skill id successfully', () => {
      mockSkillService.updateToggleSkill = jest
        .fn()
        .mockResolvedValue(userSkill);

      return request(app.getHttpServer())
        .put('/my-skills/1/toggle')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkill))
        .expect(200);
    });
  });

  describe('PUT: /my-skills/:groupId/check', () => {
    it('Update tick checkbox for group of skills id successfully', () => {
      mockSkillService.updateToggleGroupSkills = jest
        .fn()
        .mockResolvedValue(userSkill);

      return request(app.getHttpServer())
        .put('/my-skills/1/check')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkill))
        .expect(200);
    });
  });

  describe('PUT: /my-skills/:groupId/uncheck', () => {
    it('Update tick uncheckbox for group of skills successfully', () => {
      mockSkillService.updateToggleGroupSkills = jest
        .fn()
        .mockResolvedValue(userSkill);

      return request(app.getHttpServer())
        .put('/my-skills/1/uncheck')
        .send(updateMySkillDto)
        .expect(JSON.stringify(userSkill))
        .expect(200);
    });
  });
});
