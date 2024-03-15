import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { TouchpointStatus } from '../../../constants/touchpoint-status';
import UserMapper from '../../user/mappers/user.mapper';
import type { CreateBuddyBuddeeTouchpointRequestDto } from '../dtos/create-buddy-buddee-touchpoint-request.dto';
import type { UpdateBuddyBuddeeTouchpointRequestDto } from '../dtos/update-buddy-buddee-touchpoint-request.dto';
import { BuddyBuddeeTouchpointEntity } from '../entities/buddy-buddee-touchpoint.entity';

@Injectable()
export default class BuddyBuddeeTouchpointMapper {
  constructor(
    @Inject(forwardRef(() => UserMapper))
    private readonly userMapper: UserMapper,
    @InjectRepository(BuddyBuddeeTouchpointEntity)
    private readonly touchpointRepository: Repository<BuddyBuddeeTouchpointEntity>,
  ) {}

  async toBuddyBuddeeTouchpointEntity(
    buddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
    status: TouchpointStatus,
  ): Promise<BuddyBuddeeTouchpointEntity> {
    const { buddyId, buddeeId } = buddyBuddeeTouchpointRequestDto;
    const buddyTouchpointEntity = plainToInstance(
      BuddyBuddeeTouchpointEntity,
      buddyBuddeeTouchpointRequestDto,
    );

    buddyTouchpointEntity.buddy =
      await this.userMapper.toUserEntityFromId(buddyId);
    buddyTouchpointEntity.buddee =
      await this.userMapper.toUserEntityFromId(buddeeId);
    buddyTouchpointEntity.status = status;

    return buddyTouchpointEntity;
  }

  async toDraftBuddyBuddeeTouchpointEntity(
    id: number,
    buddyBuddeeTouchpointRequestDto: UpdateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointEntity> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { note, visible } = buddyBuddeeTouchpointRequestDto;
    const touchpointEntity = await this.touchpointRepository.findOneBy({
      id,
      status: TouchpointStatus.DRAFT,
    });

    if (!touchpointEntity) {
      throw new NotFoundException(
        `Buddy Buddee Touchpoint Draft with ID '${id}' not found`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (note) {
      touchpointEntity.note = note;
    }

    touchpointEntity.visible = visible;

    return touchpointEntity;
  }
}
