import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import Project from './Components/Project';

function Hello() {
  const [projects, setProjects] = useState([]);

  // call the ipc exposed from main process and listen for response
  useEffect(() => {
    window.electron.ipcRenderer.once('list-projects', (arg) => {
      setProjects(arg);
    });
  }, []);

  window.electron.ipcRenderer.sendMessage('list-projects');

  const handleUpdate = () =>
    window.electron.ipcRenderer.sendMessage('update-projects');

  return (
    <div className="overflow-x-auto w-full">
      <table className="mx-auto max-w-4xl w-full whitespace-nowrap rounded-lg bg-white divide-y divide-gray-300 overflow-hidden">
        <thead>
          <tr>
            <th className="font-semibold text-sm uppercase px-6 py-4 text-left">
              Title
            </th>
            <th className="font-semibold text-sm uppercase px-6 py-4 text-left">
              File
            </th>
            <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
              BPM
            </th>
            <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <Project key={project.id} project={project} />
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleUpdate}
      >
        Update
      </button>
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
