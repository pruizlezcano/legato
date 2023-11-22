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
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { glob } from 'glob';
import fs from 'fs';
import zlib from 'zlib';
import { XMLParser } from 'fast-xml-parser';
import { PrismaClient } from '@prisma/client';

const dbPath =
  process.env.NODE_ENV === 'development'
    ? './dev.db'
    : path.join(app.getPath('userData'), 'projects.db');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const processProject = async (project) => {
  console.log(`Processing ${project.fullpath()}`);

  const { name, size, mtimeMs } = project;

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

  console.log('Creating DB entry');

  const p = await prisma.project.create({
    data: {
      title: name
        .replace('.als', '')
        .replace(/\.|-|_/g, ' ')
        .trim(),
      file: name,
      path: projectFile,
      bpm,
    },
  });
  console.log("Created DB entry, let's go");

  return p;
};

const scanPath = async (projectsPath: string) => {
  console.log(`Scanning ${projectsPath}`);
  const results = await glob(`${projectsPath}/!(Backup)/*.als`, {
    stat: true,
    withFileTypes: true,
  });
  return results;
};

const fastScan = async (projectsPath: string) => {
  const projects = await prisma.project.findMany();
  const savedProjects = projects.map((i) => i.path);

  const results = await scanPath(projectsPath);

  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    const projectPath = result.fullpath();
    if (!savedProjects.includes(projectPath)) {
      // eslint-disable-next-line no-await-in-loop
      await processProject(result);
    }
    console.log(`Skipped ${projectPath}`);
  }
};

const fullScan = async (projectsPath: string) => {
  console.log('Deleting all projects');
  await prisma.project.deleteMany();
  console.log('Deleted all projects');

  const results = await scanPath(projectsPath);
  console.log(`Found ${results.length} projects`);

  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    // eslint-disable-next-line no-await-in-loop
    await processProject(result);
  }
};

ipcMain.on('scan-projects', async (event, arg) => {
  const projectsPath = '/Volumes/Expansion/Music/Beats/';
  if (arg === 'fast') {
    await fastScan(projectsPath);
  } else if (arg === 'full') {
    await fullScan(projectsPath);
  }
  event.reply('scan-projects', 'done');
});

ipcMain.on('list-projects', async (event, arg) => {
  const projects = await prisma.project.findMany();
  event.reply('list-projects', projects);
});

ipcMain.on('open-project', async (event, arg: number) => {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: arg,
      },
    });

    shell.openPath(project.path);
    return event.reply('open-project', project);
  } catch (error) {
    return event.reply('open-project', error);
  }
});

ipcMain.on('open-project-folder', async (event, arg: number) => {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: arg,
      },
    });

    shell.showItemInFolder(project.path);
    return event.reply('open-project-folder', project);
  } catch (error) {
    return event.reply('open-project-folder', error);
  }
});

ipcMain.on('update-project', async (event, arg) => {
  try {
    const project = await prisma.project.update({
      where: {
        id: arg.id,
      },
      data: {
        ...arg,
      },
    });
    return event.reply('update-project', project);
  } catch (error) {
    return event.reply('update-project', error);
  }
});

ipcMain.on('open-settings', async (event, arg) => {
  event.reply('open-settings', 'foo');
});

app.on('open-settings', () => {
  if (mainWindow) {
    mainWindow.webContents.send('open-settings');
  }
});

ipcMain.on('open-path-dialog', async (event, arg) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  console.log(result);
  if (!result.canceled) {
    return event.reply('open-path-dialog', result.filePaths[0]);
  }
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
    .catch(console.log);
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
  .then(() => {
    createWindow();
    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
