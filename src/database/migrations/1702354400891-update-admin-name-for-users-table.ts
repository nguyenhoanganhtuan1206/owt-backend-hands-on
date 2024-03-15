import type { MigrationInterface, QueryRunner } from 'typeorm';

const rootAdminEmail = process.env.ROOT_USER_EMAIL;
const firstAssistantEmail = process.env.ROOT_FIRST_ASSISTANT_EMAIL;
const secondAssistantEmail = process.env.ROOT_SECOND_ASSISTANT_EMAIL;

export class UpdateAdminNameForUsersTable1702354400891
  implements MigrationInterface
{
  name = 'updateAdminNameForUsersTable1702354400891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE users SET first_name = $1, last_name = $2 WHERE company_email = $3`,
      ['Admin', 'EmployeeApp', rootAdminEmail],
    );

    await queryRunner.query(
      `UPDATE users SET first_name = $1, last_name = $2 WHERE company_email = $3`,
      ['Assistant01', 'EmployeeApp', firstAssistantEmail],
    );

    await queryRunner.query(
      `UPDATE users SET first_name = $1, last_name = $2 WHERE company_email = $3`,
      ['Assistant02', 'EmployeeApp', secondAssistantEmail],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE users SET first_name = NULL, last_name = NULL WHERE company_email IN ($1, $2, $3)`,
      [rootAdminEmail, firstAssistantEmail, secondAssistantEmail],
    );
  }
}
