import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProgressValues1710065040059 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "project" SET "progress" = REPLACE(progress,"todo","to-do") WHERE "progress" LIKE "%todo%"`,
    );
    await queryRunner.query(
      `UPDATE project SET progress = REPLACE(progress,'inProgress','in-progress') WHERE progress LIKE '%inProgress%'`,
    );
    await queryRunner.query(
      `UPDATE project SET progress = REPLACE(progress,'Finished','finished') WHERE progress LIKE '%Finished%'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE project SET progress = REPLACE(progress,'to-do','todo') WHERE progress LIKE '%to-do%'`,
    );
    await queryRunner.query(
      `UPDATE project SET progress = REPLACE(progress,'in-progress','inProgress') WHERE progress LIKE '%in-progress%'`,
    );
    await queryRunner.query(
      `UPDATE project SET progress = REPLACE(progress,'finished','Finished') WHERE progress LIKE '%finished%'`,
    );
  }
}
