import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackgroundScan1743608773462 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "setting" ("key", "value") VALUES ('scanSchedule', '0 * * * *')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting" WHERE "key" = 'scanSchedule'`,
    );
  }
}
