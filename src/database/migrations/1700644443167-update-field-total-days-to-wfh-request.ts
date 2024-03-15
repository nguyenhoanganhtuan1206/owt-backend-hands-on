import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFieldTotalDaysToWfhRequest1700644443167
  implements MigrationInterface
{
  name = 'updateFieldTotalDaysToWfhRequest1700644443167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
        ALTER COLUMN "total_days" TYPE FLOAT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_wfh_requests"
        ALTER COLUMN "total_days" TYPE INT;
    `);
  }
}
