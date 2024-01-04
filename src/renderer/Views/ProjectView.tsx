/* eslint-disable jsx-a11y/control-has-associated-label */
import { useEffect, useState } from 'react';
import {
  faStar as faStarSolid,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Project } from '../../db/entity';
import DebounceInput from '../Components/DebounceInput';
import Dialog from '../Components/Dialog';
import {
  handleOpenInAbleton,
  handleOpenInFinder,
  handleProjectUpdate,
} from '../hooks/handlers';
import TagInput from '../Components/TagInput';
import Tooltip from '../Components/Tooltip';

function ProjectView({
  project: initialProject,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [project, setProject] = useState(initialProject);

  useEffect(() => {
    handleProjectUpdate(project);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="relative flex flex-col w-screen bg-white dark:bg-dark outline-none focus:outline-none mx-auto my-4 max-w-3xl">
      <Dialog onClose={onClose}>
        <div className="flex flex-row pr-6 pl-4 space-x-3">
          <DebounceInput
            value={project.title}
            onChange={(value: string) =>
              setProject((old) => ({ ...old, projectsPath: value }))
            }
            placeholder="Title..."
            className="w-11/12 p-4 flex-grow bg-inherit text-xl font-bold focus:outline-none"
          />
          <Tooltip message={project.hidden ? 'Unhide' : 'Hide'}>
            <button
              type="button"
              onClick={() => {
                project.hidden = !project.hidden;
                setProject(project);
              }}
            >
              <FontAwesomeIcon
                icon={project.hidden ? faEye : faEyeSlash}
                className="text-blue-500 dark:text-blue-300"
              />
            </button>
          </Tooltip>
          <Tooltip
            message={project.favorite ? 'Remove favorite' : 'Add favorite'}
          >
            <button
              type="button"
              onClick={() => {
                project.favorite = !project.favorite;
                setProject(project);
              }}
            >
              <FontAwesomeIcon
                icon={project.favorite ? faStarSolid : faStar}
                className="text-yellow-500 dark:text-yellow-300"
              />
            </button>
          </Tooltip>
        </div>
        <table className="table-auto mx-4 mb-4">
          <tbody>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">BPM</td>
              <td className="px-4 py-2">
                <DebounceInput
                  type="number"
                  value={project.bpm ?? ''}
                  onChange={(value: string) => {
                    project.bpm = parseInt(value, 10);
                    setProject(project);
                  }}
                  placeholder="BPM..."
                  className="w-16 bg-inherit focus:outline-none"
                />
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">Genre</td>
              <td className="px-4 py-2">
                <DebounceInput
                  value={project.genre ?? ''}
                  onChange={(value: string) => {
                    project.genre = value;
                    setProject((old) => ({ ...old, genre: value }));
                  }}
                  placeholder="Genre..."
                  className="w-full bg-inherit focus:outline-none"
                />
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">Tags</td>
              <td className="px-4 py-2">
                <TagInput
                  value={project.tagNames ?? []}
                  onChange={(value: string[]) => {
                    project.tagNames = value;
                    setProject(project);
                  }}
                  className="w-full bg-inherit focus:outline-none"
                />
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">Path</td>
              <td className="px-4 py-2">{project.path}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">
                Last Modified
              </td>
              <td className="px-4 py-2">{project.modifiedAt.toString()}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">Created</td>
              <td className="px-4 py-2">{project.createdAt.toString()}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">Open in</td>
              <td className="px-4 py-2">
                <span className="space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenInAbleton(project.id)}
                    className="bg-black dark:bg-white text-white dark:text-black rounded-md text-sm px-2"
                  >
                    Ableton
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenInFinder(project.id)}
                    className="bg-blue-400 text-white rounded-md text-sm px-2"
                  >
                    Finder
                  </button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    </div>
  );
}

export default ProjectView;
