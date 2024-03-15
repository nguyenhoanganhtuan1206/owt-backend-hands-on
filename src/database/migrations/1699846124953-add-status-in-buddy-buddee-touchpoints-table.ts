import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusInBuddyBuddeeTouchpointsTable1699846124953
  implements MigrationInterface
{
  name = 'addStatusInBuddyBuddeeTouchpointsTable1699846124953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "buddy_buddee_touchpoints"
            ADD COLUMN "status" CHARACTER VARYING;
    `);

    await queryRunner.query(`
        UPDATE "buddy_buddee_touchpoints"
        SET "status" = 'SUBMITTED';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "buddy_buddee_touchpoints"
            DROP COLUMN "status";
    `);
  }
}
