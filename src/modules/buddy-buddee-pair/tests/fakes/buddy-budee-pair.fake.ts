import type { PageDto } from '../../../../common/dto/page.dto';
import { Order } from '../../../../constants';
import type { BuddyBuddeePairPageOptionsDto } from '../../../buddy-buddee-pair/dtos/buddy-buddee-pair-page-options.dto';
import type { UserDto } from '../../../user/dtos/user.dto';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { BuddyBuddeePairDto } from '../../dtos/buddy-buddee-pair.dto';
import type { CreateBuddyBuddeesPairRequestDto } from '../../dtos/create-buddy-buddees-pair-request.dto';
import type { BuddyBuddeePairEntity } from '../../entities/buddy-buddee-pair.entity';

export class BuddyBuddeePairFake {
  static buildBuddyBuddeePairEntity(buddy, buddee): BuddyBuddeePairEntity {
    return {
      id: 1,
      buddy,
      buddee,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
      toDto(): BuddyBuddeePairDto {
        return {
          id: this.id,
          buddy: this.buddy.toDto(),
          buddee: this.buddee.toDto(),
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    } as BuddyBuddeePairEntity;
  }

  static buildBuddyBuddeePairDto(
    buddy: UserDto,
    buddee: UserDto,
  ): BuddyBuddeePairDto {
    const buddyBuddeePairDto: BuddyBuddeePairDto = {
      id: 1,
      buddy,
      buddee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return buddyBuddeePairDto;
  }

  static buildBuddyBuddeePairDtosPageDto(
    buddy: UserDto,
    buddee: UserDto,
  ): PageDto<BuddyBuddeePairDto> {
    const buddyBuddeePairDtos: PageDto<BuddyBuddeePairDto> = {
      data: [BuddyBuddeePairFake.buildBuddyBuddeePairDto(buddy, buddee)],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return buddyBuddeePairDtos;
  }

  static buildCreateBuddyBuddeesPairRequestDto(): CreateBuddyBuddeesPairRequestDto {
    const createBuddyBuddeesPairRequestDto: CreateBuddyBuddeesPairRequestDto = {
      buddyId: 1,
      buddeeIds: [2],
    };

    return createBuddyBuddeesPairRequestDto;
  }

  static buildBuddiesPageOptionsDto(
    emptyPage = true,
  ): BuddyBuddeePairPageOptionsDto {
    const pageOptions: BuddyBuddeePairPageOptionsDto = {
      orderBy: Order.ASC,
      page: emptyPage ? 0 : 1,
      take: 1,
      skip: 0,
      sortColumn: '',
      query: '',
    };

    return pageOptions;
  }
}
