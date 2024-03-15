import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EmploymentHistoryTableFixForeignKeyNameWithUserTable1706686601685
  implements MigrationInterface
{
  name = 'employmentHistoryTableFixForeignKeyNameWithUserTable1706686601685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employment_histories" DROP CONSTRAINT "employment_histories_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_histories" ADD CONSTRAINT "employment_histories_user_id_fkey" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employment_histories" DROP CONSTRAINT "employment_histories_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_histories" ADD CONSTRAINT "employment_histories_user_id_fkey" 
          FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
