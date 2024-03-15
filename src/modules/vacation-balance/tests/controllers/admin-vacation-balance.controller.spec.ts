import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { TimeOffRequestService } from '../../../time-off-request/services/time-off-request.service';
import { TimeOffRequestFake } from '../../../time-off-request/tests/fakes/time-off-request.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminVacationBalanceController } from '../../controllers/admin-vacation-balance.controller';
import { VacationBalanceService } from '../../services/vacation-balance.service';
import { VacationBalanceFake } from '../fakes/vacation-balance.fake';

describe('AdminVacationBalanceController', () => {
  let adminVacationBalanceController: AdminVacationBalanceController;

  const user = UserFake.buildUserDto();
  const allowanceDto = VacationBalanceFake.buildAllowanceDto();

  const mockVacationBalanceService = {
    getAllVacationBalances: jest.fn(),
    updateTotalAllowances: jest.fn(),
  };

  const mockTimeOffRequestService = {
    getTimeOffRequests: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminVacationBalanceController],
      providers: [
        {
          provide: VacationBalanceService,
          useValue: mockVacationBalanceService,
        },
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
        },
      ],
    }).compile();

    adminVacationBalanceController = module.get<AdminVacationBalanceController>(
      AdminVacationBalanceController,
    );
  });

  describe('getVacationBalances', () => {
    const pageOptions = VacationBalanceFake.buildAllowancePageOptionsDto();
    const allowancePageDto = VacationBalanceFake.buildAllowancePageDto();

    it('should return all vacation balances', async () => {
      jest
        .spyOn(mockVacationBalanceService, 'getAllVacationBalances')
        .mockReturnValueOnce(allowancePageDto);

      const result =
        await adminVacationBalanceController.getVacationBalances(pageOptions);

      expect(result.data[0].user).toEqual(allowancePageDto.data[0].user);
      expect(result.data[0].total).toEqual(allowancePageDto.data[0].total);
      expect(result.data[0].taken).toEqual(allowancePageDto.data[0].taken);
      expect(result.data[0].balance).toEqual(allowancePageDto.data[0].balance);

      expect(mockVacationBalanceService.getAllVacationBalances).toBeCalled();
    });
  });

  describe('getTimeOffRequests', () => {
    const pageOptions = TimeOffRequestFake.buildTimeOffRequestsPageOptionsDto();
    const timeOffRequestPageDto =
      TimeOffRequestFake.buildTimeOffRequestPageDto();

    it('should return list time-off requests by userId', async () => {
      jest
        .spyOn(mockTimeOffRequestService, 'getTimeOffRequests')
        .mockReturnValueOnce(timeOffRequestPageDto);

      const result = await adminVacationBalanceController.getTimeOffRequests(
        user.id,
        pageOptions,
      );

      expect(result.data[0].user).toEqual(timeOffRequestPageDto.data[0].user);
      expect(result.data[0].dateType).toEqual(
        timeOffRequestPageDto.data[0].dateType,
      );
      expect(result.data[0].totalDays).toEqual(
        timeOffRequestPageDto.data[0].totalDays,
      );
      expect(result.data[0].details).toEqual(
        timeOffRequestPageDto.data[0].details,
      );

      expect(mockTimeOffRequestService.getTimeOffRequests).toBeCalled();
    });
  });

  describe('updateTotalAllowances', () => {
    const updateAllowance = VacationBalanceFake.buildUpdateAllowanceDto();

    it('should return list time-off requests by userId', async () => {
      jest
        .spyOn(mockVacationBalanceService, 'updateTotalAllowances')
        .mockReturnValueOnce(allowanceDto);

      const result =
        await adminVacationBalanceController.updateTotalAllowances(
          updateAllowance,
        );

      expect(result.user).toEqual(allowanceDto.user);
      expect(result.total).toEqual(allowanceDto.total);
      expect(result.taken).toEqual(allowanceDto.taken);
      expect(result.balance).toEqual(allowanceDto.balance);

      expect(mockVacationBalanceService.updateTotalAllowances).toBeCalled();
    });
  });
});
