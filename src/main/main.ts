/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { Path, glob } from 'glob';
import fs from 'fs';
import zlib from 'zlib';
import { XMLParser } from 'fast-xml-parser';
import { Repository } from 'typeorm';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import initDb from '../db/data-source';
import { Project, Setting, Tag } from '../db/entity';
import logger from './logger';

let ProjectRepository: Repository<Project>;
let SettingRepository: Repository<Setting>;
let TagRepository: Repository<Tag>;

class AppUpdater {
  constructor() {
    autoUpdater.logger = logger;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const processProject = async (project: Path, update = false) => {
  logger.info(`Processing ${project.fullpath()}`);

  const { name, mtimeMs } = project;

  const title = name
    .replace('.als', '')
    .replace(/\.|-|_/g, ' ')
    .trim();
  const projectFile = project.fullpath();
  const zippedContent = fs.readFileSync(projectFile);
  const content = zlib.gunzipSync(zippedContent).toString('utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  const jObj = parser.parse(content);
  const bpm =
    parseFloat(
      jObj?.Ableton?.LiveSet?.MasterTrack?.DeviceChain?.Mixer?.Tempo?.Manual
        ?.Value,
    ) || null;

  let p = null;

  if (update) {
    p = await ProjectRepository.findOneBy({
      path: projectFile,
    });

    if (p) {
      p.bpm = bpm !== null ? bpm : 0;
      p.modifiedAt = new Date(mtimeMs || 0);
      await ProjectRepository.save(p);
    }
    logger.info(`Updating DB entry for ${name}`);
    return p;
  }

  p = new Project();
  p.title = title;
  p.file = name;
  p.path = projectFile;
  p.bpm = bpm !== null ? bpm : 0;
  p.modifiedAt = new Date(mtimeMs || 0);
  await ProjectRepository.save(p);

  logger.info(`Created DB entry for ${projectFile}`);

  return p;
};

const scanPath = async (projectsPath: string) => {
  logger.info(`Scanning ${projectsPath}`);
  try {
    const results = await glob(`${projectsPath}/**/!(Backup)/*.als`, {
      stat: true,
      withFileTypes: true,
    });
    if (Array.isArray(results) && results.length > 0) {
      logger.info(`Found ${results.length} projects`);
      return results;
    }
    logger.warn(`No projects found in ${projectsPath}`);
    return [];
  } catch (error) {
    logger.error(`Error scanning path: ${error}`);
    return [];
  }
};

const fastScan = async (projectsPath: string) => {
  const projects = await ProjectRepository.find();
  const savedProjects = projects.map((i) => i.path);

  const results = await scanPath(projectsPath);

  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    const projectPath = result.fullpath();
    if (!savedProjects.includes(projectPath)) {
      await processProject(result);
    } else {
      logger.info(`Skipped ${projectPath}`);
    }
  }
};

const fullScan = async (projectsPath: string) => {
  const results = await scanPath(projectsPath);
  const savedProjects = await ProjectRepository.find();

  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    const projectPath = result.fullpath();
    const savedProject = savedProjects.find((i) => i.path === projectPath);
    if (savedProject) {
      // Update project
      await processProject(result, true);
    } else {
      // Create project
      await processProject(result);
    }
  }

  // Remove projects that are not in the folder anymore
  // eslint-disable-next-line no-restricted-syntax
  for (const savedProject of savedProjects) {
    const projectPath = savedProject.path;
    const result = results.find((i) => i.fullpath() === projectPath);
    if (!result) {
      const p = await ProjectRepository.findOneBy({
        id: savedProject.id,
      });
      await ProjectRepository.remove(p!);
    }
  }
};

ipcMain.on('scan-projects', async (event, arg) => {
  if (mainWindow) mainWindow.webContents.send('scan-started');
  const projectsPath = await SettingRepository.findOneBy({
    key: 'projectsPath',
  });
  try {
    if (arg === 'fast') {
      await fastScan(projectsPath!.value);
    } else if (arg === 'full') {
      const { response } = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        title: 'Full Scan',
        message: 'This may take a while, are you sure?',
      });
      if (response) await fullScan(projectsPath!.value);
    }
    event.reply('scan-projects', 'OK');
  } catch (error) {
    logger.error(`Error scanning projects: ${error}`);
    event.reply('scan-projects', error);
  }
});

