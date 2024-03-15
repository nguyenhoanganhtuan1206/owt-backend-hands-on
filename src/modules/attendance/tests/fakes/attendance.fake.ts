import type { PageDto } from 'common/dto/page.dto';
import type { OtherUserDto } from 'modules/attendance/dtos/other-user.dto';
import type { OtherUsersPageOptionsDto } from 'modules/attendance/dtos/other-users-page-options.dto';

import { Order } from '../../../../constants';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { DeleteFileDto } from '../../dtos/delete-file.dto';
import type { TotalRequestDto } from '../../dtos/total-request.dto';

export class AttendanceFake {
  static buildTotalRequestDto(): TotalRequestDto {
    const totalRequest: TotalRequestDto = {
      timeOffRequests: 5,
      wfhRequests: 5,
    };

    return totalRequest;
  }

  static buildOtherUserDto(): OtherUserDto {
    const otherUser: OtherUserDto = {
      id: 1,
      user: UserFake.buildUserDto(),
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return otherUser;
  }

  static buildDeleteFileDto(): DeleteFileDto {
    const deleteFileDto: DeleteFileDto = {
      fileUrl: 'https://s3/file/test.png',
    };

    return deleteFileDto;
  }

  static buildOtherUsersPageOptionsDto(): OtherUsersPageOptionsDto {
    const pageOptions: OtherUsersPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
    };

    return pageOptions;
  }

  static buildOtherUserPageDto(): PageDto<OtherUserDto> {
    const otherUserDtos: PageDto<OtherUserDto> = {
      data: [AttendanceFake.buildOtherUserDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return otherUserDtos;
  }
}
