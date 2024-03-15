import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEducationConstraint1704360157336
  implements MigrationInterface
{
  name = 'updateEducationConstraint1704360157336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "educations"
            DROP CONSTRAINT IF EXISTS "uq_educations_user_position";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "educations"
            ADD CONSTRAINT "uq_educations_user_position" UNIQUE ("user_id", "position");
    `);
  }
}
