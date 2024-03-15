import type { MigrationInterface, QueryRunner } from 'typeorm';

import { RoleType } from '../../constants';

const firstAssistantEmail = process.env.ROOT_FIRST_ASSISTANT_EMAIL;
const secondAssistantEmail = process.env.ROOT_SECOND_ASSISTANT_EMAIL;
const roleAssistant = RoleType.ASSISTANT;
const roleAdmin = RoleType.ADMIN;

export class UpdateTableUsersAddRoleAssistant1701307611156
  implements MigrationInterface
{
  name = 'updateTableUsersAddRoleAssistant1701307611156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "users_role_enum" 
        ADD VALUE IF NOT EXISTS 'ASSISTANT';
    `);

    await queryRunner.query(`
        COMMIT;
    `);

    await queryRunner.query(
      `
        UPDATE "users" 
        SET "role" = $1
        WHERE "company_email" IN ($2, $3);
    `,
      [roleAssistant, firstAssistantEmail, secondAssistantEmail],
    );

    await queryRunner.query(`
        ALTER TABLE "users"
        DROP COLUMN IF EXISTS "is_assistant";
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "employee_id" VARCHAR(50) NULL;
    `);

    await queryRunner.query(`
        CREATE TABLE "permissions"
        (
            "id"              SERIAL PRIMARY KEY,
            "user_id"         INT               NOT NULL,
            "role"            users_role_enum   NOT NULL   DEFAULT 'USER',
            "created_at"      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at"      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await queryRunner.query(`
        ALTER TABLE "permissions"
            ADD CONSTRAINT "fk_permissions_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
        INSERT INTO permissions ("user_id", "role")
        SELECT "id", "role"
        FROM users;
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
        DROP COLUMN IF EXISTS "role";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "users_role_enum" 
        DROP VALUE IF EXISTS 'ASSISTANT';
    `);

    await queryRunner.query(
      `
        UPDATE "users" 
        SET "role" = $1
        WHERE "company_email" IN ($2, $3);
    `,
      [roleAdmin, firstAssistantEmail, secondAssistantEmail],
    );

    await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "is_assistant" BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
        DROP COLUMN IF EXISTS "employee_id";
    `);

    await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "role" users_role_enum NOT NULL DEFAULT 'USER';
    `);

    await queryRunner.query(`
        ALTER TABLE "permissions"
        DROP CONSTRAINT IF EXISTS "fk_permissions_users";
    `);

    await queryRunner.query(`
        DROP TABLE IF EXISTS "permissions";
    `);
  }
}
