import type { PageDto } from 'common/dto/page.dto';

import { Order } from '../../../../constants';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { AllowanceDto } from '../../../vacation-balance/dtos/allowance.dto';
import type { UpdateAllowanceDto } from '../../../vacation-balance/dtos/update-allowance.dto';
import type { VacationBalancesPageOptionsDto } from '../../../vacation-balance/dtos/vacation-balances-page-options.dto';

export class VacationBalanceFake {
  static buildAllowanceDto(): AllowanceDto {
    const allowanceDto: AllowanceDto = {
      user: UserFake.buildUserDto(),
      total: 15,
      taken: 5,
      balance: 10,
    };

    return allowanceDto;
  }

  static buildAllowancePageOptionsDto(): VacationBalancesPageOptionsDto {
    const pageOptions: VacationBalancesPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
    };

    return pageOptions;
  }

  static buildAllowancePageDto(): PageDto<AllowanceDto> {
    const allowanceDtos: PageDto<AllowanceDto> = {
      data: [VacationBalanceFake.buildAllowanceDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return allowanceDtos;
  }

  static buildUpdateAllowanceDto(): UpdateAllowanceDto {
    const updateAllowanceDto: UpdateAllowanceDto = {
      userId: 1,
      total: 15,
    };

    return updateAllowanceDto;
  }
}
