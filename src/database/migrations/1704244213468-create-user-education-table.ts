import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserEducationTable1704244213468
  implements MigrationInterface
{
  name = 'createUserEducationTable1704244213468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "educations"
        (
            "id"               SERIAL PRIMARY KEY,
            "user_id"          INT NOT NULL,
            "institution"      VARCHAR(256) NOT NULL,
            "degree"           VARCHAR(256) NOT NULL,
            "date_from"        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "date_to"          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "position"         INT UNIQUE,
            "created_at"       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await queryRunner.query(`
        ALTER TABLE "educations"
            ADD CONSTRAINT "fk_educations_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users"
            DROP CONSTRAINT IF EXISTS "fk_educations_user_id";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "educations";
    `);
  }
}
