import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ExperienceTableFixForeignKeyName1706597578817
  implements MigrationInterface
{
  name = 'experienceTableFixForeignKeyName1706597578817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "experiences" DROP CONSTRAINT "experiences_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "experiences" ADD CONSTRAINT "experiences_user_id_fkey" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "experiences" DROP CONSTRAINT "experiences_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "experiences" ADD CONSTRAINT "experiences_user_id_fkey" 
          FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
