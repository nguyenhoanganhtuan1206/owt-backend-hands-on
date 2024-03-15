import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCertificationTable1705381550848
  implements MigrationInterface
{
  name = 'updateCertificationTable1705381550848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "certifications"
            ALTER COLUMN "credential_id" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "certifications"
            ALTER COLUMN "credential_id" SET NOT NULL;
    `);
  }
}
