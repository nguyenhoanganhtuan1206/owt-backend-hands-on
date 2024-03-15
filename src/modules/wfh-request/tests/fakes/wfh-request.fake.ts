import type { PageDto } from 'common/dto/page.dto';
import type { IFile } from 'interfaces/IFile';

import { Order } from '../../../../constants';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateWfhRequestDto } from '../../dtos/create-wfh-request.dto';
import type { WfhRequestDto } from '../../dtos/wfh-request.dto';
import type { WfhRequestsPageOptionsDto } from '../../dtos/wfh-requests-page-options.dto';
import type { WfhRequestEntity } from '../../entities/wfh-request.entity';

export class WfhRequestFake {
  static buildWfhRequestDto(): WfhRequestDto {
    const user = UserFake.buildUserDto();
    const wfhRequest: WfhRequestDto = {
      id: 1,
      user,
      dateFrom: new Date(),
      dateTo: new Date(),
      dateType: 'FULL_DAY',
      totalDays: 1,
      details: 'detail',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return wfhRequest;
  }

  static buildWfhRequestEntity(wfhRequest: WfhRequestDto): WfhRequestEntity {
    return {
      id: wfhRequest.id,
      user: wfhRequest.user,
      dateType: wfhRequest.dateType,
      status: wfhRequest.status,
      toDto: jest.fn(() => wfhRequest) as unknown,
    } as WfhRequestEntity;
  }

  static buildWfhRequestsPageOptionsDto(): WfhRequestsPageOptionsDto {
    const pageOptions: WfhRequestsPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
    };

    return pageOptions;
  }

  static buildWfhRequestPageDto(): PageDto<WfhRequestDto> {
    const wfhRequestDtos: PageDto<WfhRequestDto> = {
      data: [WfhRequestFake.buildWfhRequestDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return wfhRequestDtos;
  }

  static buildCreateWfhRequestDto(): CreateWfhRequestDto {
    const createWfhRequestDto: CreateWfhRequestDto = {
      dateFrom: new Date(),
      dateTo: new Date(),
      dateType: 'FULL_DAY',
      totalDays: 1,
      details: 'detail',
    };

    return createWfhRequestDto;
  }

  static buildWfhRequestIFile(): IFile {
    const file: IFile = {
      encoding: 'encoding',
      buffer: Buffer.from('bufferContent'),
      fieldname: 'attachFile',
      mimetype: 'image/jpeg',
      originalname: 'test.jpeg',
      size: 1,
    };

    return file;
  }
}
