import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateConstraintEducationTable1704264050164
  implements MigrationInterface
{
  name = 'updateConstraintEducationTable1704264050164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "educations"
            DROP COLUMN IF EXISTS "position";
    `);
    await queryRunner.query(`
        ALTER TABLE "educations"
            ADD COLUMN IF NOT EXISTS "position" INT;
    `);

    await queryRunner.query(`
        ALTER TABLE "educations"
            ADD CONSTRAINT "uq_educations_user_position" UNIQUE ("user_id", "position");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "educations"
            DROP CONSTRAINT IF EXISTS "uq_educations_user_position";
        `);
    await queryRunner.query(`
        ALTER TABLE "educations"
            ADD CONSTRAINT "uq_educations_position" UNIQUE ("position");
    `);
  }
}
