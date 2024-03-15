import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAttendanceTimeOffRequestTable1701140245191
  implements MigrationInterface
{
  name = 'updateAttendanceTimeOffRequestTable1701140245191';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
        ADD COLUMN "assistant_attach_file" TEXT;

        ALTER TABLE "attendance_time_off_requests"
        ALTER COLUMN "attached_file" TYPE TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
        DROP COLUMN "assistant_attach_file";

        ALTER TABLE "attendance_time_off_requests"
        ALTER COLUMN "attached_file" TYPE VARCHAR(1024);
    `);
  }
}
