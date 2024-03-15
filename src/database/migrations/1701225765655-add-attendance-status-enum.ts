import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceStatusEnum1701225765655
  implements MigrationInterface
{
  name = 'addAttendanceStatusEnum1701225765655';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "attendance_status_enum"
        ADD VALUE IF NOT EXISTS 'ASSISTANT';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "attendance_status_enum"
        DROP VALUE IF EXISTS 'ASSISTANT';
    `);
  }
}
