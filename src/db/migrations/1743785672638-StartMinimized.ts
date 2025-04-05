import { MigrationInterface, QueryRunner } from 'typeorm';

export class StartMinimized1743785672638 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "setting" ("key", "value") VALUES ('startMinimized', 'false')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting" WHERE "key" = 'startMinimized'`,
    );
  }
}
