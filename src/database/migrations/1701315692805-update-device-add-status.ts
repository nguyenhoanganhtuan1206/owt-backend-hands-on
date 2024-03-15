import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDeviceAddStatus1701315692805 implements MigrationInterface {
  name = 'updateDeviceAddStatus1701315692805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "device_status_enum"
          ADD VALUE IF NOT EXISTS 'IN_REPAIR';
      `);

    await queryRunner.query(`
      ALTER TYPE "device_status_enum"
        ADD VALUE IF NOT EXISTS 'SCRAPPED';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "device_status_enum"
          DROP VALUE IF EXISTS 'SCRAPPED';
      `);

    await queryRunner.query(`
        ALTER TYPE "device_status_enum"
          DROP VALUE IF EXISTS 'IN_REPAIR';
      `);
  }
}
