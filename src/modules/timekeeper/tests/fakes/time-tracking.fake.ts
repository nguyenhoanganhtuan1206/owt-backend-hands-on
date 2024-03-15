/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { PageDto } from 'common/dto/page.dto';

import type { PageMetaDto } from '../../../../common/dto/page-meta.dto';
import {
  Order,
  TimeKeeperDeviceName,
  TimeKeeperState,
  TimeKeeperType,
} from '../../../../constants';
import { DateProvider } from '../../../../providers';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { TimeTrackingDto } from '../../dtos/time-tracking.dto';
import type { TimeTrackingPageOptionsDto } from '../../dtos/time-tracking-page-options.dto';
import type { UserTimekeeperDto } from '../../dtos/user-timekeeper.dto';
import type { TimeKeeperEntity } from '../../entities/timekeeper.entity';

export class TimeTrackingFake {
  static currentDate = new Date();

  static buildResponseDataAxios() {
    return {
      userId: '10',
      name: 'name',
    };
  }

  static buildUserTimekeeperDto(): UserTimekeeperDto {
    return {
      name: 'name',
      timekeeperUserId: 10,
    } as UserTimekeeperDto;
  }

  static buildTimeTrackingDto(): TimeTrackingDto {
    return {
      id: 1,
      date: DateProvider.formatDateUTC(new Date()),
      user: UserFake.buildUserDto(),
      checkIn: DateProvider.formatTimeHHmmssUTC(TimeTrackingFake.currentDate),
      checkOut: null,
      totalPresence: null,
    } as TimeTrackingDto;
  }

  static buildTimeKeeperEntity(
    timeTracking: TimeTrackingDto,
  ): TimeKeeperEntity {
    return {
      id: timeTracking.id,
      user: timeTracking.user
        ? UserFake.buildUserEntity(timeTracking.user)
        : null,
      timekeeperUserId: timeTracking.user?.timekeeperUserId,
      time: TimeTrackingFake.currentDate,
      state: TimeKeeperState.CHECK_IN,
      type: TimeKeeperType.FINGERPRINT,
      deviceName: TimeKeeperDeviceName.DEVICE_ONE,
      toDto: jest.fn(() => timeTracking) as unknown,
    } as unknown as TimeKeeperEntity;
  }

  static buildTimeTrackingsPageOptionsDto(): TimeTrackingPageOptionsDto {
    const pageOptions: TimeTrackingPageOptionsDto = {
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
      sortColumn: 'Date',
    };

    return pageOptions;
  }

  static buildTimeTrackingDtosPageDto(): PageDto<TimeTrackingDto> {
    const timeTrackingDtos: PageDto<TimeTrackingDto> = {
      data: [TimeTrackingFake.buildTimeTrackingDto()],
      meta: {
        page: 1,
        take: 10,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      } as unknown as PageMetaDto,
    };

    return timeTrackingDtos;
  }
}
