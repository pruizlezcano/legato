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
  loadProjects,
  selectProjects,
  loadProject,
} from '@/store/Slices/projectsSlice';
import { SettingsView, SettingsButton } from './Views/SettingsView';
import { Project } from '../db/entity';
import logger from './hooks/useLogger';
import { Settings } from '../interfaces/Settings';
import { handleList } from './hooks/handlers';

function Hello() {
  const [showSettings, setShowSettings] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [filter, setFilter] = useState('');
  const [scanInProgress, setScanInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const settings = useSelector(selectSettings);
  const projects = useSelector(selectProjects);

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
      setScanInProgress(false);
      setLoading(false);
    });

    window.electron.ipcRenderer.on('project-updated', (arg) => {
      dispatch(loadProject(arg as Project));
    });
  }, [dispatch]);

  useEffect(() => {
    window.electron.ipcRenderer.on('scan-started', () => {
      setScanInProgress(true);
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
  }, []);

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
    <div className="overflow-x-auto w-full flex flex-wrap dark:text-white">
      <div className="flex items-center my-4 mx-6 justify-between select-none">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={() => setFilter('')}>
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
        <div className="flex space-x-2 ml-2">
          <Badge variant="outline">v{appVersion}</Badge>
          <Badge variant="outline">{projects.length} projects loaded</Badge>
        </div>
        <div className="absolute right-0 top-0 mt-4 mr-6 flex items-center space-x-2">
          <DataTableFilterCommand value={filter} onEnter={setFilter} />
          <SettingsButton onClick={() => setShowSettings(true)} />
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full pt-60">
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full pt-60">
          <p className="text-2xl font-bold">No projects found</p>
          <p className="mb-6 text-muted-foreground">
            Check your projects folder and scan again
          </p>
          <div className="flex flex-row space-x-3">
            <Button onClick={() => setShowSettings(true)}>Open Settings</Button>
            <Button
              variant="secondary"
              onClick={handleFastScan}
              disabled={scanInProgress}
            >
              Run Fast Scan
            </Button>
          </div>
        </div>
      ) : (
        <ProjectsTable filter={filter} />
      )}
      <SettingsView
        onClose={() => setShowSettings(false)}
        open={showSettings}
        scanDisabled={scanInProgress}
      />
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
