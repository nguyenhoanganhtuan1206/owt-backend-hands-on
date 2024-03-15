import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableRelatedMySkill1703035983793
  implements MigrationInterface
{
  name = 'createTableRelatedMySkill1703035983793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "skill_groups"
        (
            "id"         SERIAL PRIMARY KEY,
            "name"       VARCHAR(255) NOT NULL,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "skills"
        (
            "id"               SERIAL PRIMARY KEY,
            "name"             VARCHAR(255) NOT NULL,
            "skill_group_id"   INT NOT NULL,
            "created_at"       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "skills"
            ADD CONSTRAINT "fk_skills_skill_group_id" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups" ("id") ON DELETE RESTRICT;
      `);
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "user_skills"
        (
            "id"          SERIAL PRIMARY KEY,
            "user_id"     INT NOT NULL,
            "skill_id"    INT NOT NULL,
            "level"       INT NOT NULL DEFAULT 0,
            "created_at"  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "user_skills"
            ADD CONSTRAINT "fk_user_skills_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT,
            ADD CONSTRAINT "fk_user_skills_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") ON DELETE RESTRICT;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "skills"
            DROP CONSTRAINT IF EXISTS "fk_skills_skill_group_id";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "skills";
    `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "skill_groups";
    `);
    await queryRunner.query(`
        ALTER TABLE "user_skills"
            DROP CONSTRAINT IF EXISTS "fk_user_skills_user_id",
            DROP CONSTRAINT IF EXISTS "fk_user_skills_skill_id";
   `);
    await queryRunner.query(`
        DROP TABLE IF EXISTS "user_skills";
    `);
  }
}
