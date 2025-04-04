import { MigrationInterface, QueryRunner } from 'typeorm';

export class MinimizeToTray1743684245136 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "setting" ("key", "value") VALUES ('minimizeToTray', 'false')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting" WHERE "key" = 'minimizeToTray'`,
    );
  }
}
