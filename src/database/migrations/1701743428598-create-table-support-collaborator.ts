import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableSupportCollaborator1701743428598
  implements MigrationInterface
{
  name = 'createTableSupportCollaborator1701743428598';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "time_off_collaborators"
        (
            "id"                             SERIAL PRIMARY KEY,
            "employee_id"                    VARCHAR(50) NOT NULL,
            "collaborator_email"             VARCHAR(255) NOT NULL,
            "collaborator_first_name"        VARCHAR(255) NOT NULL,
            "collaborator_last_name"         VARCHAR(255) NOT NULL,
            "start_date"                     TIMESTAMP,
            "end_date"                       TIMESTAMP,
            "created_at"                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "time_off_collaborators"
    `);
  }
}
