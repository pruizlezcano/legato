import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { Project } from '@prisma/client';
import Settings from './Views/Settings';
import Table from './Components/Table';

function Hello() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const handleList = () =>
    window.electron.ipcRenderer.sendMessage('list-projects');

  useEffect(() => {
    window.electron.ipcRenderer.on('list-projects', (arg: Project[]) => {
      setProjects(arg);
    });
    window.electron.ipcRenderer.on('open-settings', () => {
      setShowSettings(true);

      handleList();
    });
    handleList();
  }, []);

  return (
    <div className="overflow-x-auto w-full flex flex-wrap">
      <div className="flex justify-start items-center p-5 pr-10">
        <h1 className="text-xl font-bold text-center">Ableton Projects</h1>
        <span className="ml-4 font-medium py-1 px-2 bg-blue-100 rounded-full text-xs text-blue-800">
          {projects.length} projects
        </span>
      </div>
      {showSettings ? (
        <Settings
          onClose={() => {
            setShowSettings(false);
          }}
          onSave={() => setShowSettings(false)}
        />
      ) : null}
      <Table content={projects} />
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
