import { MigrationInterface, QueryRunner } from 'typeorm';

export class TableState1729347610722 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "setting" ("key", "value") VALUES ('displayedColumns', 'title,bpm,scale,genre,tags,progress,modified,created')`,
    );
    await queryRunner.query(
      `INSERT INTO "setting" ("key", "value") VALUES ('pageSize', 10)`,
    );
    await queryRunner.query(
      `INSERT INTO "setting" ("key", "value") VALUES ('sorting', '{"id": "title", "desc": true}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting" WHERE "key" = 'displayedColumns'`,
    );
    await queryRunner.query(`DELETE FROM "setting" WHERE "key" = 'pageSize'`);
    await queryRunner.query(`DELETE FROM "setting" WHERE "key" = 'sorting'`);
  }
}
