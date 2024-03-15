import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnSelectedUserSkillTable1704274704879
  implements MigrationInterface
{
  name = 'UpdateColumnSelectedUserSkillTable1704274704879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user_skills"
            ADD COLUMN IF NOT EXISTS "is_selected" BOOLEAN DEFAULT TRUE;
    `);

    await queryRunner.query(`
        UPDATE "user_skills"
        SET "is_selected" = TRUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user_skills"
            DROP COLUMN IF EXISTS "is_selected";
    `);
  }
}
