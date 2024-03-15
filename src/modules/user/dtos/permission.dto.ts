import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { RoleType } from '../../../constants';
import type { PermissionEntity } from '../entities/permission.entity';

export class PermissionDto extends AbstractDto {
  @ApiProperty({ enum: RoleType })
  role: RoleType;

  constructor(permissionEntity: PermissionEntity) {
    super(permissionEntity);
    this.role = permissionEntity.role;
  }
}
