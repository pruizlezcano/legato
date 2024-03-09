import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDAWColumn1709996613943 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "version" TO "daw"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "daw" TO "version"`,
    );
  }
}
