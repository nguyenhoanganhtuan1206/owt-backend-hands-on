import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { BuddyPairPageMetaDto } from '../../../common/dto/buddy-pair-page-meta.dto';
import type { PageDto } from '../../../common/dto/page.dto';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { Order } from '../../../constants';
import { TouchpointStatus } from '../../../constants/touchpoint-status';
import type { BuddyEntity } from '../../buddy/entities/buddy.entity';
import type { BuddyBuddeePairPageOptionsDto } from '../../buddy-buddee-pair/dtos/buddy-buddee-pair-page-options.dto';
import type { BuddyBuddeePairEntity } from '../../buddy-buddee-pair/entities/buddy-buddee-pair.entity';
import { BuddyBuddeePairService } from '../../buddy-buddee-pair/services/buddy-buddee-pair.service';
import type { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';
import type { BuddyBuddeeTouchpointPageOptionsDto } from '../dtos/buddy-buddee-touchpoint-page-options.dto';
import { CreateBuddyBuddeeTouchpointRequestDto } from '../dtos/create-buddy-buddee-touchpoint-request.dto';
import { UpdateBuddyBuddeeTouchpointRequestDto } from '../dtos/update-buddy-buddee-touchpoint-request.dto';
import { BuddyBuddeeTouchpointEntity } from '../entities/buddy-buddee-touchpoint.entity';
import BuddyBuddeeTouchpointMapper from '../mappers/buddy-buddee-touchpoint.mapper';
import { BuddyService } from './../../buddy/services/buddy.service';

@Injectable()
export class BuddyBuddeeTouchpointService {
  constructor(
    @InjectRepository(BuddyBuddeeTouchpointEntity)
    private buddyTouchpointRepository: Repository<BuddyBuddeeTouchpointEntity>,
    private readonly buddyTouchpointMapper: BuddyBuddeeTouchpointMapper,
    @Inject(forwardRef(() => BuddyService))
    private readonly buddyService: BuddyService,
    @Inject(forwardRef(() => BuddyBuddeePairService))
    private readonly buddyBuddeePairService: BuddyBuddeePairService,
  ) {}

  async getBuddyPairTouchpoints(
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const buddyQueryBuilder =
      this.buddyService.createBuddyQueryBuilder(pageOptionsDto);
    const [items, pageMetaDto] =
      await buddyQueryBuilder.paginate(pageOptionsDto);

    if (Array.isArray(items) && items.length === 0) {
      return this.toBuddyPairPageDto([], 0, pageOptionsDto);
    }

    const buddyIds = items.map((buddy) => buddy.user.id);
    const buddyPairs =
      await this.buddyBuddeePairService.getBuddyBuddeePairs(buddyIds);
    const buddyTouchpoints = await this.getBuddyBuddeeTouchpoints(buddyIds);
    const latestTouchpoints: BuddyBuddeeTouchpointEntity[] =
      this.getBuddyBuddeeLatestTouchpoints(items, buddyPairs, buddyTouchpoints);

    return this.toBuddyPairPageDto(
      latestTouchpoints,
      pageMetaDto.itemCount,
      pageOptionsDto,
    );
  }

  async getMyBuddees(
    userId: number,
    pageOptionsDto: BuddyBuddeePairPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const buddy = await this.buddyService.toBuddyEntityFromUserId(userId);

    if (buddy === null) {
      return this.toMyBuddeesPageDto([], null, pageOptionsDto);
    }

    const myBuddeesQueryBuilder =
      this.buddyBuddeePairService.createBuddyBuddeePairQueryBuilder(
        userId,
        pageOptionsDto,
      );
    const [items, pageMetaDto] =
      await myBuddeesQueryBuilder.paginate(pageOptionsDto);

    if (Array.isArray(items) && items.length === 0) {
      return this.toMyBuddeesPageDto([], pageMetaDto, pageOptionsDto);
    }

    const buddyTouchpoints = await this.getBuddyBuddeeTouchpoints([userId]);
    const latestTouchpoints: BuddyBuddeeTouchpointEntity[] =
      this.getBuddyBuddeeLatestTouchpoints([buddy], items, buddyTouchpoints);

    return this.toMyBuddeesPageDto(
      latestTouchpoints,
      pageMetaDto,
      pageOptionsDto,
    );
  }

  async getTouchpointsByPairId(
    pairId: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const buddyBuddeePair =
      await this.buddyBuddeePairService.findBuddyBuddeePairById(pairId);

    return this.getTouchpoints(
      buddyBuddeePair.buddy.id,
      buddyBuddeePair.buddee.id,
      pageOptionsDto,
    );
  }

  async getTouchpointsByBuddyIdAndBuddeeId(
    buddyId: number,
    buddeeId: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const touchpoints = await this.getTouchpoints(
      buddyId,
      buddeeId,
      pageOptionsDto,
    );

    if (Array.isArray(touchpoints.data) && touchpoints.data.length === 0) {
      const buddeePair =
        await this.buddyBuddeePairService.getBuddeePair(buddeeId);

      if (buddeePair) {
        const emptyTouchpointEntity = new BuddyBuddeeTouchpointEntity();
        emptyTouchpointEntity.buddy = buddeePair.buddy;
        emptyTouchpointEntity.buddee = buddeePair.buddee;

        return this.toPageDto([emptyTouchpointEntity], pageOptionsDto);
      }

      return this.toPageDto([], pageOptionsDto);
    }

    return touchpoints;
  }

  async getMyTouchpoints(
    buddeeId: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const queryBuilder = this.createBuddeeTouchpointsQueryBuilder(
      buddeeId,
      pageOptionsDto,
    );

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    if (Array.isArray(items) && items.length === 0) {
      const buddeePair =
        await this.buddyBuddeePairService.getBuddeePair(buddeeId);

      if (buddeePair) {
        const emptyTouchpointEntity = new BuddyBuddeeTouchpointEntity();
        emptyTouchpointEntity.buddy = buddeePair.buddy;
        emptyTouchpointEntity.buddee = buddeePair.buddee;

        return this.toPageDto([emptyTouchpointEntity], pageOptionsDto);
      }

      return this.toPageDto([], pageOptionsDto);
    }

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createBuddyBuddeeTouchpoint(
    buddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    await this.validateBuddyBuddeeTouchpoint(buddyBuddeeTouchpointRequestDto);

    const buddyTouchpointEntity =
      await this.buddyTouchpointMapper.toBuddyBuddeeTouchpointEntity(
        buddyBuddeeTouchpointRequestDto,
        TouchpointStatus.SUBMITTED,
      );

    const newBuddyTouchpoint = await this.buddyTouchpointRepository.save(
      buddyTouchpointEntity,
    );

    return newBuddyTouchpoint.toDto();
  }

  @Transactional()
  async createDraftBuddyBuddeeTouchpoint(
    buddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    await this.validateBuddyBuddeeTouchpoint(buddyBuddeeTouchpointRequestDto);

    const buddyTouchpointEntity =
      await this.buddyTouchpointMapper.toBuddyBuddeeTouchpointEntity(
        buddyBuddeeTouchpointRequestDto,
        TouchpointStatus.DRAFT,
      );

    const newDraftBuddyTouchpoint = await this.buddyTouchpointRepository.save(
      buddyTouchpointEntity,
    );

    return newDraftBuddyTouchpoint.toDto();
  }

  @Transactional()
  async updateDraftBuddyBuddeeTouchpoint(
    id: number,
    buddyBuddeeTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    const buddyTouchpointEntity =
      await this.buddyTouchpointMapper.toDraftBuddyBuddeeTouchpointEntity(
        id,
        buddyBuddeeTouchpointRequestDto,
      );

    const newDraftBuddyTouchpoint = await this.buddyTouchpointRepository.save(
      buddyTouchpointEntity,
    );

    return newDraftBuddyTouchpoint.toDto();
  }

  @Transactional()
  async submitDraftBuddyBuddeeTouchpoint(
    id: number,
    buddyBuddeeTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    const draftBuddyTouchpointEntity =
      await this.buddyTouchpointMapper.toDraftBuddyBuddeeTouchpointEntity(
        id,
        buddyBuddeeTouchpointRequestDto,
      );
    draftBuddyTouchpointEntity.status = TouchpointStatus.SUBMITTED;

    const buddyTouchpointUpdated = await this.buddyTouchpointRepository.save(
      draftBuddyTouchpointEntity,
    );

    return buddyTouchpointUpdated.toDto();
  }

  private getBuddyBuddeeLatestTouchpoints(
    buddyEntities: BuddyEntity[],
    buddyPairs: BuddyBuddeePairEntity[],
    buddyTouchpoints: BuddyBuddeeTouchpointEntity[],
  ): BuddyBuddeeTouchpointEntity[] {
    const touchpoints: BuddyBuddeeTouchpointEntity[] = [];

    for (const buddy of buddyEntities) {
      const pairs = buddyPairs.filter(
        (pair) => pair.buddy.id === buddy.user.id,
      );

      if (Array.isArray(pairs) && pairs.length > 0) {
        for (const pair of pairs) {
          const latestTouchpoint = buddyTouchpoints.find(
            (touchpoint) =>
              touchpoint.buddy.id === buddy.user.id &&
              touchpoint.buddee.id === pair.buddee.id,
          );

          const buddyBuddeeTouchpoint = new BuddyBuddeeTouchpointEntity();
          buddyBuddeeTouchpoint.id = pair.id;
          buddyBuddeeTouchpoint.buddy = buddy.user;
          buddyBuddeeTouchpoint.buddee = pair.buddee;

          if (latestTouchpoint) {
            buddyBuddeeTouchpoint.note = latestTouchpoint.note;
            buddyBuddeeTouchpoint.visible = latestTouchpoint.visible;
            buddyBuddeeTouchpoint.createdAt = latestTouchpoint.updatedAt;
          }

          touchpoints.push(buddyBuddeeTouchpoint);
        }
      } else {
        const buddyBuddeeTouchpoint = new BuddyBuddeeTouchpointEntity();
        buddyBuddeeTouchpoint.buddy = buddy.user;
        touchpoints.push(buddyBuddeeTouchpoint);
      }
    }

    return touchpoints;
  }

  private toBuddyPairPageDto(
    touchpoints: BuddyBuddeeTouchpointEntity[],
    total: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): PageDto<BuddyBuddeeTouchpointDto> {
    const metaData = new BuddyPairPageMetaDto(
      {
        pageOptionsDto,
        itemCount: total,
      },
      touchpoints.length,
    );

    return touchpoints.toPageDto(metaData);
  }

  private toPageDto(
    touchpoints: BuddyBuddeeTouchpointEntity[],
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): PageDto<BuddyBuddeeTouchpointDto> {
    const itemCount = touchpoints.filter(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (touchpoint) => touchpoint.note !== undefined,
    ).length;

    const metaData = new PageMetaDto({
      pageOptionsDto,
      itemCount,
    });

    return touchpoints.toPageDto(metaData);
  }

  private toMyBuddeesPageDto(
    touchpoints: BuddyBuddeeTouchpointEntity[],
    buddeePageMetaDto: PageMetaDto | null,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): PageDto<BuddyBuddeeTouchpointDto> {
    const metaData = new PageMetaDto({
      pageOptionsDto,
      itemCount: buddeePageMetaDto ? buddeePageMetaDto.itemCount : 0,
    });

    return touchpoints.toPageDto(metaData);
  }

  private async validateBuddyBuddeeTouchpoint(
    buddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<void> {
    const { buddyId, buddeeId } = buddyBuddeeTouchpointRequestDto;

    await this.buddyBuddeePairService.validateBuddyBuddeePair(
      buddyId,
      buddeeId,
    );
  }

  private async getTouchpoints(
    buddyId: number,
    buddeeId: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    const queryBuilder = this.createBuddyTouchpointsQueryBuilder(
      buddyId,
      buddeeId,
      pageOptionsDto,
    );

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  private createBuddyTouchpointsQueryBuilder(
    buddyId: number,
    buddeeId: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): SelectQueryBuilder<BuddyBuddeeTouchpointEntity> {
    const { sortColumn } = pageOptionsDto;
    const queryBuilder = this.buddyTouchpointRepository
      .createQueryBuilder('buddyBuddeeTouchpoint')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddy', 'buddy')
      .leftJoinAndSelect('buddy.position', 'buddyPosition')
      .leftJoinAndSelect('buddy.level', 'buddyLevel')
      .leftJoinAndSelect('buddy.permissions', 'buddyPermissions')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddee', 'buddee')
      .leftJoinAndSelect('buddee.position', 'buddeePosition')
      .leftJoinAndSelect('buddee.level', 'buddeeLevel')
      .leftJoinAndSelect('buddee.permissions', 'buddeePermissions')
      .where(
        'buddy.id = :buddyId AND buddee.id = :buddeeId AND deleted = false',
        {
          buddyId,
          buddeeId,
        },
      );

    if (!sortColumn) {
      queryBuilder.orderBy('buddyBuddeeTouchpoint.updatedAt', Order.DESC);
    }

    return queryBuilder;
  }

  private createBuddeeTouchpointsQueryBuilder(
    buddeeId: number,
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): SelectQueryBuilder<BuddyBuddeeTouchpointEntity> {
    const { sortColumn } = pageOptionsDto;
    const queryBuilder = this.buddyTouchpointRepository
      .createQueryBuilder('buddyBuddeeTouchpoint')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddee', 'buddee')
      .leftJoinAndSelect('buddy.position', 'buddyPosition')
      .leftJoinAndSelect('buddy.level', 'buddyLevel')
      .leftJoinAndSelect('buddy.permissions', 'buddyPermissions')
      .leftJoinAndSelect('buddee.position', 'buddeePosition')
      .leftJoinAndSelect('buddee.level', 'buddeeLevel')
      .leftJoinAndSelect('buddee.permissions', 'buddeePermissions')
      .where('buddee.id = :buddeeId', { buddeeId })
      .andWhere(`deleted = false AND visible = true AND status = 'SUBMITTED'`);

    if (!sortColumn) {
      queryBuilder.orderBy('buddyBuddeeTouchpoint.updatedAt', Order.DESC);
    }

    return queryBuilder;
  }

  private async getBuddyBuddeeTouchpoints(
    buddyIds: number[],
  ): Promise<BuddyBuddeeTouchpointEntity[]> {
    return this.buddyTouchpointRepository
      .createQueryBuilder('buddyBuddeeTouchpoint')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddee', 'buddee')
      .leftJoinAndSelect('buddy.position', 'buddyPosition')
      .leftJoinAndSelect('buddy.level', 'buddyLevel')
      .leftJoinAndSelect('buddy.permissions', 'buddyPermissions')
      .leftJoinAndSelect('buddee.position', 'buddeePosition')
      .leftJoinAndSelect('buddee.level', 'buddeeLevel')
      .leftJoinAndSelect('buddee.permissions', 'buddeePermissions')
      .where(`buddy.id IN (:...buddyIds) AND deleted = false`, {
        buddyIds,
      })
      .orderBy('buddyBuddeeTouchpoint.updatedAt', Order.DESC)
      .getMany();
  }

  async getAllTouchpoints(
    buddyId: number,
    buddeeId: number,
  ): Promise<BuddyBuddeeTouchpointEntity[]> {
    return this.buddyTouchpointRepository
      .createQueryBuilder('buddyBuddeeTouchpoint')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddy', 'buddy')
      .leftJoinAndSelect('buddyBuddeeTouchpoint.buddee', 'buddee')
      .where('buddy.id = :buddyId AND buddee.id = :buddeeId', {
        buddyId,
        buddeeId,
      })
      .getMany();
  }

  async saveTouchpoints(touchpoints: BuddyBuddeeTouchpointEntity[]) {
    return this.buddyTouchpointRepository.save(touchpoints);
  }
}
