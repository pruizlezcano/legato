/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import path from 'path';
import fs from 'fs';
import { Path, glob } from 'glob';
import { Repository } from 'typeorm';
import Electron from 'electron';
import { CronJob } from 'cron';
import { Project } from '../../db/entity';
import logger from '../logger';
import { AbletonParser } from './abletonParser';

// eslint-disable-next-line import/prefer-default-export
export class ProjectScanner {
  private projectRepository: Repository<Project>;

  private mainWindow: Electron.BrowserWindow | null;

  private isScanning: boolean = false;

  private scheduledScanJob: CronJob | null = null;

  constructor(
    projectRepository: Repository<Project>,
    mainWindow: Electron.BrowserWindow | null,
  ) {
    this.projectRepository = projectRepository;
    this.mainWindow = mainWindow;
  }

  async processProject(project: Path, update = false) {
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
    let audioFile = glob.sync(
      `${path.dirname(projectFile)}/**/${name.replace('.als', '')}.{wav,mp3,flac}`,
    )[0];

    if (!audioFile) {
      // audio file is the newest file in the project folder
      const files = glob.sync(`${path.dirname(projectFile)}/*.{wav,mp3,flac}`);
      const sortedFiles = files.sort((a, b) => {
        const statA = fs.statSync(a);
        const statB = fs.statSync(b);
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

  async scanPath(projectsPath: string) {
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

  async fastScan(projectsPath: string) {
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

  async fullScan(projectsPath: string) {
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
}
