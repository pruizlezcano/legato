import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabase1709996613941 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL);`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "project" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "file" varchar NOT NULL, "path" varchar NOT NULL, "bpm" integer NOT NULL, "title" varchar NOT NULL, "genre" varchar, "favorite" boolean NOT NULL DEFAULT (0), "hidden" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "modifiedAt" datetime NOT NULL, "scale" varchar, "notes" varchar, "progress" varchar NOT NULL DEFAULT ('to-do'), "daw" varchar NOT NULL, "tracks" json, "audioFile" varchar);`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "project_tags_tag" ("projectId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("projectId", "tagId"));`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "setting" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "value" varchar);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "project_tags_tag"`);
    await queryRunner.query(`DROP TABLE "setting"`);
    await queryRunner.query(`DROP TABLE "project"`);
  }
}
