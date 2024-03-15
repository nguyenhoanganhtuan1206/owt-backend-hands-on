import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyEducationController } from '../../controllers/my-education.controller';
import { EducationService } from '../../services/education.service';
import { EducationFake } from '../fakes/education.fake';

describe('MyEducationController', () => {
  let myEducationController: MyEducationController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const educationDto = EducationFake.buildEducationDto();
  const educations = [educationDto];

  const mockEducationService = {
    getEducationsByUserId: jest.fn(),
    createEducation: jest.fn(),
    updateToggleEducation: jest.fn(),
    updateEducationPositions: jest.fn(),
    updateEducations: jest.fn(),
    deleteEducation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyEducationController],
      providers: [
        {
          provide: EducationService,
          useValue: mockEducationService,
        },
      ],
    }).compile();

    myEducationController = module.get<MyEducationController>(
      MyEducationController,
    );
  });

  describe('getMyEducations', () => {
    it('should return all my educations', async () => {
      jest
        .spyOn(mockEducationService, 'getEducationsByUserId')
        .mockReturnValueOnce(educations);

      const result = await myEducationController.getMyEducations(userEntity);

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].user).toEqual(educations[0].user);
      expect(result[0].position).toEqual(educations[0].position);

      expect(mockEducationService.getEducationsByUserId).toBeCalled();
    });
  });

  describe('createMyEducation', () => {
    const createEducation = EducationFake.buildCreateEducationDto();

    it('should create my education', async () => {
      jest
        .spyOn(mockEducationService, 'createEducation')
        .mockReturnValueOnce(educationDto);

      const result = await myEducationController.createMyEducation(
        userEntity,
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
    it('should update selected for my education by id', async () => {
      jest
        .spyOn(mockEducationService, 'updateToggleEducation')
        .mockReturnValueOnce(educationDto);

      const result = await myEducationController.updateToggleEducation(
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

  describe('updateMyEducationPositions', () => {
    const updatePositions = [EducationFake.buildUpdatePositionDto()];

    it('should update positions of my educations', async () => {
      jest
        .spyOn(mockEducationService, 'updateEducationPositions')
        .mockReturnValueOnce(educations);

      const result = await myEducationController.updateMyEducationPositions(
        userEntity,
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

  describe('updateEducation', () => {
    const updateEducations = [EducationFake.buildUpdateEducationDto()];

    it('should update a list of my educations', async () => {
      jest
        .spyOn(mockEducationService, 'updateEducations')
        .mockReturnValueOnce(educations);

      const result = await myEducationController.updateEducation(
        userEntity,
        updateEducations,
      );

      expect(result[0].id).toEqual(educations[0].id);
      expect(result[0].institution).toEqual(educations[0].institution);
      expect(result[0].degree).toEqual(educations[0].degree);
      expect(result[0].user).toEqual(educations[0].user);
      expect(result[0].position).toEqual(educations[0].position);

      expect(mockEducationService.updateEducations).toBeCalled();
    });
  });

  describe('deleteEducation', () => {
    it('should delete my education by id', async () => {
      jest.spyOn(mockEducationService, 'deleteEducation');

      await myEducationController.deleteEducation(userEntity, educationDto.id);

      expect(mockEducationService.deleteEducation).toBeCalledWith(
        userEntity,
        educationDto.id,
      );
    });
  });
});
