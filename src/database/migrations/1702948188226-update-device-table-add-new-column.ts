import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDeviceTableAddNewColumn1702948188226
  implements MigrationInterface
{
  name = 'updateDeviceTableAddNewColumn1702948188226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "device_owners"
        (
            "id"         SERIAL PRIMARY KEY,
            "name"       VARCHAR(100) NOT NULL,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`
        ALTER TABLE "devices"
            ADD COLUMN "owner_id"      INT,
            ADD COLUMN "code"          TEXT UNIQUE,
            ADD COLUMN "purchased_at"  TIMESTAMP DEFAULT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "devices"
            ADD CONSTRAINT "fk_devices_device_owner" FOREIGN KEY ("owner_id") REFERENCES "device_owners" ("id") ON DELETE RESTRICT
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "devices"
        DROP CONSTRAINT "fk_devices_device_owner"
    `);
    await queryRunner.query(`
      ALTER TABLE "devices"
        DROP COLUMN "owner_id",
        DROP COLUMN "code",
        DROP COLUMN "purchased_at"
    `);
    await queryRunner.query(`
      DROP TABLE "device_owners"
    `);
  }
}
