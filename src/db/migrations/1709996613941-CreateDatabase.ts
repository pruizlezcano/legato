import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabase1709996613942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tagTable = await queryRunner.getTable('tag');
    if (!tagTable) {
      await queryRunner.query(
        `CREATE TABLE "tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`,
      );
    }
    const projectTable = await queryRunner.getTable('project');
    if (!projectTable) {
      await queryRunner.query(
        `CREATE TABLE "project" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "file" varchar NOT NULL, "path" varchar NOT NULL, "bpm" integer NOT NULL, "title" varchar NOT NULL, "genre" varchar, "favorite" boolean NOT NULL DEFAULT (0), "hidden" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "modifiedAt" datetime NOT NULL, "scale" varchar, "notes" varchar, "progress" varchar NOT NULL DEFAULT ('to-do'), "daw" varchar NOT NULL, "tracks" json, "audioFile" varchar)`,
      );
    }
    const settingTable = await queryRunner.getTable('setting');
    if (!settingTable) {
      await queryRunner.query(
        `CREATE TABLE "setting" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "value" varchar)`,
      );
      // Seed settings
      await queryRunner.query(
        `INSERT INTO "setting" ("key", "value") VALUES ('projectsPath', NULL)`,
      );
      await queryRunner.query(
        `INSERT INTO "setting" ("key", "value") VALUES ('theme', 'system')`,
      );
    }
    const projectTagsTagTable = await queryRunner.getTable('project_tags_tag');
    if (!projectTagsTagTable) {
      await queryRunner.query(
        `CREATE TABLE "project_tags_tag" ("projectId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("projectId", "tagId"))`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "project_tags_tag"`);
    await queryRunner.query(`DROP TABLE "setting"`);
    await queryRunner.query(`DROP TABLE "project"`);
  }
}
