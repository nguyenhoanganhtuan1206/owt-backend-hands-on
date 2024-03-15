import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TableUserAddFieldCustomPosition1705647275252
  implements MigrationInterface
{
  name: 'tableUserAddFieldCustomPosition1705647275252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN "custom_position" VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "custom_position"
    `);
  }
}
