/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as utils from '../../../../common/utils';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { UpdatePositionDto } from '../../dtos/update-position.dto';
import { EducationEntity } from '../../entities/education.entity';
import EducationMapper from '../../mappers/education.mapper';
import { EducationService } from '../../services/education.service';
import { EducationFake } from '../fakes/education.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('EducationService', () => {
  let educationService: EducationService;
  let educationRepository: Repository<EducationEntity>;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const educationDto = EducationFake.buildEducationDto();
  const educationEntity = EducationFake.buildEducationEntity(educationDto);
  const educations = [educationEntity];

  const mockEducationMapper = {
    updateEntity: jest.fn(),
    toEducationEntity: jest.fn(),
    toEducationEntityFromId: jest.fn(),
  };

  const mockUserService = {
    findUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EducationService,
        {
          provide: EducationMapper,
          useValue: mockEducationMapper,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(EducationEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    educationService = module.get<EducationService>(EducationService);
    educationRepository = module.get<Repository<EducationEntity>>(
      getRepositoryToken(EducationEntity),
    );
  });

  describe('getEducationsByUserId', () => {
    it('should return all all my educations', async () => {
      jest.spyOn(educationRepository, 'find').mockResolvedValueOnce(educations);

      const result = await educationService.getEducationsByUserId(
        userEntity.id,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].position).toEqual(educations[0].position);

      expect(educationRepository.find).toBeCalled();
    });
  });

  describe('createEducation', () => {
    const createEducation = EducationFake.buildCreateEducationDto();

    it('should create my education', async () => {
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(mockEducationMapper, 'toEducationEntity')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(educationRepository, 'find').mockResolvedValueOnce(educations);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educations[0]);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educationEntity);

      const result = await educationService.createEducation(
        userEntity.id,
        createEducation,
      );

      expect(result.id).toEqual(educationDto.id);
      expect(result.institution).toEqual(educationDto.institution);
      expect(result.degree).toEqual(educationDto.degree);
      expect(result.position).toEqual(educationDto.position);

      expect(utils.validateYearRange).toBeCalled();
      expect(mockEducationMapper.toEducationEntity).toBeCalled();
      expect(educationRepository.find).toBeCalled();
      expect(educationRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if year outside the allowed range', async () => {
      jest.spyOn(utils, 'validateYearRange').mockImplementationOnce(() => {
        throw new BadRequestException();
      });

      await expect(
        educationService.createEducation(userEntity.id, createEducation),
      ).rejects.toThrow(BadRequestException);

      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw InvalidBadRequestException if date to before date from', async () => {
      const educationCreateError = EducationFake.buildCreateEducationDto();
      educationCreateError.dateTo = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      educationCreateError.dateFrom = tomorrow;

      jest.spyOn(utils, 'validateYearRange');

      await expect(
        educationService.createEducation(userEntity.id, educationCreateError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(mockEducationMapper, 'toEducationEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        educationService.createEducation(userEntity.id, createEducation),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(utils.validateYearRange).toBeCalled();
      expect(mockEducationMapper.toEducationEntity).toBeCalled();
    });
  });

  describe('updateToggleEducation', () => {
    it('should update selected for my education by id', async () => {
      jest
        .spyOn(mockEducationMapper, 'toEducationEntityFromId')
        .mockResolvedValueOnce(educationEntity);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educationEntity);

      const result = await educationService.updateToggleEducation(
        educationEntity.id,
      );

      expect(result.id).toEqual(educationDto.id);
      expect(result.isSelected).toEqual(educationDto.isSelected);

      expect(mockEducationMapper.toEducationEntityFromId).toBeCalled();
      expect(educationRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if education not found', async () => {
      jest
        .spyOn(mockEducationMapper, 'toEducationEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.EDUCATION_NOT_FOUND);
        });

      await expect(
        educationService.updateToggleEducation(educationEntity.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockEducationMapper.toEducationEntityFromId).toBeCalled();
    });
  });

  describe('updateEducationPositions', () => {
    const updatePositions = [EducationFake.buildUpdatePositionDto()];

    it('should update positions of my educations', async () => {
      jest.spyOn(educationRepository, 'find').mockResolvedValueOnce(educations);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educations[0]);

      const result = await educationService.updateEducationPositions(
        userEntity.id,
        updatePositions,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].position).toEqual(educations[0].position);

      expect(educationRepository.find).toBeCalled();
      expect(educationRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if duplicate position in request', async () => {
      const updatePositionsError = [
        EducationFake.buildUpdatePositionDto(),
        EducationFake.buildUpdatePositionDto(),
      ];
      jest.spyOn(educationRepository, 'find').mockResolvedValueOnce(educations);

      await expect(
        educationService.updateEducationPositions(
          userEntity.id,
          updatePositionsError,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(educationRepository.find).toBeCalled();
    });

    it('should throw BadRequestException if user in request not found', async () => {
      const updateEducation = {
        ...EducationFake.buildUpdatePositionDto(),
        educationId: 2,
      } as UpdatePositionDto;
      const updatePositionsError = [updateEducation];

      jest.spyOn(educationRepository, 'find').mockResolvedValueOnce(educations);

      await expect(
        educationService.updateEducationPositions(
          userEntity.id,
          updatePositionsError,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(educationRepository.find).toBeCalled();
    });
  });

  describe('updateEducations', () => {
    const updateEducations = [EducationFake.buildUpdateEducationDto()];

    it('should update a list of my educations', async () => {
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(educationRepository, 'findOne')
        .mockResolvedValueOnce(educationEntity);
      jest
        .spyOn(mockEducationMapper, 'updateEntity')
        .mockResolvedValueOnce(educationEntity);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educationEntity);

      const result = await educationService.updateEducations(
        userEntity,
        updateEducations,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].position).toEqual(educations[0].position);

      expect(utils.validateYearRange).toBeCalled();
      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
      expect(mockEducationMapper.updateEntity).toBeCalled();
      expect(educationRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if year outside the allowed range', async () => {
      jest.spyOn(utils, 'validateYearRange').mockImplementationOnce(() => {
        throw new BadRequestException();
      });

      await expect(
        educationService.updateEducations(userEntity, updateEducations),
      ).rejects.toThrow(BadRequestException);

      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw InvalidBadRequestException if date to before date from', async () => {
      const educationUpdateError = EducationFake.buildUpdateEducationDto();
      const tomorrow = new Date();

      educationUpdateError.dateTo = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      educationUpdateError.dateFrom = tomorrow;

      const updateEducationsError = [educationUpdateError];

      jest.spyOn(utils, 'validateYearRange');

      await expect(
        educationService.updateEducations(userEntity, updateEducationsError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw NotFoundException if education not found', async () => {
      jest.spyOn(utils, 'validateYearRange');
      jest.spyOn(educationRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        educationService.updateEducations(userEntity, updateEducations),
      ).rejects.toThrow(NotFoundException);

      expect(utils.validateYearRange).toBeCalled();
      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
    });
  });

  describe('deleteEducation', () => {
    it('should delete education', async () => {
      jest
        .spyOn(educationRepository, 'findOne')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(educationRepository, 'remove').mockImplementation(jest.fn());
      jest.spyOn(educationRepository, 'find').mockResolvedValueOnce(educations);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educations[0]);

      await educationService.deleteEducation(userEntity, educationEntity.id);

      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
      expect(educationRepository.remove).toBeCalled();
      expect(educationRepository.find).toBeCalled();
      expect(educationRepository.save).toBeCalled();
    });

    it('should throw NotFoundException if education not found', async () => {
      jest.spyOn(educationRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        educationService.deleteEducation(userEntity, educationEntity.id),
      ).rejects.toThrow(NotFoundException);

      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
    });
  });

  describe('updateEmployeeEducations', () => {
    const updateEducations = [EducationFake.buildUpdateEducationDto()];

    it('should update a list of employee educations', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(utils, 'validateYearRange');
      jest
        .spyOn(educationRepository, 'findOne')
        .mockResolvedValueOnce(educationEntity);
      jest
        .spyOn(mockEducationMapper, 'updateEntity')
        .mockResolvedValueOnce(educationEntity);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educationEntity);

      const result = await educationService.updateEmployeeEducations(
        userEntity.id,
        updateEducations,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);

      expect(mockUserService.findUserById).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
      expect(mockEducationMapper.updateEntity).toBeCalled();
      expect(educationRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(mockUserService, 'findUserById').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
      });

      await expect(
        educationService.updateEmployeeEducations(
          userEntity.id,
          updateEducations,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockUserService.findUserById).toBeCalled();
    });

    it('should throw BadRequestException if year outside the allowed range', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(utils, 'validateYearRange').mockImplementationOnce(() => {
        throw new BadRequestException();
      });

      await expect(
        educationService.updateEmployeeEducations(
          userEntity.id,
          updateEducations,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockUserService.findUserById).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw InvalidBadRequestException if date to before date from', async () => {
      const educationUpdateError = EducationFake.buildUpdateEducationDto();
      const tomorrow = new Date();

      educationUpdateError.dateTo = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      educationUpdateError.dateFrom = tomorrow;

      const updateEducationsError = [educationUpdateError];

      jest
        .spyOn(mockUserService, 'findUserById')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(utils, 'validateYearRange');

      await expect(
        educationService.updateEmployeeEducations(
          userEntity.id,
          updateEducationsError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockUserService.findUserById).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
    });

    it('should throw NotFoundException if education not found', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(utils, 'validateYearRange');
      jest.spyOn(educationRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        educationService.updateEmployeeEducations(
          userEntity.id,
          updateEducations,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockUserService.findUserById).toBeCalled();
      expect(utils.validateYearRange).toBeCalled();
      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
    });
  });

  describe('deleteEmployeeEducation', () => {
    it('should delete employee education', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockResolvedValueOnce(educationEntity);
      jest
        .spyOn(educationRepository, 'findOne')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(educationRepository, 'remove').mockImplementation(jest.fn());
      jest.spyOn(educationRepository, 'find').mockResolvedValueOnce(educations);
      jest
        .spyOn(educationRepository, 'save')
        .mockResolvedValueOnce(educations[0]);

      await educationService.deleteEmployeeEducation(
        userEntity.id,
        educationEntity.id,
      );

      expect(mockUserService.findUserById).toBeCalled();
      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
      expect(educationRepository.remove).toBeCalled();
      expect(educationRepository.find).toBeCalled();
      expect(educationRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(mockUserService, 'findUserById').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
      });

      await expect(
        educationService.deleteEmployeeEducation(
          userEntity.id,
          educationEntity.id,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockUserService.findUserById).toBeCalled();
    });

    it('should throw NotFoundException if education not found', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockResolvedValueOnce(educationEntity);
      jest.spyOn(educationRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        educationService.deleteEmployeeEducation(
          userEntity.id,
          educationEntity.id,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockUserService.findUserById).toBeCalled();
      expect(educationRepository.findOne).toBeCalledWith({
        where: {
          id: userEntity.id,
          user: {
            id: educationEntity.id,
          },
        },
      });
    });
  });
});
