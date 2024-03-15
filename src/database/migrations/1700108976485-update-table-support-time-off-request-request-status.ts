import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableSupportTimeOffRequestRequestStatus1700108976485
  implements MigrationInterface
{
  name = 'updateTableSupportTimeOffRequestRequestStatus1700108976485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "attendance_status_enum"
        RENAME VALUE 'REJECTED' TO 'REFUSED';

        ALTER TYPE "attendance_status_enum"
        ADD VALUE 'PROCESSING';
    `);

    await queryRunner.query(`
        ALTER TYPE "repair_request_status_enum"
        RENAME VALUE 'REJECTED' TO 'REFUSED';
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
        RENAME COLUMN "total_hours" TO "total_days";

        ALTER TABLE "attendance_time_off_requests"
        ALTER COLUMN "total_days" TYPE FLOAT;

        UPDATE "attendance_time_off_requests"
        SET "total_days" = "total_days" / 8;

        ALTER TABLE "attendance_time_off_requests"
        ALTER COLUMN "details" TYPE TEXT;
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
        RENAME COLUMN "total_hours" TO "total_days";

        ALTER TABLE "attendance_time_off_requests"
        ALTER COLUMN "total_days" TYPE FLOAT;

        UPDATE "attendance_wfh_requests"
        SET "total_days" = "total_days" / 8;

        ALTER TABLE "attendance_wfh_requests"
        ALTER COLUMN "details" TYPE TEXT;
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD COLUMN "pm_name"        VARCHAR(255),
            ADD COLUMN "pm_mail"        VARCHAR(255),
            ADD COLUMN "assistant_mail" VARCHAR(255),
            ADD COLUMN "note"           TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            DROP COLUMN "pm_name",
            DROP COLUMN "pm_mail",
            DROP COLUMN "assistant_mail",
            DROP COLUMN "note";
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
        RENAME COLUMN "total_days" TO "total_hours";

        UPDATE "attendance_time_off_requests"
        SET "total_hours" = "total_hours" * 8;

        ALTER TABLE "attendance_time_off_requests"
        ALTER COLUMN "total_hours" TYPE INT;

        ALTER TABLE "attendance_time_off_requests"
        ALTER COLUMN "details" TYPE VARCHAR(1024);
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
        RENAME COLUMN "total_days" TO "total_hours";

        UPDATE "attendance_wfh_requests"
        SET "total_hours" = "total_hours" * 8;

        ALTER TABLE "attendance_wfh_requests"
        ALTER COLUMN "total_hours" TYPE INT;

        ALTER TABLE "attendance_wfh_requests"
        ALTER COLUMN "details" TYPE VARCHAR(1024);
    `);

    await queryRunner.query(`
        ALTER TYPE "repair_request_status_enum"
        RENAME VALUE 'REFUSED' TO 'REJECTED';
    `);

    await queryRunner.query(`
        ALTER TYPE "attendance_status_enum"
        RENAME VALUE 'REFUSED' TO 'REJECTED';

        ALTER TYPE "attendance_status_enum"
        DROP VALUE 'PROCESSING';
    `);
  }
}
