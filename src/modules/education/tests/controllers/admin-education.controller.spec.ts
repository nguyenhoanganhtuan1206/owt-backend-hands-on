import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminEducationController } from '../../controllers/admin-education.controller';
import { EducationService } from '../../services/education.service';
import { EducationFake } from '../fakes/education.fake';

describe('AdminEducationController', () => {
  let adminEducationController: AdminEducationController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const educationDto = EducationFake.buildEducationDto();
  const educations = [educationDto];

  const mockEducationService = {
    getEducationsByUserId: jest.fn(),
    createEducation: jest.fn(),
    updateToggleEducation: jest.fn(),
    updateEducationPositions: jest.fn(),
    updateEmployeeEducations: jest.fn(),
    deleteEmployeeEducation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminEducationController],
      providers: [
        {
          provide: EducationService,
          useValue: mockEducationService,
        },
      ],
    }).compile();

    adminEducationController = module.get<AdminEducationController>(
      AdminEducationController,
    );
  });

  describe('getEmployeeEducations', () => {
    it('should return all employee educations', async () => {
      jest
        .spyOn(mockEducationService, 'getEducationsByUserId')
        .mockReturnValueOnce(educations);

      const result = await adminEducationController.getEmployeeEducations(
        userEntity.id,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].user).toEqual(educations[0].user);
      expect(result[0].position).toEqual(educations[0].position);

      expect(mockEducationService.getEducationsByUserId).toBeCalled();
    });
  });

  describe('createEmployeeEducation', () => {
    const createEducation = EducationFake.buildCreateEducationDto();

    it('should create employee education', async () => {
      jest
        .spyOn(mockEducationService, 'createEducation')
        .mockReturnValueOnce(educationDto);

      const result = await adminEducationController.createEmployeeEducation(
        userEntity.id,
        createEducation,
      );

      expect(result.id).toEqual(educationDto.id);
      expect(result.institution).toEqual(educationDto.institution);
      expect(result.degree).toEqual(educationDto.degree);
      expect(result.user).toEqual(educationDto.user);
      expect(result.position).toEqual(educationDto.position);

      expect(mockEducationService.createEducation).toBeCalled();
    });
  });

  describe('updateToggleEducation', () => {
    it(`should update selected for employee's education by id`, async () => {
      jest
        .spyOn(mockEducationService, 'updateToggleEducation')
        .mockReturnValueOnce(educationDto);

      const result = await adminEducationController.updateToggleEducation(
        educationDto.id,
      );

      expect(result.id).toEqual(educationDto.id);
      expect(result.institution).toEqual(educationDto.institution);
      expect(result.degree).toEqual(educationDto.degree);
      expect(result.user).toEqual(educationDto.user);
      expect(result.position).toEqual(educationDto.position);

      expect(mockEducationService.updateToggleEducation).toBeCalledWith(
        educationDto.id,
      );
    });
  });

  describe('updateEducationPositions', () => {
    const updatePositions = [EducationFake.buildUpdatePositionDto()];

    it('should update positions of employee educations', async () => {
      jest
        .spyOn(mockEducationService, 'updateEducationPositions')
        .mockReturnValueOnce(educations);

      const result = await adminEducationController.updateEducationPositions(
        userEntity.id,
        updatePositions,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].user).toEqual(educations[0].user);
      expect(result[0].position).toEqual(educations[0].position);

      expect(mockEducationService.updateEducationPositions).toBeCalled();
    });
  });

  describe('updateEmployeeEducations', () => {
    const updateEducations = [EducationFake.buildUpdateEducationDto()];

    it(`should update a list of employee's educations`, async () => {
      jest
        .spyOn(mockEducationService, 'updateEmployeeEducations')
        .mockReturnValueOnce(educations);

      const result = await adminEducationController.updateEmployeeEducations(
        updateEducations,
        userEntity.id,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].user).toEqual(educations[0].user);
      expect(result[0].position).toEqual(educations[0].position);

      expect(mockEducationService.updateEmployeeEducations).toBeCalled();
    });
  });

  describe('deleteEmployeeEducation', () => {
    it('should delete employee education by id', async () => {
      jest.spyOn(mockEducationService, 'deleteEmployeeEducation');

      await adminEducationController.deleteEmployeeEducation(
        educationDto.id,
        userEntity.id,
      );

      expect(mockEducationService.deleteEmployeeEducation).toBeCalledWith(
        educationDto.id,
        userEntity.id,
      );
    });
  });
});
