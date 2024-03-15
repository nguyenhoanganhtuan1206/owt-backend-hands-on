import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { PageDto } from '../../../common/dto/page.dto';
import { Order } from '../../../constants/order';
import { BuddyBuddeePairService } from '../../buddy-buddee-pair/services/buddy-buddee-pair.service';
import type { BuddyDto } from '../dtos/buddy.dto';
import type { BuddyPageOptionsDto } from '../dtos/buddy-page-options.dto';
import { CreateBuddyRequestDto } from '../dtos/create-buddy-request.dto';
import { BuddyEntity } from '../entities/buddy.entity';
import BuddyMapper from '../mappers/buddy.mapper';

@Injectable()
export class BuddyService {
  constructor(
    @InjectRepository(BuddyEntity)
    private buddyRepository: Repository<BuddyEntity>,
    private readonly buddyMapper: BuddyMapper,
    @Inject(forwardRef(() => BuddyBuddeePairService))
    private readonly buddyBuddeePairService: BuddyBuddeePairService,
  ) {}

  async getBuddies(
    pageOptionsDto: BuddyPageOptionsDto,
  ): Promise<PageDto<BuddyDto>> {
    const queryBuilder = this.createBuddyQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    const buddyPairs = await this.buddyBuddeePairService.getAllBuddyPairs();
    const buddyDtos = items.toDtos().map((buddyDto: BuddyDto) => {
      const isPairing = buddyPairs.some(
        (pair) => pair.buddy.id === buddyDto.buddy.id,
      );

      return { ...buddyDto, isPairing };
    });

    return new PageDto(buddyDtos, pageMetaDto);
  }

  @Transactional()
  async createBuddy(buddyRequestDto: CreateBuddyRequestDto): Promise<BuddyDto> {
    await this.validateBuddy(buddyRequestDto);

    const buddyEntity = await this.buddyMapper.toBuddyEntity(buddyRequestDto);

    const newBuddy = await this.buddyRepository.save(buddyEntity);

    return newBuddy.toDto();
  }

  @Transactional()
  async deleteBuddy(id: number): Promise<void> {
    const buddyEntity = await this.buddyRepository.findOneBy({
      id,
    });

    if (!buddyEntity) {
      throw new NotFoundException(`This buddy '${id}' cannot be found`);
    }

    const buddyPairs = await this.buddyBuddeePairService.getBuddyBuddeePairs([
      buddyEntity.user.id,
    ]);

    if (Array.isArray(buddyPairs) && buddyPairs.length > 0) {
      throw new BadRequestException(`This buddy '${id}' cannot be remove`);
    }

    await this.buddyRepository.remove(buddyEntity);
  }

  private async validateBuddy(
    buddyRequestDto: CreateBuddyRequestDto,
  ): Promise<void> {
    const { userId } = buddyRequestDto;
    const buddy = await this.buddyRepository
      .createQueryBuilder('buddy')
      .where('buddy.user_id = :userId', { userId })
      .getOne();

    if (buddy) {
      throw new ConflictException(`This buddy already exists`);
    }
  }

  async validateBuddyByUserId(userId: number): Promise<void> {
    const buddy = await this.buddyRepository
      .createQueryBuilder('buddy')
      .where('buddy.user.id = :userId', { userId })
      .getOne();

    if (!buddy) {
      throw new NotFoundException(`This buddy cannot be found`);
    }
  }

  createBuddyQueryBuilder(
    pageOptionsDto: BuddyPageOptionsDto,
  ): SelectQueryBuilder<BuddyEntity> {
    const { sortColumn } = pageOptionsDto;
    const queryBuilder = this.buddyRepository
      .createQueryBuilder('buddy')
      .leftJoinAndSelect('buddy.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .addSelect('UPPER(user.first_name)', 'upper_first_name');

    if (!sortColumn) {
      queryBuilder.orderBy('upper_first_name', Order.ASC);
    }

    return queryBuilder;
  }

  async toBuddyEntityFromUserId(userId: number): Promise<BuddyEntity | null> {
    return this.buddyRepository.findOneBy({
      user: {
        id: userId,
      },
    });
  }
}
