import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateValueCvAndPhotoForUsersTable1701337256941
  implements MigrationInterface
{
  name = 'updateValueCvAndPhotoForUsersTable1701337256941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "photo" TYPE TEXT;
    `);

    await queryRunner.query(`
        ALTER TABLE "user_cvs"
        ALTER COLUMN "cv" TYPE TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user_cvs"
        ALTER COLUMN "cv" TYPE VARCHAR(1024);
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "photo" TYPE VARCHAR(1024);
    `);
  }
}
