import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { RoleType } from '../../../constants';
import { UseDto } from '../../../decorators';
import { PermissionDto } from '../dtos/permission.dto';
import { UserEntity } from './user.entity';

@Entity({ name: 'permissions' })
@UseDto(PermissionDto)
export class PermissionEntity extends AbstractEntity<PermissionDto> {
  @ManyToOne(() => UserEntity, (user) => user.permissions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role: RoleType;
}
