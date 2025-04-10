/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import path from 'path';
import fs from 'fs';
import { Path, glob } from 'glob';
import { Repository } from 'typeorm';
import Electron, { dialog, Notification } from 'electron';
import { CronJob } from 'cron';
import { Project, Setting } from '../../db/entity';
import logger from '../logger';
import { AbletonParser } from './abletonParser';

// eslint-disable-next-line import/prefer-default-export
export class ProjectScanner {
  private projectRepository: Repository<Project>;

  private settingRepository: Repository<Setting>;

  private mainWindow: Electron.BrowserWindow | null;

  private isScanning: boolean = false;

  private scheduledScanJob: CronJob | null = null;

  constructor(
    projectRepository: Repository<Project>,
    settingRepository: Repository<Setting>,
    mainWindow: Electron.BrowserWindow | null,
  ) {
    this.projectRepository = projectRepository;
    this.settingRepository = settingRepository;
    this.mainWindow = mainWindow;
  }

  private async processProject(project: Path, update = false) {
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
      logger.warn(
        `Error parsing project ${projectFile}, parsing will be skipped`,
      );
      logger.warn(error.message);
      if (this.mainWindow)
        this.mainWindow.webContents.send(
          'warning',
          `Error parsing project ${projectFile}, parsing will be skipped`,
        );
    }

    // look for audio file
    const audioFiles = await glob(
      `${path.dirname(projectFile)}/**/${name.replace('.als', '')}.{wav,mp3,flac}`,
    );

    let audioFile = audioFiles[0];

    if (!audioFile) {
      // audio file is the newest file in the project folder
      const files = await glob(`${path.dirname(projectFile)}/*.{wav,mp3,flac}`);
      const fileStats = await Promise.all(
        files.map((f) => fs.promises.stat(f)),
      );
      const sortedFiles = files.sort((a, b) => {
        const statA = fileStats[files.indexOf(a)];
        const statB = fileStats[files.indexOf(b)];
        return statA.mtimeMs - statB.mtimeMs;
      });
      audioFile = sortedFiles[sortedFiles.length - 1];
    }
    if (audioFile) logger.info(`Found audio file: ${audioFile}`);

    let p = null;

    if (update) {
      p = await this.projectRepository.findOneBy({
        path: projectFile,
      });

      if (p) {
        p.bpm = bpm ?? 0;
        p.daw = daw;
        p.tracks = tracks;
        p.modifiedAt = new Date(mtimeMs || 0);
        p.audioFile = audioFile ?? null;
        await this.projectRepository.save(p);
      }
      logger.info(`Updating DB entry for ${name}`);
      return p;
    }

    p = new Project();
    p.title = title;
    p.file = name;
    p.path = projectFile;
    p.bpm = bpm ?? 0;
    p.daw = daw;
    p.tracks = tracks;
    p.audioFile = audioFile ?? null;
    p.modifiedAt = new Date(mtimeMs || 0);
    await this.projectRepository.save(p);

    logger.info(`Created DB entry for ${projectFile}`);

