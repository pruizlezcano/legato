import { useState } from 'react';
import abletonIcon from '../../../assets/ableton-icon.svg';
import Tooltip from './Tooltip';

const Project = ({ project }) => {
  const [title, setTitle] = useState(project.title ? project.title : '');
  const [bpm, setBpm] = useState(project.bpm);

  const handleOpenInAbleton = () =>
    window.electron.ipcRenderer.sendMessage('open-project', project.id);

  const handleOpenInFinder = () =>
    window.electron.ipcRenderer.sendMessage('open-project-folder', project.id);

  const handleProjectUpdate = () => {
    window.electron.ipcRenderer.sendMessage('update-project', {
      ...project,
      title,
      bpm,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <tr>
      <td className="px-6 py-4">
        <input
          type="text"
          value={title}
          className="outline outline-0 transition-all focus:border-b focus:border-pink-500 focus:outline-0 disabled:border-0"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleProjectUpdate}
          onKeyDown={handleKeyDown}
        />
      </td>
      <td className="px-6 py-4">
        <Tooltip message={project.path}>
          <p className="cursor-pointer" onClick={handleOpenInFinder}>
            {project.file}
          </p>
        </Tooltip>
      </td>
      <td className="px-6 py-4 text-center">
        <input
          type="number"
          value={bpm}
          className="w-20 text-center transition-all focus:border-b focus:border-pink-500 focus:outline-0 disabled:border-0"
          onChange={(e) => setBpm(parseInt(e.target.value))}
          onBlur={() => handleProjectUpdate()}
          onKeyDown={handleKeyDown}
        />
      </td>
      <td className="px-6 py-4 text-center">Active</td>
      <td className="px-6 py-4 text-center">
        <Tooltip message={'Open in Ableton'}>
          <img
            src={abletonIcon}
            alt="Open ina Ableton"
            onClick={handleOpenInAbleton}
            className="cursor-pointer"
            width={52}
          />
        </Tooltip>
      </td>
    </tr>
  );
};

export default Project;
