import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import Settings from './Views/SettingsView';
import Table from './Components/Table';
import { Project } from '../db/entity/Project';
import logger from './hooks/useLogger';

function Hello() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({});

  const handleList = () =>
    window.electron.ipcRenderer.sendMessage('list-projects');

  const handleFastScan = () =>
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');

  useEffect(() => {
    window.electron.ipcRenderer.on('list-projects', (arg) => {
      logger.info('updating projects list');
      setProjects(arg);
    });
    window.electron.ipcRenderer.on('scan-projects', () => {
      logger.info('projects received');
      handleList();
    });
    window.electron.ipcRenderer.on('open-settings', () => {
      setShowSettings(true);
      handleList();
    });

    window.electron.ipcRenderer.on('load-settings', (arg) => {
      logger.info('loading settings');
      setSettings(arg);
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
        <span className="ml-4 font-medium py-1 px-2 bg-gray-300 dark:bg-gray-200 rounded-full text-xs dark:text-dark">
          {projects.length} projects
        </span>
      </div>
      {showSettings ? (
        <Settings
          settings={settings}
          onClose={() => {
            setShowSettings(false);
          }}
          onSave={() => setShowSettings(false)}
        />
      ) : null}
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
