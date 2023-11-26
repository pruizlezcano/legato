import sqlite3 from 'sqlite3';
import { DataSource, Repository } from 'typeorm';
import { Project } from './entity/Project';
import { Setting } from './entity/Setting';

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

    if (
      !settings.find(
        (s: Setting) => s.key === setting.key && s.value === setting.value,
      )
    ) {
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

const initDb = async (
  dbPath: string,
): Promise<{
  Projects: Repository<Project>;
  Settings: Repository<Setting>;
}> => {
  const AppDataSource = new DataSource({
    type: 'sqlite',
    database: dbPath,
    driver: sqlite3,
    synchronize: true,
    logging: true,
    entities: [Project, Setting],
    migrations: [],
    subscribers: [],
  });

  await AppDataSource.initialize();

  const Projects = AppDataSource.getRepository(Project);
  const Settings = AppDataSource.getRepository(Setting);

  await seedSettings(Settings);

  return {
    Projects,
    Settings,
  };
};

export default initDb;
