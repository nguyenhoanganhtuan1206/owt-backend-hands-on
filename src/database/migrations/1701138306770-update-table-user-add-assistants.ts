import type { MigrationInterface, QueryRunner } from 'typeorm';

import { generateHash } from '../../common/utils';
import { ContractType, GenderType, RoleType } from '../../constants';

const firstAssistantEmail = process.env.ROOT_FIRST_ASSISTANT_EMAIL;
const secondAssistantEmail = process.env.ROOT_SECOND_ASSISTANT_EMAIL;

export class UpdateTableUserAddAssistants1701138306770
  implements MigrationInterface
{
  name = 'updateTableUserAddAssistants1701138306770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const firstAssistantPassword = generateHash(
      process.env.ROOT_FIRST_ASSISTANT_PASSWORD as string,
    );
    const secondAssistantPassword = generateHash(
      process.env.ROOT_SECOND_ASSISTANT_PASSWORD as string,
    );
    const gender = GenderType.MALE;
    const role = RoleType.ADMIN;
    const contract = ContractType.FULLTIME;

    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "is_assistant" BOOLEAN DEFAULT FALSE;
    `);

    const adminPositionId = await queryRunner.query(
      'SELECT id FROM positions WHERE name = $1 LIMIT 1',
      ['Admin'],
    );

    if (adminPositionId.length > 0) {
      const positionId = adminPositionId[0].id;

      await queryRunner.query(
        `INSERT INTO users (company_email, password, gender, role, contract_type, position_id, first_login, is_assistant) VALUES 
            ($1, $2, $3, $4, $5, $6, false, true),
            ($7, $8, $3, $4, $5, $6, false, true)`,
        [
          firstAssistantEmail,
          firstAssistantPassword,
          gender,
          role,
          contract,
          positionId,
          secondAssistantEmail,
          secondAssistantPassword,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE company_email IN ($1, $2)`,
      [firstAssistantEmail, secondAssistantEmail],
    );

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "is_assistant";
    `);
  }
}
