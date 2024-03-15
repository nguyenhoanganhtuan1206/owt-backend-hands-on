import { Injectable } from '@nestjs/common';
import { addDays, isAfter, startOfDay } from 'date-fns';

import { PageDto } from '../../../common/dto/page.dto';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { paginateItems } from '../../../common/dto/paginate-item';
import type { UserEntity } from '../../../modules/user/entities/user.entity';
import { DateProvider } from '../../../providers';
import { TimeOffRequestService } from '../../time-off-request/services/time-off-request.service';
import { UserService } from '../../user/services/user.service';
import { WfhRequestService } from '../../wfh-request/services/wfh-request.service';
import { OtherUserDto } from '../dtos/other-user.dto';
import type { OtherUsersPageOptionsDto } from '../dtos/other-users-page-options.dto';
import { TotalRequestDto } from '../dtos/total-request.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly timeOffRequestService: TimeOffRequestService,
    private readonly wfhRequestService: WfhRequestService,
    private readonly userService: UserService,
  ) {}

  async findTotalRequestsAllUsers(): Promise<TotalRequestDto> {
    const [leaveRequestCount, wfhRequestCount] = await Promise.all([
      this.timeOffRequestService.getPendingTimeOffRequestsCount(),
      this.wfhRequestService.getPendingWfhRequestsCount(),
    ]);

    const totalRequestDto = new TotalRequestDto();
    totalRequestDto.timeOffRequests = leaveRequestCount;
    totalRequestDto.wfhRequests = wfhRequestCount;

    return totalRequestDto;
  }

  async findTotalRequestsForUser(user: UserEntity): Promise<TotalRequestDto> {
    const [leaveRequestCount, wfhRequestCount] = await Promise.all([
      this.timeOffRequestService.getPendingTimeOffRequestsCountForUser(user.id),
      this.wfhRequestService.getPendingWfhRequestsCountForUser(user.id),
    ]);

    const totalRequestDto = new TotalRequestDto();
    totalRequestDto.timeOffRequests = leaveRequestCount;
    totalRequestDto.wfhRequests = wfhRequestCount;

    return totalRequestDto;
  }

  async getOtherUsers(
    pageOptionsDto: OtherUsersPageOptionsDto,
  ): Promise<PageDto<OtherUserDto>> {
    const { page, take } = pageOptionsDto;

    const queryBuilder = this.userService.getUserQueryBuilder(pageOptionsDto);

    const users = await queryBuilder.getMany();

    const otherUserDtos = await this.getOtherUsersInDateRange(
      pageOptionsDto,
      users,
    );

    const paginatedItems = paginateItems(otherUserDtos, page, take);

    const pageMeta = new PageMetaDto({
      pageOptionsDto,
      itemCount: otherUserDtos.length,
    });

    return new PageDto<OtherUserDto>(paginatedItems, pageMeta);
  }

  private async getOtherUsersInDateRange(
    pageOptionsDto: OtherUsersPageOptionsDto,
    users: UserEntity[],
  ): Promise<OtherUserDto[]> {
    const { dateFrom, dateTo } = pageOptionsDto;
    const otherUserDtos: OtherUserDto[] = [];

    const filteredUsers = users.filter(
      (user) =>
        !user.endDate ||
        isAfter(startOfDay(new Date(user.endDate)), startOfDay(new Date())),
    );

    if (dateFrom && dateTo) {
      const dates: Date[] = [];

      let currentDateRange: Date = new Date(dateFrom);

      while (currentDateRange <= dateTo) {
        dates.push(new Date(currentDateRange));
        currentDateRange = addDays(currentDateRange, 1);
      }

      await Promise.all(
        dates.map((date) =>
          this.handleCurrentDateRange(date, filteredUsers, otherUserDtos),
        ),
      );

      otherUserDtos.sort(
        (a, b) =>
          DateProvider.extractDateFrom(b.date) -
          DateProvider.extractDateFrom(a.date),
      );
    }

    return otherUserDtos;
  }

  private async handleCurrentDateRange(
    currentDateRange: Date,
    users: UserEntity[],
    otherUserDtos: OtherUserDto[],
  ): Promise<void> {
    const [usersInOffice, usersWithTimeOff, usersWithWfh] = await Promise.all([
      this.userService.getUsersInOffice(currentDateRange),
      this.userService.getUsersWithTimeoffRequestApproved(currentDateRange),
      this.userService.getUsersWithWfhRequestApproved(currentDateRange),
    ]);

    const usersOutOfOffice = this.usersOutOfOffice(users, [
      ...usersInOffice,
      ...usersWithTimeOff,
      ...usersWithWfh,
    ]);

    for (const user of usersOutOfOffice) {
      otherUserDtos.push(new OtherUserDto(user, currentDateRange));
    }
  }

  private usersOutOfOffice(
    allUsers: UserEntity[],
    usersWorking: UserEntity[],
  ): UserEntity[] {
    const excludedUsersSet = new Set(usersWorking.map((user) => user.id));

    return allUsers.filter((user) => !excludedUsersSet.has(user.id));
  }
}
