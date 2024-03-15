import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableUsersAndAttendanceTimeOffRequests1710146474438
  implements MigrationInterface
{
  name = 'updateTableUsersAndAttendanceTimeOffRequests1710146474438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
            RENAME COLUMN "allowance" TO "yearly_allowance";
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
            ADD COLUMN "last_year_balance" INT DEFAULT 0 NOT NULL;
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD COLUMN "balance_status" VARCHAR(256) DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
            RENAME COLUMN "yearly_allowance" TO "allowance";
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
            DROP COLUMN "last_year_balance";
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            DROP COLUMN "balance_status";
    `);
  }
}
