import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsView from './Views/SettingsView';
import Table from './Components/Table';
import { Project } from '../db/entity';
import logger from './hooks/useLogger';
import { Settings } from '../interfaces/Settings';
import { handleList } from './hooks/handlers';

function Hello() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({} as Settings);
  const [appVersion, setAppVersion] = useState('');

  const showScanToast = () => {
    return toast.promise(
      new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('scan-projects', (arg) => {
          if (arg !== 'OK') {
            toast.error('Error scanning projects');
            reject(arg);
          }
          logger.info('projects received');
          handleList();
          resolve(arg);
        });
      }),
      {
        loading: 'Scanning projects...',
        success: <b>Scanning completed successfully</b>,
        error: <b>Error while scanning projects</b>,
      },
    );
  };

  const handleFastScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('list-projects', (arg) => {
      logger.info('updating projects list');
      setProjects(arg as Project[]);
    });

    window.electron.ipcRenderer.on('scan-started', () => {
      showScanToast();
    });

    window.electron.ipcRenderer.on('open-settings', () => {
      setShowSettings(true);
      handleList();
    });

    window.electron.ipcRenderer.on('load-settings', (arg) => {
      logger.info('loading settings');
      setSettings(arg as Settings);
    });

    window.electron.ipcRenderer.on('error', (arg) => {
      toast.error(arg as string);
    });

    window.electron.ipcRenderer.once('get-version', (arg) => {
      setAppVersion(arg as string);
    });

    window.electron.ipcRenderer.sendMessage('load-settings');
    handleList();
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
      <div className="flex justify-start items-center p-5 pr-10">
        <h1 className="text-2xl font-bold">Legato</h1>
        <span className="ml-4 font-medium py-1 px-2 bg-gray-200 rounded-full text-xs dark:text-dark">
          {projects.length} projects
        </span>
        <button
          type="button"
          className="ml-4 font-medium py-1 px-3 bg-gray-200 rounded-full text-xs dark:text-dark"
          onClick={() => setShowSettings(true)}
        >
          <FontAwesomeIcon icon={faGear} className="pr-1" />
          Settings
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full pt-60">
          <p className="text-2xl font-bold">No projects found</p>
          <p className="text-slate-700 dark:text-text-dark">
            Check your projects folder in the settings and scan again
          </p>
          <div className="flex flex-row">
            <button
              type="button"
              className="font-medium py-1 px-2 bg-blue-100 rounded-full text-xs text-blue-800 m-1 focus:outline-none"
              onClick={() => setShowSettings(true)}
            >
              Open Settings
            </button>
            <button
              type="button"
              className="font-medium py-1 px-2 bg-green-100 rounded-full text-xs text-green-800 m-1 focus:outline-none"
              onClick={handleFastScan}
            >
              Run Fast Scan
            </button>
          </div>
        </div>
      ) : (
        <Table content={projects} />
      )}
      {showSettings ? (
        <SettingsView
          settings={settings}
          onClose={() => {
            window.electron.ipcRenderer.sendMessage('load-settings'); // reload settings
            setShowSettings(false);
          }}
          appVersion={appVersion}
        />
      ) : null}
      <Toaster
        toastOptions={{
          className:
            'bg-white dark:bg-dark-900 text-slate-700 dark:text-text-dark',
        }}
      />
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
