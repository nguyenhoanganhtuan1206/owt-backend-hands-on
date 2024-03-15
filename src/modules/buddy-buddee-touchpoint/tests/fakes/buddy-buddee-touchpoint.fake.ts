import type { PageDto } from '../../../../common/dto/page.dto';
import { Order } from '../../../../constants';
import { TouchpointStatus } from '../../../../constants/touchpoint-status';
import type { BuddyEntity } from '../../../buddy/entities/buddy.entity';
import type { BuddyBuddeePairEntity } from '../../../buddy-buddee-pair/entities/buddy-buddee-pair.entity';
import { BuddyBuddeeTouchpointDto } from '../../../buddy-buddee-touchpoint/dtos/buddy-buddee-touchpoint.dto';
import type { BuddyBuddeeTouchpointPageOptionsDto } from '../../../buddy-buddee-touchpoint/dtos/buddy-buddee-touchpoint-page-options.dto';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateBuddyBuddeeTouchpointRequestDto } from '../../dtos/create-buddy-buddee-touchpoint-request.dto';
import type { UpdateBuddyBuddeeTouchpointRequestDto } from '../../dtos/update-buddy-buddee-touchpoint-request.dto';
import type { BuddyBuddeeTouchpointEntity } from '../../entities/buddy-buddee-touchpoint.entity';

export class BuddyBuddeeTouchpointFake {
  static buildBuddyBuddeeTouchpointEntityBy(
    buddy: BuddyEntity,
    pair: BuddyBuddeePairEntity,
    touchpoint: BuddyBuddeeTouchpointEntity,
  ): BuddyBuddeeTouchpointEntity {
    return {
      id: pair.id,
      buddy: buddy.user,
      buddee: pair.buddee,
      createdAt: touchpoint.updatedAt,
      note: touchpoint.note,
      visible: touchpoint.visible,
    } as BuddyBuddeeTouchpointEntity;
  }

  static buildBuddyBuddeeTouchpointEntity(
    buddyBuddeeTouchpointDto = this.buildBuddyBuddeeTouchpointDto(),
  ): BuddyBuddeeTouchpointEntity {
    return {
      id: 1,
      buddy: buddyBuddeeTouchpointDto.buddy,
      buddee: buddyBuddeeTouchpointDto.buddee,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
      status: buddyBuddeeTouchpointDto.status,
      toDto: jest.fn(() => buddyBuddeeTouchpointDto),
    } as unknown as BuddyBuddeeTouchpointEntity;
  }

  static buildBuddyBuddeeTouchpointDto(
    buddy = UserFake.buildUserDto(),
    buddee = UserFake.buildUserDto(),
    status = TouchpointStatus.DRAFT,
  ): BuddyBuddeeTouchpointDto {
    const buddeeTouchpointDto: BuddyBuddeeTouchpointDto = {
      id: 1,
      status,
      visible: true,
      note: 'note',
      buddy,
      buddee,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    };

    return buddeeTouchpointDto;
  }

  static buildBuddyBuddeeTouchpointDtoPageByTouchpoint(
    touchpoint: BuddyBuddeeTouchpointEntity,
  ): PageDto<BuddyBuddeeTouchpointDto> {
    const buddeeTouchpointDto = new BuddyBuddeeTouchpointDto(touchpoint);
    const buddyBuddeeTouchpointDtoPageDto: PageDto<BuddyBuddeeTouchpointDto> = {
      data: [buddeeTouchpointDto],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return buddyBuddeeTouchpointDtoPageDto;
  }

  static buildBuddyBuddeeTouchpointDtoPageByTouchpointHasFiterNote(
    touchpoint: BuddyBuddeeTouchpointEntity,
  ): PageDto<BuddyBuddeeTouchpointDto> {
    const buddeeTouchpointDto = new BuddyBuddeeTouchpointDto(touchpoint);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const itemCount = touchpoint.note === undefined ? 0 : 1;
    const buddyBuddeeTouchpointDtoPageDto: PageDto<BuddyBuddeeTouchpointDto> = {
      data: [buddeeTouchpointDto],
      meta: {
        page: itemCount,
        take: 1,
        itemCount,
        pageCount: itemCount,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return buddyBuddeeTouchpointDtoPageDto;
  }

  static buildBuddiesPageDto(empty = false): PageDto<BuddyBuddeeTouchpointDto> {
    const buddeeTouchpointDto: PageDto<BuddyBuddeeTouchpointDto> = {
      data: empty ? [] : [this.buildBuddyBuddeeTouchpointDto()],
      meta: {
        page: empty ? 0 : 1,
        take: 1,
        itemCount: empty ? 0 : 1,
        pageCount: empty ? 0 : 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return buddeeTouchpointDto;
  }

  static buildBuddyBuddeeTouchpointPageOptionsDto(): BuddyBuddeeTouchpointPageOptionsDto {
    const pageOptions: BuddyBuddeeTouchpointPageOptionsDto = {
      orderBy: Order.ASC,
      page: 0,
      take: 1,
      skip: 0,
      sortColumn: '',
      query: '',
    };

    return pageOptions;
  }

  static buildCreateBuddyBuddeeTouchpointRequestDto(): CreateBuddyBuddeeTouchpointRequestDto {
    const createBuddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto =
      {
        buddyId: 1,
        buddeeId: 2,
        note: 'note',
        visible: false,
      };

    return createBuddyBuddeeTouchpointRequestDto;
  }

  static buildUpdateBuddyBuddeeTouchpointRequestDto(): UpdateBuddyBuddeeTouchpointRequestDto {
    const updateBuddyBuddeeTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto =
      {
        note: 'note',
        visible: false,
      };

    return updateBuddyBuddeeTouchpointRequestDto;
  }
}