    return p;
  }

  private async scanPath(projectsPath: string) {
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
  }

  private async fastScan(projectsPath: string) {
    const projects = await this.projectRepository.find();
    const savedProjects = projects.map((i) => i.path);

    const results = await this.scanPath(projectsPath);

    for (const result of results) {
      const projectPath = result.fullpath();
      if (!savedProjects.includes(projectPath)) {
        await this.processProject(result);
      } else {
        logger.info(`Skipped ${projectPath}`);
      }
    }
  }

  private async fullScan(projectsPath: string) {
    const results = await this.scanPath(projectsPath);
    const savedProjects = await this.projectRepository.find();

    for (const result of results) {
      const projectPath = result.fullpath();
      const savedProject = savedProjects.find((i) => i.path === projectPath);
      if (savedProject) {
        // Update project
        await this.processProject(result, true);
      } else {
        // Create project
        await this.processProject(result);
      }
    }

    // Remove projects that are not in the folder anymore
    for (const savedProject of savedProjects) {
      const projectPath = savedProject.path;
      const result = results.find((i) => i.fullpath() === projectPath);
      if (!result) {
        const p = await this.projectRepository.findOneBy({
          id: savedProject.id,
        });
        await this.projectRepository.remove(p!);
      }
    }
  }

  isCurrentlyScanning() {
    return this.isScanning;
  }

  setScanning(value: boolean) {
    this.isScanning = value;
  }

  setMainWindow(window: Electron.BrowserWindow | null) {
    this.mainWindow = window;
  }

  scheduleBackgroundScan(cronExpression: string, projectsPath: string) {
    if (this.scheduledScanJob) {
      this.scheduledScanJob.stop();
      this.scheduledScanJob = null;
    }

    if (!cronExpression || cronExpression.trim() === '') {
      logger.info('No cron expression provided, background scan disabled');
      return;
    }

    try {
      this.scheduledScanJob = new CronJob(
        cronExpression,
        async () => {
          logger.info('Running scheduled background scan');

          if (!this.isScanning) {
            this.setScanning(true);

            if (this.mainWindow) {
              this.mainWindow.webContents.send('scan-started');
            }

            try {
              await this.fastScan(projectsPath);
              logger.info('Scheduled background scan completed');
              if (this.mainWindow) {
                this.mainWindow.webContents.send('scan-projects', 'OK');
              }
            } catch (error) {
              logger.error('Error during scheduled background scan');
              logger.error(error);
              if (this.mainWindow) {
                this.mainWindow.webContents.send(
                  'scan-projects',
                  (error as Error).message || 'Unknown error',
                );
              }
            } finally {
              this.setScanning(false);
            }
          } else {
            logger.info(
              'Skipping scheduled scan as another scan is in progress',
            );
          }
        },
        null,
        true,
      );

      const nextRun = this.scheduledScanJob.nextDate();
      logger.info(`Next background scan scheduled at ${nextRun.toISO()}`);
    } catch (error) {
      logger.error(`Invalid cron expression: ${cronExpression}`);
      logger.error(error);
    }
  }

  stopScheduledScan() {
    if (this.scheduledScanJob) {
      this.scheduledScanJob.stop();
      this.scheduledScanJob = null;
      logger.info('Background scan scheduling stopped');
    }
  }

  async handleScanRequest(
    arg: 'fast' | 'full',
    event: Electron.IpcMainEvent | null = null,
  ): Promise<void> {
    if (this.isCurrentlyScanning()) {
      logger.info('Scan already in progress');
      if (event) {
        event.reply('error', 'Scan already in progress');
      }
      return;
    }

    this.setScanning(true);
    if (this.mainWindow) this.mainWindow.webContents.send('scan-started');

    try {
      const projectsPath = await this.settingRepository.findOneBy({
        key: 'projectsPath',
      });

      if (!projectsPath?.value) {
        throw new Error('Projects path not set');
      }
      // check if the projects path is a valid directory
      if (!fs.existsSync(projectsPath.value)) {
        throw new Error('Projects path is not a valid directory');
      }
      if (arg === 'fast') {
        await this.fastScan(projectsPath.value);
      } else if (arg === 'full') {
        const { response } = await dialog.showMessageBox({
          type: 'warning',
          buttons: ['Cancel', 'OK'],
          defaultId: 1,
          title: 'Full Scan',
          message: 'This may take a while, are you sure?',
        });
        if (response) {
          await this.fullScan(projectsPath.value);
        } else {
          logger.info('Full scan cancelled by user');
          this.setScanning(false);
          if (event) {
            event.reply('scan-projects', 'Scan cancelled by user');
          }
          return;
        }
      }

      this.setScanning(false);
      if (event) {
        event.reply('scan-projects', 'OK');
      }
      // Show success notification if no event (called from tray)
      if (!event && arg === 'fast') {
        new Notification({
          title: 'Scan Completed',
          body: 'Fast scan completed',
        }).show();
        if (this.mainWindow)
          this.mainWindow.webContents.send('scan-projects', 'OK');
      }
    } catch (error: any) {
      this.setScanning(false);
      logger.error('Error scanning projects');
      logger.error(error.message);
      if (event) {
        event.reply('scan-projects', error.message);
      }
      // Show error notification if no event (called from tray)
      if (!event) {
        new Notification({
          title: 'Scan Error',
          body: error.message,
        }).show();
        if (this.mainWindow)
          this.mainWindow.webContents.send('scan-projects', error.message);
      }
    }
  }

  async shouldQuit(): Promise<boolean> {
    if (this.isCurrentlyScanning()) {
      const { response } = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Cancel', 'Quit Anyway'],
        defaultId: 0,
        title: 'Scan in Progress',
        message:
          'A project scan is currently in progress. Quitting now may interrupt the scan.',
      });
      return response === 1;
    }
    return true;
  }
}
