import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TableUserAddFieldIntroduction1704188150373
  implements MigrationInterface
{
  name = 'tableUserAddFieldIntroduction1704188150373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN "introduction" VARCHAR(1024)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "introduction"
    `);
  }
}
