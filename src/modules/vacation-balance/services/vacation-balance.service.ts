import { Injectable } from '@nestjs/common';

import { PageDto } from '../../../common/dto/page.dto';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { paginateItems } from '../../../common/dto/paginate-item';
import { Order } from '../../../constants';
import { TimeOffRequestService } from '../../time-off-request/services/time-off-request.service';
import type { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { AllowanceDto } from '../dtos/allowance.dto';
import type { UpdateAllowanceDto } from '../dtos/update-allowance.dto';
import type { VacationBalancesPageOptionsDto } from '../dtos/vacation-balances-page-options.dto';

@Injectable()
export class VacationBalanceService {
  constructor(
    private readonly userService: UserService,
    private readonly timeOffRequestService: TimeOffRequestService,
  ) {}

  async getAllVacationBalances(
    pageOptionsDto: VacationBalancesPageOptionsDto,
  ): Promise<PageDto<AllowanceDto>> {
    const queryBuilder =
      this.userService.getVacationBalanceQueryBuilder(pageOptionsDto);

    const items = await queryBuilder.getMany();

    let allowances = await this.calculateAllowances(items);

    allowances = this.sortAllowances(allowances, pageOptionsDto);

    const { page, take } = pageOptionsDto;

    const paginatedItems = paginateItems(allowances, page, take);

    const pageMeta = new PageMetaDto({
      pageOptionsDto,
      itemCount: allowances.length,
    });

    return new PageDto<AllowanceDto>(paginatedItems, pageMeta);
  }

  private async calculateAllowances(
    items: UserEntity[],
  ): Promise<AllowanceDto[]> {
    const allowancePromises = items.map(async (userEntity) => {
      const allowance =
        await this.timeOffRequestService.calculateAllowanceUser(userEntity);

      const allowanceDto = new AllowanceDto(allowance.total);

      allowanceDto.user = userEntity.toDto();
      allowanceDto.taken = allowance.taken;
      allowanceDto.balance = allowance.balance;

      return allowanceDto;
    });

    return Promise.all(allowancePromises);
  }

  private sortAllowances(
    allowances: AllowanceDto[],
    { sortColumn, orderBy }: VacationBalancesPageOptionsDto,
  ): AllowanceDto[] {
    return allowances.sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      return orderBy === Order.ASC ? valueA - valueB : valueB - valueA;
    });
  }

  async updateTotalAllowances(
    updateAllowanceDto: UpdateAllowanceDto,
  ): Promise<AllowanceDto> {
    const userEntity = await this.userService.findUserById(
      updateAllowanceDto.userId,
    );

    userEntity.yearlyAllowance = updateAllowanceDto.total;

    const newUserEntity = await this.userService.save(userEntity);

    return this.createAllowanceDto(newUserEntity);
  }

  private async createAllowanceDto(
    userEntity: UserEntity,
  ): Promise<AllowanceDto> {
    const allowance =
      await this.timeOffRequestService.calculateAllowanceUser(userEntity);
    const allowanceDto = new AllowanceDto(allowance.total);

    allowanceDto.user = userEntity.toDto();
    allowanceDto.taken = allowance.taken;
    allowanceDto.balance = allowance.balance;

    return allowanceDto;
  }
}
