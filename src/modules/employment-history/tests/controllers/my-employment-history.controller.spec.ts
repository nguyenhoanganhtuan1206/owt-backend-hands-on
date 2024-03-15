import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyEmploymentHistoryController } from '../../controllers/my-employment-history.controller';
import { EmploymentHistoryService } from '../../services/employment-history.service';
import { EmploymentHistoryFake } from '../fakes/employment-history.fake';

describe('MyEmploymentHistoryController', () => {
  let myEmploymentHistoryController: MyEmploymentHistoryController;

  const userDto = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userDto);
  const employmentHistory =
    EmploymentHistoryFake.buildEmploymentHistoryEntity(userEntity);

  const mockEmploymentHistoryService = {
    getEmploymentHistoryByUserId: jest.fn(),
    createEmploymentHistory: jest.fn(),
    deleteEmploymentHistory: jest.fn(),
    updateEmploymentHistoriesPositions: jest.fn(),
    updateToggleEmploymentHistory: jest.fn(),
    updateEmploymentHistories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyEmploymentHistoryController],
      providers: [
        {
          provide: EmploymentHistoryService,
          useValue: mockEmploymentHistoryService,
        },
      ],
    }).compile();

    myEmploymentHistoryController = module.get<MyEmploymentHistoryController>(
      MyEmploymentHistoryController,
    );
  });

  describe('getMyEmploymentHistories', () => {
    it('should return list of my employment histories successfully', async () => {
      mockEmploymentHistoryService.getEmploymentHistoryByUserId = jest
        .fn()
        .mockResolvedValue([employmentHistory]);

      const result =
        await myEmploymentHistoryController.getMyEmploymentHistories(
          userEntity,
        );

      expect(result).toEqual([employmentHistory]);
    });
  });

  describe('createEmploymentHistory', () => {
    it('should create my employment history successfully', async () => {
      mockEmploymentHistoryService.createEmploymentHistory = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      const createEmploymentHistoryDto =
        EmploymentHistoryFake.buildCreateEmploymentHistoryDto();

      const result =
        await myEmploymentHistoryController.createEmploymentHistory(
          userEntity,
          createEmploymentHistoryDto,
        );

      expect(result).toEqual(employmentHistory);
    });
  });

  describe('deleteEmploymentHistory', () => {
    it('should delete my employment history successfully', async () => {
      mockEmploymentHistoryService.deleteEmploymentHistory = jest.fn();

      await myEmploymentHistoryController.deleteEmploymentHistory(
        userEntity,
        employmentHistory.id,
      );

      expect(mockEmploymentHistoryService.deleteEmploymentHistory).toBeCalled();
    });
  });

  describe('updateMyEmploymentHistoriesPositions', () => {
    it('should update position of my employment history successfully', async () => {
      mockEmploymentHistoryService.updateEmploymentHistoriesPositions = jest
        .fn()
        .mockResolvedValue([employmentHistory]);

      const updateEmploymentHistoryPositionDto =
        EmploymentHistoryFake.buildUpdateEmploymentHistoryPositionDto(
          employmentHistory.id,
        );

      const result =
        await myEmploymentHistoryController.updateMyEmploymentHistoriesPositions(
          userEntity,
          [updateEmploymentHistoryPositionDto],
        );

      expect(result).toEqual([employmentHistory]);
    });
  });

  describe('updateToggleEmploymentHistory', () => {
    it('should update tick/untick checkbox of my employment history successfully', async () => {
      mockEmploymentHistoryService.updateToggleEmploymentHistory = jest
        .fn()
        .mockResolvedValue(employmentHistory);

      const result =
        await myEmploymentHistoryController.updateToggleEmploymentHistory(
          employmentHistory.id,
        );

      expect(result).toEqual(employmentHistory);
    });
  });

  describe('updateEmploymentHistories', () => {
    it('should update my employment histories successfully', async () => {
      mockEmploymentHistoryService.updateEmploymentHistories = jest
        .fn()
        .mockResolvedValue([employmentHistory]);

      const updateEmploymentHistoryDto =
        EmploymentHistoryFake.buildUpdateEmploymentHistoryDto(
          employmentHistory.id,
        );

      const result =
        await myEmploymentHistoryController.updateEmploymentHistories(
          userEntity,
          [updateEmploymentHistoryDto],
        );

      expect(result).toEqual([employmentHistory]);
    });
  });
});
