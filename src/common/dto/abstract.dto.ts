import { ApiProperty } from '@nestjs/swagger';

import { DYNAMIC_TRANSLATION_DECORATOR_KEY } from '../../decorators';
import { ContextProvider, DateProvider } from '../../providers';
import type { AbstractEntity } from '../abstract.entity';

export class AbstractDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  translations?: AbstractTranslationDto[];

  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      this.id = entity.id;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (entity.createdAt) {
        this.createdAt = DateProvider.formatDateUTC(entity.createdAt);
      }

      this.updatedAt = entity.updatedAt;
    }

    const languageCode = ContextProvider.getLanguage();

    if (languageCode && entity.translations) {
      const translationEntity = entity.translations.find(
        (titleTranslation) => titleTranslation.languageCode === languageCode,
      )!;

      const fields: Record<string, string> = {};

      for (const key of Object.keys(translationEntity)) {
        const metadata = Reflect.getMetadata(
          DYNAMIC_TRANSLATION_DECORATOR_KEY,
          this,
          key,
        );

        if (metadata) {
          fields[key] = translationEntity[key];
        }
      }

      Object.assign(this, fields);
    } else {
      this.translations = entity.translations?.toDtos();
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractEntity) {
    super(entity, { excludeFields: true });
  }
}
