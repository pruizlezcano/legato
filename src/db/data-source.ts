import 'reflect-metadata';
import sqlite3 from 'sqlite3';
import { DataSource, Repository } from 'typeorm';
import path from 'path';
import { app } from 'electron';
import logger from '../main/logger';
import { Project, Setting, Tag } from './entity';

import { CreateDatabase1709996613942 } from './migrations/1709996613941-CreateDatabase';
import { SeedSettings1709996613942 } from './migrations/1709996613942-SeedSettings';
import { RenameDAWColumn1709996613943 } from './migrations/1709996613943-RenameDAWColumn';
import { RenameProgressValues1710065040059 } from './migrations/1710065040059-RenameProgressValues';

const dbPath =
  process.env.NODE_ENV === 'development'
    ? './src/db/dev.db'
    : path.join(app.getPath('userData'), 'legato.db');

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: dbPath,
  driver: sqlite3,
  synchronize: false,
  // logging: true,
  logger: 'advanced-console',
  entities: [Project, Setting, Tag],
  migrations: [
    CreateDatabase1709996613942,
    SeedSettings1709996613942,
    RenameDAWColumn1709996613943,
    RenameProgressValues1710065040059,
  ],
  migrationsTableName: '_migrations',
  migrationsRun: false, // Auto-run migrations
});

const initDb = async (): Promise<{
  Projects: Repository<Project>;
  Settings: Repository<Setting>;
  Tags: Repository<Tag>;
}> => {
  logger.info('Initializing database...');
  await AppDataSource.initialize();
  logger.info('Database initialized');

  logger.info('Running migrations...');
  await AppDataSource.runMigrations();
  logger.info('Migrations ran');

  const Projects = AppDataSource.getRepository(Project);
  const Settings = AppDataSource.getRepository(Setting);
  const Tags = AppDataSource.getRepository(Tag);

  return {
    Projects,
    Settings,
    Tags,
  };
};

export default initDb;