ipcMain.on('list-projects', async (event) => {
  logger.info('Listing projects');
  const projects = await ProjectRepository.find({
    relations: ['tags'],
  });
  // convert tags to string array
  projects.forEach((project) => {
    if (project.tags) {
      project.tagNames = project.tags.map((tag) => tag.name);
    }
  });
  console.log(projects);

  event.reply('list-projects', projects);
});

ipcMain.on('open-project', async (event, arg: number) => {
  logger.info(`Launching project ${arg}`);
  try {
    const project = await ProjectRepository.findOneBy({
      id: arg,
    });

    shell.openPath(project!.path);
    return event.reply('open-project', project);
  } catch (error) {
    logger.error(`Error launching project: ${error}`);
    return event.reply('open-project', error);
  }
});

ipcMain.on('open-project-folder', async (event, arg: number) => {
  logger.info(`Opening project folder ${arg}`);
  try {
    const project = await ProjectRepository.findOneBy({
      id: arg,
    });

    shell.showItemInFolder(project!.path);
    return event.reply('open-project-folder', project);
  } catch (error) {
    logger.error(`Error opening project folder: ${error}`);
    return event.reply('open-project-folder', error);
  }
});

ipcMain.on('update-project', async (event, arg: Project) => {
  logger.info(`Updating project ${arg.id}`);

  try {
    const project = await ProjectRepository.findOneBy({
      id: arg.id,
    });
    if (project) {
      project.title = arg.title;
      project.genre = arg.genre;
      project.bpm = arg.bpm;
      project.tags = [];
      for (let i = 0; i < arg.tagNames!.length; i += 1) {
        let tag = await TagRepository.findOneBy({
          name: arg.tagNames![i],
        });
        console.log('tag', tag);
        if (!tag) {
          tag = new Tag();
          tag.name = arg.tagNames![i];
          await TagRepository.save(tag);
        }
        project.tags!.push(tag!);
      }
      await ProjectRepository.save(project);
      logger.info(`Project ${arg.id} updated`);
      console.log(project);

      project.tagNames = project.tags.map((tag) => tag.name);
    } else {
      logger.warn(`Project ${arg.id} not found`);
    }

    return event.reply('update-project', project);
  } catch (error) {
    logger.error(`Error updating project: ${error}`);
    return event.reply('update-project', error);
  }
});

ipcMain.on('open-settings', async (event) => {
  event.reply('open-settings', 'foo');
});

ipcMain.on('load-settings', async (event) => {
  logger.info('Loading settings');
  try {
    const settings = await SettingRepository.find();
    const settingsObj: { [key: string]: any } = {}; // Add type annotation for settingsObj

    settings.forEach((setting: Setting) => {
      settingsObj[setting.key] = setting.value;
    });
    event.reply('load-settings', settingsObj);
  } catch (error) {
    logger.error(`Error loading settings: ${error}`);
    event.reply('load-settings', error);
  }
});

ipcMain.on('save-settings', async (event, arg) => {
  logger.info('Saving settings');
  try {
    Object.entries(arg).forEach(async ([key, value]) => {
      const setting = await SettingRepository.findOneBy({
        key,
      });
      if (setting) {
        setting.value = value as string | undefined;
        await SettingRepository.save(setting);
      }
    });
    event.reply('save-settings', 'done');
  } catch (error) {
    logger.error(`Error saving settings: ${error}`);
    event.reply('save-settings', error);
  }
});

app.on('open-settings', () => {
  if (mainWindow) {
    mainWindow.webContents.send('open-settings');
  }
});

ipcMain.on('open-path-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!result.canceled) {
    return event.reply('open-path-dialog', result.filePaths[0]);
  }
  logger.warn('No path selected');
  return event.reply('open-path-dialog', null);
});

ipcMain.on('log-info', (_event, arg) => {
  logger.log('infoRender', `${arg}`);
});

ipcMain.on('log-warn', (_event, arg) => {
  logger.log('warnRender', `${arg}`);
});

ipcMain.on('log-error', (_event, arg) => {
  logger.log('errorRender', `${arg}`);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(logger.error);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
  const { Projects, Settings, Tags } = await initDb();
  ProjectRepository = Projects;
  SettingRepository = Settings;
  TagRepository = Tags;
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.

      if (mainWindow === null) createWindow();
    });
  })
  .catch(logger.error);
