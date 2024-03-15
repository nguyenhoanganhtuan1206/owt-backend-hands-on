import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExperienceTable1704444158414 implements MigrationInterface {
  name = 'createExperienceTable1704444158414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "experiences" (
        "id"                            SERIAL NOT NULL, 
        "created_at"                    TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at"                    TIMESTAMP NOT NULL DEFAULT now(), 
        "project_name"                  VARCHAR(256) NOT NULL, 
        "date_from"                     DATE NOT NULL, 
        "date_to"                       DATE, 
        "domain"                        VARCHAR(256) NOT NULL, 
        "description"                   VARCHAR(1024) NOT NULL, 
        "roles_and_responsibilities"    TEXT NOT NULL, 
        "position"                      INTEGER NOT NULL DEFAULT 0,
        "is_selected"                   BOOLEAN NOT NULL DEFAULT false,
        "user_id"                       INTEGER NOT NULL,
        "is_currently_working"          BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "experience_id_pkey" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "experience_skills" (
        "id"                SERIAL NOT NULL, 
        "created_at"        TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at"        TIMESTAMP NOT NULL DEFAULT now(), 
        "experience_id"     INTEGER NOT NULL, 
        "skill_id"          INTEGER NOT NULL, 
        CONSTRAINT "experience_skills_id_pkey" PRIMARY KEY ("experience_id", "skill_id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "experiences" ADD CONSTRAINT "experiences_user_id_fkey" 
        FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX "experience_skills_experience_index" ON "experience_skills" ("experience_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "experience_skills_skill_index" ON "experience_skills" ("skill_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_experience_id_fkey" 
      FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_skill_id_fkey" 
      FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "experience_skills" DROP CONSTRAINT "experience_skills_skill_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "experience_skills" DROP CONSTRAINT "experience_skills_experience_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "experiences" DROP CONSTRAINT "experiences_user_id_fkey"`,
    );
    await queryRunner.query(`DROP TABLE "experience_skills"`);
    await queryRunner.query(`DROP TABLE "experiences"`);
  }
}
