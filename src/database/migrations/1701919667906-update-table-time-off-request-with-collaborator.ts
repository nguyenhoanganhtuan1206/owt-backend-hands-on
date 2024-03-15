import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableTimeOffRequestWithCollaborator1701919667906
  implements MigrationInterface
{
  name = 'updateTableTimeOffRequestWithCollaborator1701919667906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            DROP COLUMN "pm_name",
            DROP COLUMN "pm_mail",
            DROP COLUMN "assistant_mail"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD COLUMN "collaborator_id" INT,
            ADD COLUMN "assistant_id" INT
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD CONSTRAINT "fk_collaborator_time_off" FOREIGN KEY ("collaborator_id") REFERENCES "time_off_collaborators" ("id") ON DELETE RESTRICT,
            ADD CONSTRAINT "fk_assistant_time_off" FOREIGN KEY ("assistant_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            DROP CONSTRAINT "fk_collaborator_time_off",
            DROP CONSTRAINT "fk_assistant_time_off",
            DROP COLUMN "collaborator_id",
            DROP COLUMN "assistant_id"
    `);

    await queryRunner.query(`
        ALTER TABLE "attendance_time_off_requests"
            ADD COLUMN "pm_name" VARCHAR(255),
            ADD COLUMN "pm_mail" VARCHAR(255),
            ADD COLUMN "assistant_mail" VARCHAR(255)
    `);
  }
}
