import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableTimekeeper1704350893228 implements MigrationInterface {
  name = 'createTableTimekeeper1704350893228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "timekeeper_user_id" INT;
        `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "timekeepers"
        (
            "id"                  SERIAL PRIMARY KEY,
            "user_id"             INT         NOT NULL,
            "timekeeper_user_id"  INT         NOT NULL,
            "time"                TIMESTAMP   NOT NULL,
            "state"               VARCHAR(20) NOT NULL,
            "type"                VARCHAR(20) NOT NULL,
            "device_name"         VARCHAR(50) NOT NULL,
            "created_at"          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await queryRunner.query(`
        ALTER TABLE "timekeepers"
            ADD CONSTRAINT "fk_timekeepers_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "timekeepers"
            DROP CONSTRAINT IF EXISTS "fk_timekeepers_user_id";
    `);

    await queryRunner.query(`
        DROP TABLE IF EXISTS "timekeepers";
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
            DROP COLUMN IF EXISTS "timekeeper_user_id";
    `);
  }
}
