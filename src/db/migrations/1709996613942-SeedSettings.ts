import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSettings1709996613942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const projectsPath = await queryRunner.query(
      `SELECT * FROM "setting" WHERE "key" = 'projectsPath'`,
    );

    if (!projectsPath || !projectsPath.length) {
      await queryRunner.query(
        `INSERT INTO "setting" ("key", "value") VALUES ('projectsPath', NULL)`,
      );
    }
    const theme = await queryRunner.query(
      `SELECT * FROM "setting" WHERE "key" = 'theme'`,
    );
    if (!theme || !theme.length) {
      await queryRunner.query(
        `INSERT INTO "setting" ("key", "value") VALUES ('theme', 'system')`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting" WHERE "key" = 'projectsPath'`,
    );
    await queryRunner.query(`DELETE FROM "setting" WHERE "key" = 'theme'`);
  }
}
