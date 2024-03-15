import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PageDto } from 'common/dto/page.dto';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { BuddyPairPageMetaDto } from '../../../common/dto/buddy-pair-page-meta.dto';
import { Order } from '../../../constants';
import type { BuddyPageOptionsDto } from '../../buddy/dtos/buddy-page-options.dto';
import type { BuddyEntity } from '../../buddy/entities/buddy.entity';
import { BuddyService } from '../../buddy/services/buddy.service';
import type { BuddyBuddeeTouchpointEntity } from '../../buddy-buddee-touchpoint/entities/buddy-buddee-touchpoint.entity';
import { BuddyBuddeeTouchpointService } from '../../buddy-buddee-touchpoint/services/buddy-buddee-touchpoint.service';
import type { BuddyBuddeePairDto } from '../dtos/buddy-buddee-pair.dto';
import type { BuddyBuddeePairPageOptionsDto } from '../dtos/buddy-buddee-pair-page-options.dto';
import { CreateBuddyBuddeesPairRequestDto } from '../dtos/create-buddy-buddees-pair-request.dto';
import { BuddyBuddeePairEntity } from '../entities/buddy-buddee-pair.entity';
import BuddyBuddeePairMapper from '../mappers/buddy-buddee-pair.mapper';

@Injectable()
export class BuddyBuddeePairService {
  constructor(
    @InjectRepository(BuddyBuddeePairEntity)
    private buddyPairRepository: Repository<BuddyBuddeePairEntity>,
    private readonly buddyPairMapper: BuddyBuddeePairMapper,
    @Inject(forwardRef(() => BuddyService))
    private readonly buddyService: BuddyService,
    @Inject(forwardRef(() => BuddyBuddeeTouchpointService))
    private readonly buddyBuddeeTouchpointService: BuddyBuddeeTouchpointService,
  ) {}

