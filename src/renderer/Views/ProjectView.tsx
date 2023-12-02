import { useEffect, useState, KeyboardEvent } from 'react';
import { Project } from '../../db/entity/Project';
import DebounceInput from '../Components/DebounceInput';
import Dialog from '../Components/Dialog';
import { handleOpenInAbleton, handleOpenInFinder } from '../hooks/handlers';

function ProjectView({
  project: initialProject,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [project, setProject] = useState(initialProject);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
        <DebounceInput
          value={project.title}
          onChange={(value: string) =>
            setProject((old) => ({ ...old, projectsPath: value }))
          }
          placeholder="Title..."
          className="w-11/12 ml-2 p-4 flex-grow bg-inherit text-xl font-bold focus:outline-none"
        />
        <table className="table-auto mx-4 mb-4">
          <tbody>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">BPM</td>
              <td className="px-4 py-2">{project.bpm}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-400 font-bold">Genre</td>
              <td className="px-4 py-2">
                <DebounceInput
                  value={project.genre ?? ''}
                  onChange={(value: string) =>
                    setProject((old) => ({ ...old, genre: value }))
                  }
                  placeholder="Genre..."
                  className="w-full focus:outline-none"
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
