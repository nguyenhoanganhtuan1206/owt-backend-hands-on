import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTableAttendace1706867448498 implements MigrationInterface {
  name = 'removeTableAttendace1706867448498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "fk_attendance_user"`,
    );

    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "fk_attendance_time_off"`,
    );

    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "fk_attendance_wfh"`,
    );

    await queryRunner.query('DROP TABLE IF EXISTS "attendances"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "attendances"
        (
            "id"                  SERIAL PRIMARY KEY,
            "user_id"             INT       NOT NULL,
            "check_in"            TIMESTAMP NOT NULL,
            "check_out"           TIMESTAMP NOT NULL,
            "time_off_request_id" INT,
            "wfh_request_id"      INT,
            "created_at"          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await queryRunner.query(`
    ALTER TABLE "attendances"
      ADD CONSTRAINT "fk_attendance_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
    ALTER TABLE "attendances"
      ADD CONSTRAINT "fk_attendance_time_off" FOREIGN KEY ("time_off_request_id") REFERENCES "attendance_time_off_requests" ("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
    ALTER TABLE "attendances"
      ADD CONSTRAINT "fk_attendance_wfh" FOREIGN KEY ("wfh_request_id") REFERENCES "attendance_wfh_requests" ("id") ON DELETE RESTRICT
    `);
  }
}
