import 'reflect-metadata';
import sqlite3 from 'sqlite3';
import { DataSource, Repository } from 'typeorm';
import path from 'path';
import { app } from 'electron';
import logger from '../main/logger';
import { Project, Setting, Tag } from './entity';

import { CreateDatabase1709996613941 } from './migrations/1709996613941-CreateDatabase';
import { SeedSettings1709996613942 } from './migrations/1709996613942-SeedSettings';
import { TableState1729347610722 } from './migrations/1729347610722-TableState';
import { BackgroundScan1743608773462 } from './migrations/1743608773462-BackgroundScan';
import { MinimizeToTray1743684245136 } from './migrations/1743684245136-MinimizeToTray';
import { StartMinimized1743785672638 } from './migrations/1743785672638-StartMinimized';
import { AutoStart1744048077069 } from './migrations/1744048077069-AutoStart';

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
    CreateDatabase1709996613941,
    SeedSettings1709996613942,
    TableState1729347610722,
    BackgroundScan1743608773462,
    MinimizeToTray1743684245136,
    StartMinimized1743785672638,
    AutoStart1744048077069,
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
