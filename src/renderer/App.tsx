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
    <div className="overflow-x-auto w-full">
      <h1 className="text-4xl font-bold text-center">Ableton Projects</h1>
      <h2 className="text-2xl font-bold text-center">
        {projects.length} projects found
      </h2>
      <div className="flex justify-center">
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() =>
            window.electron.ipcRenderer.sendMessage('open-settings')
          }
        >
          Settings
        </button>
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
