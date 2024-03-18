/* eslint-disable no-restricted-syntax */
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
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  protocol,
  net,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { Path, glob } from 'glob';
import fs from 'fs';
import { Repository } from 'typeorm';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import initDb from '../db/data-source';
import { Project, Setting, Tag } from '../db/entity';
import logger from './logger';
import { AbletonParser } from './abletonParser';

let ProjectRepository: Repository<Project>;
let SettingRepository: Repository<Setting>;
let TagRepository: Repository<Tag>;

class AppUpdater {
  constructor() {
    autoUpdater.logger = logger;
    autoUpdater.checkForUpdates();
  }
}

let autoUpdatErevent: any = null;

let mainWindow: BrowserWindow | null = null;

const processProject = async (project: Path, update = false) => {
  logger.info(`Processing ${project.fullpath()}`);

  const { name, mtimeMs } = project;

  const title = name
    .replace('.als', '')
    .replace(/\.|-|_/g, ' ')
    .trim();
  const projectFile = project.fullpath();
  let daw = 'Ableton Live';
  let bpm = 0;
  let tracks: any[] = [];
  try {
    const parser = new AbletonParser(projectFile);
    const parseResult = parser.parse();
    daw = parseResult.daw;
    bpm = parseResult.bpm;

    tracks = [
      ...parseResult.midiTracks,
      ...parseResult.audioTracks,
      ...parseResult.returnTracks,
    ];
  } catch (error: any) {
    logger.error(
      `Error parsing project ${projectFile}, parsing will be skipped`,
    );
    logger.error(error.message);
    if (mainWindow)
      mainWindow.webContents.send(
        'warning',
        `Error parsing project ${projectFile}, parsing will be skipped`,
      );
  }

  let p = null;

  if (update) {
    p = await ProjectRepository.findOneBy({
      path: projectFile,
    });

    if (p) {
      p.bpm = bpm !== null ? bpm : 0;
      p.daw = daw;
      p.tracks = tracks;
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
  p.daw = daw;
  p.tracks = tracks;
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
    logger.error('Error scanning path');
    logger.error(error);
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

const checkFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
};

let isScanning = false;
ipcMain.on('scan-projects', async (event, arg) => {
  if (isScanning) {
    logger.info('Scan already in progress');
    return event.reply('error', 'Scan already in progress');
  }
  isScanning = true;
  if (mainWindow) mainWindow.webContents.send('scan-started');
  const projectsPath = await SettingRepository.findOneBy({
    key: 'projectsPath',
  });
  if (!projectsPath!.value) {
    logger.error('Projects path not set');
    isScanning = false;
    return event.reply('scan-projects', 'Projects path not set');
  }
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
    isScanning = false;
    return event.reply('scan-projects', 'OK');
  } catch (error: any) {
    isScanning = false;
    logger.error('Error scanning projects');
    logger.error(error);
    return event.reply('scan-projects', error.message);
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

  event.reply('list-projects', projects);
});

ipcMain.on('open-project', async (event, arg: number) => {
  logger.info(`Launching project ${arg}`);
  try {
    const project = await ProjectRepository.findOne({
      where: { id: arg },
      relations: ['tags'],
    });
    project!.tagNames = project!.tags!.map((tag) => tag.name);
    checkFile(project!.path);
    shell.openPath(project!.path);
    project!.modifiedAt = new Date();
    await ProjectRepository.save(project!);
    event.sender.send('project-updated', project);
    return event.reply('open-project', 'OK');
  } catch (error: any) {
    logger.error('Error launching project');
    logger.error(error);
    return event.reply('error', error.message);
  }
});

ipcMain.on('open-project-folder', async (event, arg: number) => {
  logger.info(`Opening project folder ${arg}`);
  try {
    const project = await ProjectRepository.findOneBy({
      id: arg,
    });
    checkFile(project!.path);
    shell.showItemInFolder(project!.path);
    return event.reply('open-project-folder', 'OK');
  } catch (error: any) {
    logger.error('Error opening project folder');
    logger.error(error);
    return event.reply('error', error.message);
  }
});

ipcMain.on('update-project', async (event, arg: Project) => {
  logger.info(`Updating project ${JSON.stringify(arg)}`);

  try {
    const project = await ProjectRepository.findOneBy({
      id: arg.id,
    });
    if (project) {
      project.title = arg.title;
      project.genre = arg.genre;
      project.bpm = arg.bpm;
      project.tags = [];
      project.favorite = arg.favorite;
      project.hidden = arg.hidden;
      project.scale = arg.scale;
      project.notes = arg.notes;
      project.progress = arg.progress;
      project.audioFile = arg.audioFile;
      project.daw = arg.daw;
      for (let i = 0; i < arg.tagNames!.length; i += 1) {
        let tag = await TagRepository.findOneBy({
          name: arg.tagNames![i],
        });
        if (!tag) {
          tag = new Tag();
          tag.name = arg.tagNames![i];
          await TagRepository.save(tag);
        }
        project.tags!.push(tag!);
      }
      await ProjectRepository.save(project);
      logger.info(`Project ${arg.id} updated`);

      project.tagNames = project.tags.map((tag) => tag.name);
      event.sender.send('succes', `Project "${project.title}" updated`);
    } else {
      logger.warn(`Project ${arg.id} not found`);
    }
    return event.reply('update-project', project);
  } catch (error) {
    logger.error('Error updating project');
    logger.error(error);
    return event.reply('error', error);
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
  } catch (error: any) {
    logger.error('Error loading settings');
    logger.error(error);
    event.reply('error', error.message);
  }
});

ipcMain.on('save-settings', async (event, arg) => {
  logger.info(`Saving settings: ${JSON.stringify(arg)}`);
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
  } catch (error: any) {
    logger.error('Error saving settings');
    logger.error(error);
    event.reply('error', error);
  }
});

ipcMain.on('open-settings', () => {
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

ipcMain.on('get-version', (event) => {
  event.reply('get-version', app.getVersion());
});

autoUpdater.on('update-available', async (event) => {
  logger.info('There is a new version available');
  autoUpdatErevent = event;
});

autoUpdater.on('error', async (message) => {
  logger.error('There was a problem updating the application, showing dialog');
  logger.error(message);
  const { response } = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Discard', 'Go to download page'],
    title: 'Application Update',
    message: (process.platform === 'win32'
      ? autoUpdatErevent.releaseNotes
      : autoUpdatErevent.releaseName) as string,
    detail: 'There is a new version available, do you want to download it now?',
  });
  if (response === 1)
    shell.openExternal(
      'https://github.com/pruizlezcano/legato/releases/latest',
    );
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
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

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
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local',
    privileges: {
      secure: true,
      // standard: true,
      // supportFetchAPI: true,
      stream: true,
    },
  },
]);

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
    protocol.handle('local', async (request) => {
      const file = `file://${request.url.slice('local://'.length)}`;
      try {
        const response = net.fetch(file);
        return response;
      } catch (error) {
        console.error('Error handling local protocol for URL:', file, error);
        throw error;
      }
    });
    const { Projects, Settings, Tags } = await initDb();
    ProjectRepository = Projects;
    SettingRepository = Settings;
    TagRepository = Tags;
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.

      if (mainWindow === null) createWindow();
    });
  })
  .catch(logger.error);
