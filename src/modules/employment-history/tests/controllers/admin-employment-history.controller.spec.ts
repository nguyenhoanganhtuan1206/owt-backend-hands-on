import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminEmploymentHistoryController } from '../../controllers/admin-employment-history.controller';
import { EmploymentHistoryService } from '../../services/employment-history.service';
import { EmploymentHistoryFake } from '../fakes/employment-history.fake';

describe('AdminEmploymentHistoryController', () => {
  let adminEmploymentHistoryController: AdminEmploymentHistoryController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const employmentHistory =
    EmploymentHistoryFake.buildEmploymentHistoryEntity(userEntity);
  const employmentHistoryDto = EmploymentHistoryFake.buildEmploymentHistoryDto(
    userLogin,
    employmentHistory.id,
  );
  const employmentHistories = [employmentHistoryDto];

  const mockEmploymentHistoryService = {
    getEmploymentHistoryByUserId: jest.fn(),
    createEmploymentHistory: jest.fn(),
    updateToggleEmploymentHistory: jest.fn(),
    deleteEmploymentHistory: jest.fn(),
    updateEmploymentHistoriesPositions: jest.fn(),
    updateEmploymentHistories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminEmploymentHistoryController],
      providers: [
        {
          provide: EmploymentHistoryService,
          useValue: mockEmploymentHistoryService,
        },
      ],
    }).compile();

    adminEmploymentHistoryController =
      module.get<AdminEmploymentHistoryController>(
        AdminEmploymentHistoryController,
      );
  });

  describe('getEmploymentHistories', () => {
    it('should return list employment history of employee', async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'getEmploymentHistoryByUserId')
        .mockReturnValueOnce(employmentHistories);

      const result =
        await adminEmploymentHistoryController.getEmploymentHistories(
          userEntity.id,
        );

      expect(result).toEqual(employmentHistories);

      expect(
        mockEmploymentHistoryService.getEmploymentHistoryByUserId,
      ).toBeCalled();
    });
  });

  describe('createEmployeeEmploymentHistory', () => {
    const createEmploymentHistoryDto =
      EmploymentHistoryFake.buildCreateEmploymentHistoryDto();

    it('should create employment history for employee', async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'createEmploymentHistory')
        .mockReturnValueOnce(employmentHistoryDto);

      const result =
        await adminEmploymentHistoryController.createEmployeeEmploymentHistory(
          userEntity.id,
          createEmploymentHistoryDto,
        );

      expect(result).toEqual(employmentHistoryDto);

      expect(mockEmploymentHistoryService.createEmploymentHistory).toBeCalled();
    });
  });

  describe('updateToggleEmploymentHistory', () => {
    it(`should update selected for employee's employment history by id`, async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'updateToggleEmploymentHistory')
        .mockReturnValueOnce(employmentHistoryDto);

      const result =
        await adminEmploymentHistoryController.updateToggleEmploymentHistory(
          employmentHistoryDto.id,
        );

      expect(result).toEqual(employmentHistoryDto);

      expect(
        mockEmploymentHistoryService.updateToggleEmploymentHistory,
      ).toBeCalledWith(employmentHistoryDto.id);
    });
  });

  describe('updateEmployeeEmploymentHistoriesPositions', () => {
    const updatePositions = [
      EmploymentHistoryFake.buildUpdateEmploymentHistoryPositionDto(
        employmentHistory.id,
      ),
    ];

    it('should update positions employment histories of employee', async () => {
      jest
        .spyOn(
          mockEmploymentHistoryService,
          'updateEmploymentHistoriesPositions',
        )
        .mockReturnValueOnce(employmentHistories);

      const result =
        await adminEmploymentHistoryController.updateEmployeeEmploymentHistoriesPositions(
          userEntity.id,
          updatePositions,
        );

      expect(result).toEqual(employmentHistories);

      expect(
        mockEmploymentHistoryService.updateEmploymentHistoriesPositions,
      ).toBeCalled();
    });
  });

  describe('updateEmploymentHistories', () => {
    const updateEmploymentHistories = [
      EmploymentHistoryFake.buildUpdateEmploymentHistoryDto(
        employmentHistory.id,
      ),
    ];

    it('should update employee is employment histories', async () => {
      jest
        .spyOn(mockEmploymentHistoryService, 'updateEmploymentHistories')
        .mockReturnValueOnce(employmentHistories);

      const result =
        await adminEmploymentHistoryController.updateEmploymentHistories(
          userEntity.id,
          updateEmploymentHistories,
        );

      expect(result).toEqual(employmentHistories);

      expect(
        mockEmploymentHistoryService.updateEmploymentHistories,
      ).toBeCalled();
    });
  });

  describe('deleteEmploymentHistory', () => {
    it('should delete employment history by id', async () => {
      jest.spyOn(mockEmploymentHistoryService, 'deleteEmploymentHistory');

      await adminEmploymentHistoryController.deleteEmploymentHistory(
        userEntity.id,
        employmentHistoryDto.id,
      );

      expect(
        mockEmploymentHistoryService.deleteEmploymentHistory,
      ).toBeCalledWith(userEntity.id, employmentHistoryDto.id);
    });
  });
});
