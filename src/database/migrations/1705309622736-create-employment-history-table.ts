import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmploymentHistoryTable1705309622736
  implements MigrationInterface
{
  name = 'createEmploymentHistoryTable1705309622736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employment_histories" (
        "id"                            SERIAL NOT NULL, 
        "created_at"                    TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at"                    TIMESTAMP NOT NULL DEFAULT now(), 
        "company"                       VARCHAR(256) NOT NULL, 
        "date_from"                     DATE NOT NULL, 
        "date_to"                       DATE, 
        "position"                      INTEGER NOT NULL DEFAULT 0,
        "is_selected"                   BOOLEAN NOT NULL DEFAULT false,
        "user_id"                       INTEGER NOT NULL,
        "is_currently_working"          BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "employment_histories_id_pkey" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_histories" ADD CONSTRAINT "employment_histories_user_id_fkey" 
        FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employment_histories" DROP CONSTRAINT "employment_histories_user_id_fkey"`,
    );
    await queryRunner.query(`DROP TABLE "employment_histories"`);
  }
}
