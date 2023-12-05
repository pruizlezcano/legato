import 'reflect-metadata';
import sqlite3 from 'sqlite3';
import { DataSource, Repository } from 'typeorm';
import path from 'path';
import { app } from 'electron';
import { Project } from './entity/Project';
import { Setting } from './entity/Setting';
import { Tag } from './entity/Tag';

const dbPath =
  process.env.NODE_ENV === 'development'
    ? './src/db/dev.db'
    : path.join(app.getPath('userData'), 'legato.db');

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: dbPath,
  driver: sqlite3,
  synchronize: true,
  // logging: true,
  logger: 'advanced-console',
  entities: [Project, Setting, Tag],
  migrations: [],
  migrationsTableName: '_migrations',
  migrationsRun: true, // Auto-run migrations
});

const seedSettings = async (SettingRepository: Repository<Setting>) => {
  const settings = await SettingRepository.find();

  const defaults = [
    {
      key: 'projectsPath',
      value: null,
    },
    {
      key: 'theme',
      value: 'system',
    },
  ];

  for (let i = 0; i < defaults.length; i += 1) {
    const setting = defaults[i];

    if (!settings.find((s: Setting) => s.key === setting.key)) {
      const newSetting = new Setting();
      newSetting.key = setting.key;
      newSetting.value = setting.value !== null ? setting.value : undefined;
      // eslint-disable-next-line no-await-in-loop
      await SettingRepository.save(newSetting);
      // eslint-disable-next-line no-await-in-loop
      await SettingRepository.save(newSetting);
    }
  }
};

const initDb = async (): Promise<{
  Projects: Repository<Project>;
  Settings: Repository<Setting>;
  Tags: Repository<Tag>;
}> => {
  await AppDataSource.initialize();

  const Projects = AppDataSource.getRepository(Project);
  const Settings = AppDataSource.getRepository(Setting);
  const Tags = AppDataSource.getRepository(Tag);
  await seedSettings(Settings);

  return {
    Projects,
    Settings,
    Tags,
  };
};

export default initDb;
