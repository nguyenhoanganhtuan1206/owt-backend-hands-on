import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableTimeOffRequestAddPmNote1701078989665
  implements MigrationInterface
{
  name = 'updateTableTimeOffRequestAddPmNote1701078989665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "attendance_time_off_requests"
        ADD COLUMN "pm_note" VARCHAR(512) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "attendance_time_off_requests"
        RENAME COLUMN "note" TO "admin_note";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "attendance_time_off_requests"
        RENAME COLUMN "admin_note" TO "note";
    `);

    await queryRunner.query(`
      ALTER TABLE "attendance_time_off_requests"
        DROP COLUMN IF EXISTS "pm_note";
    `);
  }
}
