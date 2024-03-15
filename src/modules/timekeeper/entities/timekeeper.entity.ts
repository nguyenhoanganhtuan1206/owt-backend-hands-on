import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import {
  TimeKeeperDeviceName,
  TimeKeeperState,
  TimeKeeperType,
} from '../../../constants';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { TimeKeeperDto } from '../dtos/timekeeper.dto';

@Entity({ name: 'timekeepers' })
@UseDto(TimeKeeperDto)
export class TimeKeeperEntity extends AbstractEntity<TimeKeeperDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  timekeeperUserId: number;

  @Column({ type: 'timestamp' })
  time: Date;

  @Column()
  state: TimeKeeperState;

  @Column()
  type: TimeKeeperType;

  @Column()
  deviceName: TimeKeeperDeviceName;
}
