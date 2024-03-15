/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import * as paginate from '../../../../common/dto/paginate-item';
import { ErrorCode, InvalidNotFoundException } from '../../../../exceptions';
import { TimeOffRequestService } from '../../../time-off-request/services/time-off-request.service';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { VacationBalanceService } from '../../services/vacation-balance.service';
import { VacationBalanceFake } from '../fakes/vacation-balance.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('VacationBalanceService', () => {
  let vacationBalanceService: VacationBalanceService;

  const user = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(user);
  const userEntities = [userEntity];
  const allowanceDto = VacationBalanceFake.buildAllowanceDto();
  const allowanceDtos = [allowanceDto];

  const mockUserService = {
    findUserById: jest.fn(),
    getVacationBalanceQueryBuilder: jest.fn(),
    save: jest.fn(),
  };

  const mockTimeOffRequestService = {
    calculateAllowanceUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacationBalanceService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
        },
      ],
    }).compile();

    vacationBalanceService = module.get<VacationBalanceService>(
      VacationBalanceService,
    );
  });

  describe('getAllVacationBalances', () => {
    const pageOptions = VacationBalanceFake.buildAllowancePageOptionsDto();
    const allowancePageDto = VacationBalanceFake.buildAllowancePageDto();

    it('should return all vacation balances', async () => {
      jest
        .spyOn(mockUserService, 'getVacationBalanceQueryBuilder')
        .mockImplementation(
          () =>
            ({
              getMany: jest.fn().mockResolvedValue(userEntities),
            }) as never,
        );
      jest
        .spyOn(mockTimeOffRequestService, 'calculateAllowanceUser')
        .mockImplementation(() => Promise.resolve(allowanceDto));
      jest.spyOn(paginate, 'paginateItems').mockReturnValueOnce(allowanceDtos);

      const result =
        await vacationBalanceService.getAllVacationBalances(pageOptions);

      expect(result.data[0].user).toEqual(allowancePageDto.data[0].user);
      expect(result.data[0].total).toEqual(allowancePageDto.data[0].total);
      expect(result.data[0].taken).toEqual(allowancePageDto.data[0].taken);
      expect(result.data[0].balance).toEqual(allowancePageDto.data[0].balance);

      expect(mockUserService.getVacationBalanceQueryBuilder).toBeCalled();
      expect(mockTimeOffRequestService.calculateAllowanceUser).toBeCalled();
      expect(paginate.paginateItems).toBeCalled();
    });
  });

  describe('updateTotalAllowances', () => {
    const updateAllowance = VacationBalanceFake.buildUpdateAllowanceDto();

    it('should update total allowance for the user by admin', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockImplementation(() => Promise.resolve(userEntity));
      jest
        .spyOn(mockUserService, 'save')
        .mockImplementation(() => Promise.resolve(userEntity));

      const result =
        await vacationBalanceService.updateTotalAllowances(updateAllowance);

      expect(result.user).toEqual(allowanceDto.user);
      expect(result.total).toEqual(allowanceDto.total);
      expect(result.taken).toEqual(allowanceDto.taken);
      expect(result.balance).toEqual(allowanceDto.balance);

      expect(mockUserService.findUserById).toBeCalledWith(userEntity.id);
      expect(mockUserService.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(mockUserService, 'findUserById').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
      });

      await expect(
        vacationBalanceService.updateTotalAllowances(updateAllowance),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockUserService.findUserById).toBeCalledWith(userEntity.id);
    });
  });
});