  async getBuddyPairs(
    pageOptionsDto: BuddyPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeePairDto>> {
    const buddyQueryBuilder =
      this.buddyService.createBuddyQueryBuilder(pageOptionsDto);
    const [items, pageMetaDto] =
      await buddyQueryBuilder.paginate(pageOptionsDto);

    if (Array.isArray(items) && items.length === 0) {
      return this.toPageDto([], 0, pageOptionsDto);
    }

    const buddyIds = items.map((buddy) => buddy.user.id);
    const buddyPairs = await this.getBuddyBuddeePairs(buddyIds);
    const newBuddyPairs = this.getBuddyWithBuddees(items, buddyPairs);

    return this.toPageDto(newBuddyPairs, pageMetaDto.itemCount, pageOptionsDto);
  }

  @Transactional()
  async createBuddyPairs(
    buddyBuddeesPairRequestDto: CreateBuddyBuddeesPairRequestDto,
  ): Promise<BuddyBuddeePairDto[]> {
    await this.validateBuddyBuddeesPair(buddyBuddeesPairRequestDto);

    const buddyPairEntities =
      await this.buddyPairMapper.toBuddyBuddeePairEntities(
        buddyBuddeesPairRequestDto,
      );

    const newBuddyPairs =
      await this.buddyPairRepository.save(buddyPairEntities);

    await this.enableTouchpoints(newBuddyPairs);

    return newBuddyPairs.toDtos();
  }

  @Transactional()
  async deleteBuddyPair(id: number): Promise<void> {
    const buddyPairEntity = await this.buddyPairRepository.findOneBy({
      id,
    });

    if (!buddyPairEntity) {
      throw new NotFoundException(`This buddy pair cannot be found`);
    }

    await this.removeTouchpoints(
      buddyPairEntity.buddy.id,
      buddyPairEntity.buddee.id,
    );

    await this.buddyPairRepository.remove(buddyPairEntity);
  }

  private async validateBuddyBuddeesPair(
    buddyPairRequestDto: CreateBuddyBuddeesPairRequestDto,
  ): Promise<void> {
    const { buddyId, buddeeIds } = buddyPairRequestDto;

    await this.buddyService.validateBuddyByUserId(buddyId);

    if (buddeeIds.includes(buddyId)) {
      throw new BadRequestException(
        `Cannot pairing buddy and buddee with the same id`,
      );
    }

    const buddyPair = await this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .where('buddy.id = :buddyId AND buddee.id IN (:...buddeeIds)', {
        buddyId,
        buddeeIds,
      })
      .getOne();

    if (buddyPair) {
      throw new ConflictException(
        `At least one pair of buddy and buddee already exists`,
      );
    }

    const assignedBuddee = await this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .where('buddy.id != :buddyId AND buddee.id IN (:...buddeeIds)', {
        buddyId,
        buddeeIds,
      })
      .getOne();

    if (assignedBuddee) {
      throw new ConflictException(
        `At least one buddee already paired with another buddy`,
      );
    }
  }

  private async removeTouchpoints(
    buddyId: number,
    buddeeId: number,
  ): Promise<void> {
    const touchpoints =
      await this.buddyBuddeeTouchpointService.getAllTouchpoints(
        buddyId,
        buddeeId,
      );

    if (Array.isArray(touchpoints) && touchpoints.length > 0) {
      await this.buddyBuddeeTouchpointService.saveTouchpoints(
        touchpoints.map((touchpoint) => {
          touchpoint.deleted = true;

          return touchpoint;
        }),
      );
    }
  }

  private async enableTouchpoints(
    buddyBuddeePairs: BuddyBuddeePairEntity[],
  ): Promise<void> {
    const touchpoints: BuddyBuddeeTouchpointEntity[] = [];

    await Promise.all(
      buddyBuddeePairs.map(async (pair) => {
        const buddyTouchpoints =
          await this.buddyBuddeeTouchpointService.getAllTouchpoints(
            pair.buddy.id,
            pair.buddee.id,
          );

        if (Array.isArray(buddyTouchpoints) && buddyTouchpoints.length > 0) {
          const updatedBuddyTouchpoints: BuddyBuddeeTouchpointEntity[] =
            buddyTouchpoints.map((touchpoint: BuddyBuddeeTouchpointEntity) => {
              touchpoint.deleted = false;

              return touchpoint;
            });

          touchpoints.push(...updatedBuddyTouchpoints);
        }
      }),
    );

    if (touchpoints.length > 0) {
      await this.buddyBuddeeTouchpointService.saveTouchpoints(touchpoints);
    }
  }

  async getBuddyBuddeePairs(
    buddyIds: number[],
  ): Promise<BuddyBuddeePairEntity[]> {
    return this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .leftJoinAndSelect('buddy.position', 'buddyPosition')
      .leftJoinAndSelect('buddy.level', 'buddyLevel')
      .leftJoinAndSelect('buddy.permissions', 'buddyPermissions')
      .leftJoinAndSelect('buddee.position', 'buddeePosition')
      .leftJoinAndSelect('buddee.level', 'buddeeLevel')
      .leftJoinAndSelect('buddee.permissions', 'buddeePermissions')
      .where('buddy.id IN (:...buddyIds)', {
        buddyIds,
      })
      .orderBy('buddy.first_name', 'ASC')
      .getMany();
  }

  private getBuddyWithBuddees(
    buddyEntities: BuddyEntity[],
    buddyBuddeePairs: BuddyBuddeePairEntity[],
  ): BuddyBuddeePairEntity[] {
    const newBuddyPairs: BuddyBuddeePairEntity[] = [];

    for (const buddy of buddyEntities) {
      const pairs = buddyBuddeePairs.filter(
        (pair) => pair.buddy.id === buddy.user.id,
      );

      if (Array.isArray(pairs) && pairs.length > 0) {
        for (const pair of pairs) {
          newBuddyPairs.push(pair);
        }
      } else {
        const buddyBuddeePair = new BuddyBuddeePairEntity();
        buddyBuddeePair.buddy = buddy.user;
        newBuddyPairs.push(buddyBuddeePair);
      }
    }

    return newBuddyPairs;
  }

  private toPageDto(
    buddyPairs: BuddyBuddeePairEntity[],
    total: number,
    pageOptionsDto: BuddyPageOptionsDto,
  ): PageDto<BuddyBuddeePairDto> {
    const metaData = new BuddyPairPageMetaDto(
      {
        pageOptionsDto,
        itemCount: total,
      },
      buddyPairs.length,
    );

    return buddyPairs.toPageDto(metaData);
  }

  async validateBuddyBuddeePair(
    buddyId: number,
    buddeeId: number,
  ): Promise<void> {
    const buddyPair = await this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .where('buddy.id = :buddyId AND buddee.id = :buddeeId', {
        buddyId,
        buddeeId,
      })
      .getOne();

    if (!buddyPair) {
      throw new NotFoundException(`Pair of buddy and buddee cannot be found`);
    }
  }

  async findBuddyBuddeePairById(id: number): Promise<BuddyBuddeePairEntity> {
    const buddyPair = await this.buddyPairRepository.findOneBy({
      id,
    });

    if (!buddyPair) {
      throw new NotFoundException(`Pair of buddy and buddee cannot be found`);
    }

    return buddyPair;
  }

  createBuddyBuddeePairQueryBuilder(
    buddyId: number,
    pageOptionsDto: BuddyBuddeePairPageOptionsDto,
  ): SelectQueryBuilder<BuddyBuddeePairEntity> {
    const { sortColumn } = pageOptionsDto;
    const queryBuilder = this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .leftJoinAndSelect('buddy.position', 'buddyPosition')
      .leftJoinAndSelect('buddy.level', 'buddyLevel')
      .leftJoinAndSelect('buddy.permissions', 'buddyPermissions')
      .leftJoinAndSelect('buddee.position', 'buddeePosition')
      .leftJoinAndSelect('buddee.level', 'buddeeLevel')
      .leftJoinAndSelect('buddee.permissions', 'buddeePermissions')
      .addSelect('UPPER(buddee.first_name)', 'upper_first_name')
      .where('buddy.id = :buddyId', {
        buddyId,
      });

    if (!sortColumn) {
      queryBuilder.orderBy('upper_first_name', Order.ASC);
    }

    return queryBuilder;
  }

  async getBuddeePair(buddeeId: number): Promise<BuddyBuddeePairEntity | null> {
    return this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .leftJoinAndSelect('buddy.position', 'buddyPosition')
      .leftJoinAndSelect('buddy.level', 'buddyLevel')
      .leftJoinAndSelect('buddy.permissions', 'buddyPermissions')
      .leftJoinAndSelect('buddee.position', 'buddeePosition')
      .leftJoinAndSelect('buddee.level', 'buddeeLevel')
      .leftJoinAndSelect('buddee.permissions', 'buddeePermissions')
      .where('buddee.id = :buddeeId', { buddeeId })
      .getOne();
  }

  async getAllBuddyPairs(): Promise<BuddyBuddeePairEntity[]> {
    return this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddy', 'buddy')
      .getMany();
  }

  async getAllBuddeePairs(): Promise<BuddyBuddeePairEntity[]> {
    return this.buddyPairRepository
      .createQueryBuilder('buddyBuddeePair')
      .leftJoinAndSelect('buddyBuddeePair.buddee', 'buddee')
      .getMany();
  }
}
