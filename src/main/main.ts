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
  Menu,
  Tray,
  nativeImage,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import { Repository } from 'typeorm';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import initDb from '../db/data-source';
import { Project, Setting, Tag } from '../db/entity';
import logger from './logger';
import { ProjectScanner } from './lib/projectScanner';

let ProjectRepository: Repository<Project>;
let SettingRepository: Repository<Setting>;
let TagRepository: Repository<Tag>;
let projectScanner: ProjectScanner;

class AppUpdater {
  constructor() {
    autoUpdater.logger = logger;
    autoUpdater.checkForUpdates();
  }
}

let autoUpdatErevent: any = null;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const checkFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
};

ipcMain.on('scan-projects', async (event, arg) => {
  await projectScanner.handleScanRequest(arg, event);
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
      if (setting.value) {
        if (setting.key === 'sorting') {
          settingsObj[setting.key] = JSON.parse(setting.value);
        } else if (setting.key === 'displayedColumns') {
          settingsObj[setting.key] = setting.value.split(',');
        } else if (setting.key === 'minimizeToTray') {
          settingsObj[setting.key] = setting.value === 'true';
        } else {
          settingsObj[setting.key] = setting.value;
        }
      }
    });
    event.reply('load-settings', settingsObj);
  } catch (error: any) {
    logger.error('Error loading settings');
    logger.error(error);
    event.reply('error', error.message);
  }
});

const scheduleBackgroundScan = async () => {
  try {
    const cronSetting = await SettingRepository.findOneBy({
      key: 'scanSchedule',
    });

    const projectsPathSetting = await SettingRepository.findOneBy({
      key: 'projectsPath',
    });

    if (cronSetting?.value && projectsPathSetting?.value) {
      logger.info(
        `Setting up scheduled scan with cron: ${cronSetting.value.trim()}`,
      );
      projectScanner.scheduleBackgroundScan(
        cronSetting.value.trim(),
        projectsPathSetting.value,
      );
    } else {
      logger.info('Scheduled scanning not configured');
    }
  } catch (error) {
    logger.error('Error setting up scheduled scan');
    logger.error(error);
  }
};

ipcMain.on('save-settings', async (event, arg) => {
  logger.info(`Saving settings: ${JSON.stringify(arg)}`);
  try {
    let scanScheduleChanged = false;
    let projectsPathChanged = false;

    Object.entries(arg).forEach(async ([key, value]) => {
      const setting = await SettingRepository.findOneBy({
        key,
      });
      if (setting) {
        if (key === 'sorting') {
          setting.value = JSON.stringify(value);
        } else if (key === 'displayedColumns') {
          setting.value = (value as string[]).join(',');
        } else if (key === 'minimizeToTray') {
          setting.value = value ? 'true' : 'false';
        } else {
          setting.value = value as string | undefined;
        }

        if (key === 'scanSchedule') {
          scanScheduleChanged = true;
        }

        if (key === 'projectsPath') {
          projectsPathChanged = true;
        }

        await SettingRepository.save(setting);
        // Restart scheduler if relevant settings changed
        if (scanScheduleChanged || projectsPathChanged) {
          scheduleBackgroundScan();
        }
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
      app.dock?.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    projectScanner.setMainWindow(null);
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
  projectScanner.setMainWindow(mainWindow);
};

const createTray = () => {
  const icon =
    process.platform === 'darwin'
      ? getAssetPath('menuTemplate.png')
      : getAssetPath('icons', '16x16.png');
  const trayIcon = nativeImage.createFromPath(icon);

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Legato',
      click: () => {
        if (!mainWindow) {
          createWindow();
        }
        mainWindow?.show();
      },
    },
    {
      label: 'Scan Projects',
      submenu: [
        {
          label: 'Fast Scan',
          click: () => {
            projectScanner.handleScanRequest('fast');
          },
        },
        {
          label: 'Full Scan',
          click: () => {
            projectScanner.handleScanRequest('full');
          },
        },
      ],
    },
    {
      label: 'Settings',
      accelerator: 'Command+,',
      click: async () => {
        if (!mainWindow) {
          await createWindow();

          // Wait for the window to be ready before sending the event
          mainWindow!.once('ready-to-show', () => {
            mainWindow?.show();
            mainWindow?.webContents.send('open-settings');
          });
        } else {
          // If window exists but is hidden, show it
          if (!mainWindow.isVisible()) {
            mainWindow.show();
            if (process.platform === 'darwin') app.dock?.show();
          }

          // If window is already loaded, send the event directly
          if (mainWindow.webContents.isLoading()) {
            // Wait for window to finish loading if it's still loading
            mainWindow.webContents.once('did-finish-load', () => {
              mainWindow?.webContents.send('open-settings');
            });
          } else {
            // Window is ready, send event immediately
            mainWindow.webContents.send('open-settings');
          }
        }
      },
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
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

app.on('window-all-closed', async () => {
  const minimizeToTraySetting = await SettingRepository.findOneBy({
    key: 'minimizeToTray',
  });
  const minimizeToTray = minimizeToTraySetting?.value === 'true';

  if (minimizeToTray && !tray) {
    createTray();
  }

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    if (!minimizeToTray) app.quit();
  } else if (minimizeToTray) app.dock!.hide();
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
    projectScanner = new ProjectScanner(
      ProjectRepository,
      SettingRepository,
      mainWindow,
    );

    scheduleBackgroundScan();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.

      if (mainWindow === null) createWindow();
    });
  })
  .catch(logger.error);
