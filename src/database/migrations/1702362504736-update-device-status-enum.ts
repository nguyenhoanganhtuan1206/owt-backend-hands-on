import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDeviceStatusEnum1702362504736 implements MigrationInterface {
  name = 'updateDeviceStatusEnum1702362504736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "device_status_enum"
            ADD VALUE IF NOT EXISTS 'HEALTHY';
    `);
    await queryRunner.query(`
        COMMIT;
    `);
    await queryRunner.query(`
        ALTER TYPE "device_status_enum" RENAME TO "device_status_enum_old";
    `);
    await queryRunner.query(`
        CREATE TYPE "device_status_enum" AS ENUM('HEALTHY', 'IN_REPAIR', 'SCRAPPED');
    `);
    await queryRunner.query(`
        UPDATE "devices"
            SET "status" = 'HEALTHY'
            WHERE "status" IN ('ASSIGNED', 'AVAILABLE');
    `);
    await queryRunner.query(`
        ALTER TABLE "devices"
            ALTER COLUMN "status" TYPE "device_status_enum" USING "status"::text::"device_status_enum";
    `);
    await queryRunner.query(`
        DROP TYPE "device_status_enum_old";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "device_status_enum"
            ADD VALUE IF NOT EXISTS 'AVAILABLE';
    `);
    await queryRunner.query(`
        ALTER TYPE "device_status_enum"
            ADD VALUE IF NOT EXISTS 'ASSIGNED';
    `);
    await queryRunner.query(`
        COMMIT;
    `);
    await queryRunner.query(`
        ALTER TYPE "device_status_enum" RENAME TO "device_status_enum_old";
    `);
    await queryRunner.query(`
        CREATE TYPE "device_status_enum" AS ENUM('ASSIGNED', 'AVAILABLE', 'IN_REPAIR', 'SCRAPPED');
    `);
    await queryRunner.query(`
        UPDATE "devices"
            SET "status" = CASE
                WHEN "status" = 'HEALTHY' AND "userId" IS NULL THEN 'AVAILABLE'
                WHEN "status" = 'HEALTHY' AND "userId" IS NOT NULL THEN 'IN_REPAIR'
                ELSE "status"
            END;
    `);
    await queryRunner.query(`
        ALTER TABLE "devices"
        ALTER COLUMN "status" TYPE "device_status_enum" USING "status"::text::"device_status_enum";
    `);

    await queryRunner.query(`
        DROP TYPE "device_status_enum_old";
    `);
  }
}
