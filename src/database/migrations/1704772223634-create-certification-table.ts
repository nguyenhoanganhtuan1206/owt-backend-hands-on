import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificationTable1704772223634
  implements MigrationInterface
{
  name = 'createCertificationTable1704772223634';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "certifications"
        (
            "id"                    SERIAL PRIMARY KEY,
            "user_id"               INT NOT NULL,
            "name"                  VARCHAR(256) NOT NULL,
            "issuing_organisation"  VARCHAR(256) NOT NULL,
            "issue_date"            TIMESTAMP,
            "expiration_date"       TIMESTAMP,
            "credential_id"         VARCHAR(256) NOT NULL,
            "credential_url"        TEXT,
            "position"              INTEGER NOT NULL DEFAULT 0,
            "is_selected"           BOOLEAN NOT NULL DEFAULT false,
            "created_at"            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await queryRunner.query(`
        ALTER TABLE "certifications"
            ADD CONSTRAINT "fk_certifications_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "certifications"
            DROP CONSTRAINT IF EXISTS "fk_certifications_user_id";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "certifications";
    `);
  }
}
