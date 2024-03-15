import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { differenceInMilliseconds } from 'date-fns';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import { PageDto } from '../../../common/dto/page.dto';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { Order } from '../../../constants';
import { DateProvider } from '../../../providers';
import { TimeTrackingDto } from '../dtos/time-tracking.dto';
import type { TimeTrackingPageOptionsDto } from '../dtos/time-tracking-page-options.dto';
import type { UserTimekeeperDto } from '../dtos/user-timekeeper.dto';
import { TimeKeeperEntity } from '../entities/timekeeper.entity';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TimeKeeperEntity)
    private readonly timeKeeperRepository: Repository<TimeKeeperEntity>,
  ) {}

  async getTimeTrackings(
    pageOptionsDto: TimeTrackingPageOptionsDto,
  ): Promise<PageDto<TimeTrackingDto>> {
    const timekeeperQueryBuilder =
      this.getTimekeeperQueryBuilder(pageOptionsDto);

    const items = await timekeeperQueryBuilder.getMany();

    const groupedItems = this.groupItemsByUserAndDate(items);

    const paginatedGroupedItems = this.paginateGroupedItems(
      groupedItems,
      pageOptionsDto.page,
      pageOptionsDto.take,
    );

    const timeTrackingDtos = this.groupAndTransformItems(paginatedGroupedItems);

    const pageMeta = new PageMetaDto({
      pageOptionsDto,
      itemCount: Object.keys(groupedItems).length,
    });

    return new PageDto<TimeTrackingDto>(timeTrackingDtos, pageMeta);
  }

  async getUserTimekeepers(): Promise<UserTimekeeperDto[]> {
    const response = await axios.get(
      process.env.TIME_KEEPER_SERVER_URL + '/users',
    );

    return response.data
      ? (response.data.map(({ userId, name }) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          timekeeperUserId: Number.parseInt(userId, 10),
          name,
        })) as UserTimekeeperDto[])
      : [];
  }

  private groupAndTransformItems(
    groupedItems: Record<string, TimeKeeperEntity[]>,
  ): TimeTrackingDto[] {
    const timeTrackings: TimeTrackingDto[] = [];

    for (const key of Object.keys(groupedItems)) {
      const groupItems = groupedItems[key];
      const timeTrackingDto = this.transformGroupToTimeTrackingDto(groupItems);

      timeTrackings.push(timeTrackingDto);
    }

    return timeTrackings;
  }

  private groupItemsByUserAndDate(
    items: TimeKeeperEntity[],
  ): Record<string, TimeKeeperEntity[]> {
    const groupedItems: Record<string, TimeKeeperEntity[]> = {};

    for (const item of items) {
      const key = `${item.user.id}_${DateProvider.formatDateUTC(item.time)}`;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!groupedItems[key]) {
        groupedItems[key] = [];
      }

      groupedItems[key].push(item);
    }

    return groupedItems;
  }

  private transformGroupToTimeTrackingDto(
    groupItems: TimeKeeperEntity[],
  ): TimeTrackingDto {
    const sortedItems = groupItems.sort(
      (a, b) => a.time.getTime() - b.time.getTime(),
    );
    const checkInItem = sortedItems[0];
    const checkOutItem =
      groupItems.length > 1 ? sortedItems[groupItems.length - 1] : undefined;
    const totalPresence = this.calculateTotalPresence(
      checkInItem,
      checkOutItem,
    );

    return new TimeTrackingDto(checkInItem, checkOutItem, totalPresence);
  }

  private calculateTotalPresence(
    checkInItem: TimeKeeperEntity,
    checkOutItem: TimeKeeperEntity | undefined,
  ): Date | undefined {
    if (checkOutItem) {
      const checkInTime = checkInItem.time;
      const checkOutTime = checkOutItem.time;
      const timeDifference = differenceInMilliseconds(
        checkOutTime,
        checkInTime,
      );

      return DateProvider.formatDateTimeDifference(checkInTime, timeDifference);
    }

    return undefined;
  }

  private paginateGroupedItems(
    groupedItems: Record<string, TimeKeeperEntity[]>,
    page: number,
    take: number,
  ): Record<string, TimeKeeperEntity[]> {
    const paginatedGroupedItems: Record<string, TimeKeeperEntity[]> = {};
    const keys = Object.keys(groupedItems);
    const start = (page - 1) * take;
    const end = start + take;

    for (let i = start; i < end && i < keys.length; i++) {
      const key = keys[i];
      paginatedGroupedItems[key] = groupedItems[key];
    }

    return paginatedGroupedItems;
  }

  private getTimekeeperQueryBuilder(
    pageOptionsDto: TimeTrackingPageOptionsDto,
  ): SelectQueryBuilder<TimeKeeperEntity> {
    const { userIds, dateFrom, dateTo, orderBy } = pageOptionsDto;

    const subquery = this.timeKeeperRepository
      .createQueryBuilder('subquery')
      .leftJoinAndSelect('subquery.user', 'subUser')
      .select([
        'subUser.id as userId',
        'DATE(subquery.time) as date',
        'MIN(subquery.time) as minTime',
        'MAX(subquery.time) as maxTime',
      ])
      .addGroupBy('subUser.id, DATE(subquery.time)');

    const queryBuilder = this.timeKeeperRepository
      .createQueryBuilder('timeKeeper')
      .leftJoinAndSelect('timeKeeper.user', 'mainUser')
      .leftJoinAndSelect('mainUser.position', 'position')
      .leftJoinAndSelect('mainUser.level', 'level')
      .leftJoinAndSelect('mainUser.cvs', 'cvs')
      .leftJoinAndSelect('mainUser.permissions', 'permissions')
      .leftJoin(
        `(${subquery.getQuery()})`,
        'subquery',
        'mainUser.id = subquery.userId AND DATE(timeKeeper.time) = subquery.date',
      )
      .addSelect('UPPER(mainUser.first_name)', 'upper_first_name')
      .addSelect('UPPER(mainUser.last_name)', 'upper_last_name')
      .andWhere(
        '(timeKeeper.time = subquery.minTime OR timeKeeper.time = subquery.maxTime)',
      );

    queryBuilder.andWhere(
      '(DATE(timeKeeper.time) BETWEEN :dateFrom AND :dateTo)',
      {
        dateFrom,
        dateTo,
      },
    );

    if (userIds && userIds.length > 0) {
      queryBuilder.andWhere('mainUser.id IN (:...userIds)', {
        userIds,
      });
    }

    queryBuilder.orderBy('timeKeeper.time', Order.DESC);
    queryBuilder.addOrderBy('upper_first_name', orderBy);
    queryBuilder.addOrderBy('upper_last_name', orderBy);

    return queryBuilder;
  }
}
