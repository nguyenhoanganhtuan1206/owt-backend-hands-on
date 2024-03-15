import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnSelectedEducationTable1704425367047
  implements MigrationInterface
{
  name = 'updateColumnSelectedEducationTable1704425367047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "educations"
            ADD COLUMN IF NOT EXISTS "is_selected" BOOLEAN DEFAULT FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "educations"
            DROP COLUMN IF EXISTS "is_selected";
    `);
  }
}
