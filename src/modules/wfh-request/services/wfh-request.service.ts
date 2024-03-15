import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { DateType, Order, RequestStatusType } from '../../../constants';
import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { CreateWfhRequestDto } from '../dtos/create-wfh-request.dto';
import type { WfhRequestDto } from '../dtos/wfh-request.dto';
import type { WfhRequestsPageOptionsDto } from '../dtos/wfh-requests-page-options.dto';
import { WfhRequestEntity } from '../entities/wfh-request.entity';
import WfhRequestMapper from '../mapper/wfh-request.mapper';
import WfhRequestValidator from '../validators/wfh-request.validator';

@Injectable()
export class WfhRequestService {
  constructor(
    @InjectRepository(WfhRequestEntity)
    private wfhRequestRepository: Repository<WfhRequestEntity>,
    private readonly wfhRequestMapper: WfhRequestMapper,
    private readonly wfhRequestValidator: WfhRequestValidator,
    private readonly s3Service: AwsS3Service,
  ) {}

  async getAllWfhRequests(
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): Promise<PageDto<WfhRequestDto>> {
    const queryBuilder = this.getWfhRequestQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createWfhRequest(
    userId: number,
    createWfhRequestDto: CreateWfhRequestDto,
  ): Promise<WfhRequestDto> {
    this.validateRequestDto(createWfhRequestDto);

    if (createWfhRequestDto.dateType !== DateType.HALF_DAY.toString()) {
      this.wfhRequestValidator.validateWfhRequestTotalDays(
        createWfhRequestDto.dateFrom,
        createWfhRequestDto.dateTo,
        createWfhRequestDto.totalDays,
      );
    }

    const wfhRequestEntity = await this.wfhRequestMapper.toWfhRequestEntity(
      userId,
      createWfhRequestDto,
    );
    wfhRequestEntity.status = RequestStatusType.PENDING;

    const createdWfhEntity =
      await this.wfhRequestRepository.save(wfhRequestEntity);

    return createdWfhEntity.toDto();
  }

  @Transactional()
  async deleteWfhRequest(userId: number, wfhRequestId: number): Promise<void> {
    const wfhRequestEntity = await this.findWfhRequestByIdAndUserId(
      userId,
      wfhRequestId,
    );

    this.wfhRequestValidator.validateWfhRequestIsPending(
      wfhRequestEntity.status,
    );

    if (wfhRequestEntity.attachedFile) {
      await this.s3Service.deleteFile(wfhRequestEntity.attachedFile);
    }

    await this.wfhRequestRepository.remove(wfhRequestEntity);
  }

  async getWfhRequestDetails(
    userId: number,
    wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    const wfhRequestEntity = await this.findWfhRequestByIdAndUserId(
      userId,
      wfhRequestId,
    );

    return wfhRequestEntity.toDto();
  }

  @Transactional()
  async approveWfhRequest(wfhRequestId: number): Promise<WfhRequestDto> {
    const wfhRequestEntity = await this.findWfhRequestById(wfhRequestId);

    wfhRequestEntity.status = RequestStatusType.APPROVED;

    const updateWfhEntity =
      await this.wfhRequestRepository.save(wfhRequestEntity);

    return updateWfhEntity.toDto();
  }

  @Transactional()
  async refuseWfhRequest(wfhRequestId: number): Promise<WfhRequestDto> {
    const wfhRequestEntity = await this.findWfhRequestById(wfhRequestId);

    wfhRequestEntity.status = RequestStatusType.REFUSED;

    const updateWfhEntity =
      await this.wfhRequestRepository.save(wfhRequestEntity);

    return updateWfhEntity.toDto();
  }

  @Transactional()
  async attachFileRequest(userId: number, requestId: number, url: string) {
    const wfhRequest = await this.findWfhRequestByIdAndUserId(
      userId,
      requestId,
    );

    wfhRequest.attachedFile = url;
    await this.wfhRequestRepository.save(wfhRequest);
  }

  async getPendingWfhRequestsCount(): Promise<number> {
    const queryBuilderWfh = this.wfhRequestRepository
      .createQueryBuilder('wfhRequest')
      .where('wfhRequest.status = :status', {
        status: RequestStatusType.PENDING,
      });

    return queryBuilderWfh.getCount();
  }

  async getPendingWfhRequestsCountForUser(userId: number): Promise<number> {
    const queryBuilderWfhRequest = this.wfhRequestRepository
      .createQueryBuilder('wfhRequest')
      .where('wfhRequest.status = :status', {
        status: RequestStatusType.PENDING,
      })
      .andWhere('wfhRequest.user_id = :userId', { userId });

    return queryBuilderWfhRequest.getCount();
  }

  private validateRequestDto(createWfhRequestDto: CreateWfhRequestDto) {
    this.wfhRequestValidator.validateWfhRequestDate(
      createWfhRequestDto.dateFrom,
      createWfhRequestDto.dateTo,
      createWfhRequestDto.dateType,
    );
  }

  private getWfhRequestQueryBuilder(
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): SelectQueryBuilder<WfhRequestEntity> {
    const { userIds, dateFrom, dateTo, statuses } = pageOptionsDto;

    const queryBuilder = this.wfhRequestRepository
      .createQueryBuilder('wfhRequest')
      .addSelect(
        "CASE WHEN (wfhRequest.status = 'PENDING') THEN 3 " +
          "WHEN (wfhRequest.status = 'APPROVED') THEN 2 " +
          "WHEN (wfhRequest.status = 'REFUSED') THEN 1 " +
          'ELSE 0 END ',
        'status_order',
      )
      .leftJoinAndSelect('wfhRequest.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions');

    if (userIds?.length) {
      queryBuilder.andWhere('wfhRequest.user.id in (:...userIds)', { userIds });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        `(
            (wfhRequest.date_from BETWEEN :dateFrom AND :dateTo) OR
            (wfhRequest.date_to BETWEEN :dateFrom AND :dateTo) OR
            (:dateFrom > wfhRequest.date_from AND :dateTo < wfhRequest.date_to) OR
            (:dateFrom < wfhRequest.date_from AND :dateTo > wfhRequest.date_to)
        )`,
        {
          dateFrom,
          dateTo,
        },
      );
    }

    if (statuses?.length) {
      queryBuilder.andWhere('wfhRequest.status IN (:...statuses)', {
        statuses,
      });
    }

    queryBuilder.orderBy('status_order', Order.DESC);
    queryBuilder.addOrderBy('wfhRequest.dateFrom', Order.DESC);
    queryBuilder.addOrderBy('wfhRequest.createdAt', Order.DESC);

    return queryBuilder;
  }

  private async findWfhRequestByIdAndUserId(
    userId: number,
    wfhRequestId: number,
  ): Promise<WfhRequestEntity> {
    const wfhRequest = await this.wfhRequestRepository.findOne({
      where: {
        id: wfhRequestId,
        user: { id: userId },
      },
    });

    if (!wfhRequest) {
      throw new InvalidNotFoundException(ErrorCode.WFH_REQUEST_NOT_FOUND);
    }

    return wfhRequest;
  }

  private async findWfhRequestById(
    requestId: number,
  ): Promise<WfhRequestEntity> {
    const wfhRequestEntity = await this.wfhRequestRepository.findOneBy({
      id: requestId,
    });

    if (!wfhRequestEntity) {
      throw new InvalidNotFoundException(ErrorCode.WFH_REQUEST_NOT_FOUND);
    }

    return wfhRequestEntity;
  }
}
