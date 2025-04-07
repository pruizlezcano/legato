import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoStart1744048077069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "setting" ("key", "value") VALUES ('autoStart', 'false')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "setting" WHERE "key" = 'autoStart'`);
  }
}
