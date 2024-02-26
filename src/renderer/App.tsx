/* eslint-disable jsx-a11y/click-events-have-key-events */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { DataTableFilterCommand } from '@/Components/datatable/data-table-filter-command';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';
import { Toaster } from '@/Components/ui/sonner';
import ProjectsTable from '@/Components/ProjectsTable';
import { LoadingSpinner } from '@/Components/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import { useSelector, useDispatch } from 'react-redux';
import { selectSettings, loadSettings } from '@/store/Slices/settingsSlice';
import {
  selectAppState,
  setScanInProgress,
  setShowSettings,
  setFilter,
} from '@/store/Slices/appStateSlice';
import {
  loadProjects,
  selectProjects,
  loadProject,
} from '@/store/Slices/projectsSlice';
import { SettingsView, SettingsButton } from './Views/SettingsView';
import { Project } from '../db/entity';
import logger from './hooks/useLogger';
import { Settings } from '../interfaces/Settings';
import { handleList } from './hooks/handlers';
import { AudioPlayer } from './Components/ui/audio-player';

function Hello() {
  const [appVersion, setAppVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const settings = useSelector(selectSettings);
  const projects = useSelector(selectProjects);
  const appState = useSelector(selectAppState);

  const dispatch = useDispatch();

  const showScanToast = () => {
    return toast.promise(
      new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('scan-projects', (arg) => {
          if (arg !== 'OK') {
            reject(arg);
          }
          logger.info('projects received');
          handleList();
          resolve(arg);
        });
      }),
      {
        loading: (
          <>
            <LoadingSpinner />
            <b>Scanning projects...</b>
          </>
        ),
        success: <b>Scanning completed successfully</b>,
        // eslint-disable-next-line react/no-unstable-nested-components
        error: (err) => {
          return (
            <div className="group-[.toaster]:text-destructive-foreground">
              <b>Error while scanning projects</b>
              <p>{err}</p>
            </div>
          );
        },
      },
    );
  };

  const handleFastScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('load-settings', (arg) => {
      logger.info('loading settings');
      dispatch(loadSettings(arg as Settings));
    });

    window.electron.ipcRenderer.on('list-projects', (arg) => {
      logger.info('updating projects list');
      dispatch(loadProjects(arg as Project[]));
      dispatch(setScanInProgress(false));
      setLoading(false);
    });

    window.electron.ipcRenderer.on('project-updated', (arg) => {
      dispatch(loadProject(arg as Project));
    });
  }, [dispatch]);

  useEffect(() => {
    window.electron.ipcRenderer.on('open-settings', () => {
      dispatch(setShowSettings(true));
    });

    window.electron.ipcRenderer.on('scan-started', () => {
      dispatch(setScanInProgress(true));
      showScanToast();
    });

    window.electron.ipcRenderer.on('error', (arg) => {
      toast.error('Error', {
        description: arg as string,
      });
    });

    window.electron.ipcRenderer.once('get-version', (arg) => {
      setAppVersion(arg as string);
    });

    window.electron.ipcRenderer.sendMessage('load-settings');
    handleList();
    window.electron.ipcRenderer.sendMessage('get-version');
  }, [dispatch]);

  useEffect(() => {
    if (
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  return (
    <div className="flex w-full flex-wrap overflow-x-auto dark:text-white">
      <div className="mx-6 my-4 flex select-none items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={() => dispatch(setFilter(''))}>
                <h1 className="text-3xl font-bold tracking-tight xl:text-4xl">
                  Legato
                </h1>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset search filter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="ml-2 flex space-x-2">
          <Badge variant="outline">v{appVersion}</Badge>
          <Badge variant="outline">{projects.length} projects loaded</Badge>
        </div>
        <div className="absolute right-0 top-0 mr-6 mt-4 flex items-center space-x-2">
          <DataTableFilterCommand />
          <SettingsButton onClick={() => dispatch(setShowSettings(true))} />
        </div>
      </div>
      {loading ? (
        <div className="flex w-full flex-col items-center justify-center pt-60">
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center pt-60">
          <p className="text-2xl font-bold">No projects found</p>
          <p className="text-muted-foreground mb-6">
            Check your projects folder and scan again
          </p>
          <div className="flex flex-row space-x-3">
            <Button onClick={() => dispatch(setShowSettings(true))}>
              Open Settings
            </Button>
            <Button
              variant="secondary"
              onClick={handleFastScan}
              disabled={appState.scanInProgress}
            >
              Run Fast Scan
            </Button>
          </div>
        </div>
      ) : (
        <ProjectsTable />
      )}
      <SettingsView />
      {appState.showAudioPlayer && <AudioPlayer />}
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
