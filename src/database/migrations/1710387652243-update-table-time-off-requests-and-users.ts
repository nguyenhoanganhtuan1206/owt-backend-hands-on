/* eslint-disable no-await-in-loop */
import type { MigrationInterface, QueryRunner } from 'typeorm';

const currentYear = new Date().getFullYear();
const lastYear = currentYear - 1;
const dateFrom = `${currentYear}-01-01`;
const dateTo = `${currentYear}-01-31`;
const details = `From last year ${lastYear}`;

export class UpdateTableTimeOffRequestsAndUsers1710387652243
  implements MigrationInterface
{
  name = 'updateTableTimeOffRequestsAndUsers1710387652243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
            DROP COLUMN IF EXISTS "last_year_balance";
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            DROP COLUMN IF EXISTS "balance_status";
    `);

    await queryRunner.query(`
        ALTER TYPE "attendance_status_enum"
            ADD VALUE IF NOT EXISTS 'BALANCE';
    `);

    await queryRunner.query(`
        COMMIT;
    `);

    const usersWithBalance = await queryRunner.query(`
        SELECT u.id
        FROM users u
        LEFT JOIN attendance_time_off_requests atr ON u.id = atr.user_id AND atr.status = 'BALANCE'
        WHERE atr.id IS NULL
    `);

    for (const user of usersWithBalance) {
      await queryRunner.query(
        `
        INSERT INTO attendance_time_off_requests (user_id, date_from, date_to, date_type, total_days, details, status)
        VALUES ($1, $2::timestamp, $3::timestamp, $4, $5, $6, $7)
        `,
        [user.id, dateFrom, dateTo, 'FULL_DAY', 0, details, 'BALANCE'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "last_year_balance";
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD COLUMN IF NOT EXISTS "balance_status";
    `);

    await queryRunner.query(`
        ALTER TYPE "attendance_status_enum"
            DROP VALUE IF EXISTS 'BALANCE';
    `);

    await queryRunner.query(`s
        DELETE FROM attendance_time_off_requests
        WHERE status = 'BALANCE'
    `);
  }
}
