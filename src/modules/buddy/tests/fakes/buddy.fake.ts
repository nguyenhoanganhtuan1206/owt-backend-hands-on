import type { PageDto } from '../../../../common/dto/page.dto';
import { Order } from '../../../../constants';
import type { CreateBuddyRequestDto } from '../../../buddy/dtos/create-buddy-request.dto';
import type { UserDto } from '../../../user/dtos/user.dto';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { BuddyDto } from '../../dtos/buddy.dto';
import type { BuddyPageOptionsDto } from '../../dtos/buddy-page-options.dto';
import type { BuddyEntity } from '../../entities/buddy.entity';

export class BuddyFake {
  static buildBuddyEntityByUserDto(userDto: UserDto): BuddyEntity {
    return {
      id: 1,
      user: userDto,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    } as BuddyEntity;
  }

  static buildCreateBuddyRequestDto(): CreateBuddyRequestDto {
    const createBuddyRequestDto: CreateBuddyRequestDto = {
      userId: 1,
    };

    return createBuddyRequestDto;
  }

  static buildBuddyEntityByUserEntity(user: UserEntity): BuddyEntity {
    return {
      id: 1,
      user,
      createdAt: UserFake.date,
      updatedAt: UserFake.date,
    } as BuddyEntity;
  }

  static buildBuddyDto(): BuddyDto {
    const buddyDto: BuddyDto = {
      id: 1,
      buddy: UserFake.buildUserDto(),
      isPairing: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return buddyDto;
  }

  static buildBuddyEntity(buddyDto: BuddyDto): BuddyEntity {
    return {
      id: buddyDto.id,
      user: UserFake.buildUserEntity(buddyDto.buddy),
      isPairing: buddyDto.isPairing,
      toDto: jest.fn(() => buddyDto) as unknown,
    } as unknown as BuddyEntity;
  }

  static buildBuddyPageOptionsDto(): BuddyPageOptionsDto {
    const pageOptions: BuddyPageOptionsDto = {
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
      sortColumn: 'date',
    };

    return pageOptions;
  }

  static buildBuddyDtosPageDto(): PageDto<BuddyDto> {
    const buddyDtos: PageDto<BuddyDto> = {
      data: [BuddyFake.buildBuddyDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return buddyDtos;
  }
}
