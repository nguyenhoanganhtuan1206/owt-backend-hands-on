import type {
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';

import { generateHash } from '../common/utils';
import { UserEntity } from '../modules/user/entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo(): typeof UserEntity {
    return UserEntity;
  }

  beforeInsert(event: InsertEvent<UserEntity>): void {
    if (event.entity.password) {
      event.entity.password = generateHash(event.entity.password);
    }
  }

  beforeUpdate(event: UpdateEvent<UserEntity>): void {
    // FIXME check event.databaseEntity.password
    const entity = event.entity as UserEntity;

    if (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      event.databaseEntity &&
      entity.password &&
      entity.password !== event.databaseEntity.password
    ) {
      entity.password = generateHash(entity.password);
    }
  }
}
