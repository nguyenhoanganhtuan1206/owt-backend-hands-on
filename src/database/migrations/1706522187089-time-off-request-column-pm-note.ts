import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeOffRequestColumnPmNote1706522187089
  implements MigrationInterface
{
  name: 'timeOffRequestColumnPmNote1706522187089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ALTER COLUMN "pm_note" TYPE TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ALTER COLUMN "pm_note" TYPE VARCHAR(512);
    `);
  }
}
