import { useState, useEffect, KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Settings } from '@prisma/client';

import Dialog from '../Components/Dialog';
import Tooltip from '../Components/Tooltip';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

function SettingsView({ onClose, onSave }) {
  const [settings, setSettings] = useState({ projectsPath: '' });

  const handleFastScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');
  };

  const handleFullScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'full');
  };

  const handleSave = () => {
    onSave();
    window.electron.ipcRenderer.sendMessage('save-settings', settings);
  };

  useEffect(() => {
    window.electron.ipcRenderer.once('load-settings', (arg: Settings) => {
      setSettings(arg);
    });
    window.electron.ipcRenderer.sendMessage('load-settings');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.electron.ipcRenderer.on('open-path-dialog', (arg) => {
      setSettings((old) => ({ ...old, projectsPath: arg }));
    });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <Dialog>
      <div className="relative flex flex-col w-screen bg-white outline-none focus:outline-none mx-auto my-4 max-w-3xl">
        {/* header */}
        <div className="flex items-start justify-between pl-5 border-b pb-4">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        {/* body */}
        <div className="flex flex-col relative p-6">
          <div className="flex flox-row border-b pb-6 align-middle">
            <p className="w-fit pr-2">Projects folder:</p>
            <input
              type="text"
              className="flex-grow bg-transparent border-b outline-none text-slate-700"
              placeholder="Search"
              value={settings.projectsPath}
              onChange={(e) =>
                setSettings((old) => ({ ...old, projectsPath: e.target.value }))
              }
              style={{ transition: 'all .15s ease' }}
            />
            <Tooltip message="Open folder">
              <button
                type="button"
                className="text-gray-500"
                onClick={() =>
                  window.electron.ipcRenderer.sendMessage('open-path-dialog')
                }
              >
                <FontAwesomeIcon icon={faFolderOpen} />
              </button>
            </Tooltip>
            <hr />
          </div>
          <div className="flex flex-col">
            <p className="mt-4 mb-2">Scan projects:</p>
            <p className="text-slate-700">
              <button
                type="button"
                className="font-medium py-1 px-2 bg-blue-100 rounded-full text-xs text-blue-800 mr-2 focus:outline-none"
                onClick={handleFastScan}
              >
                <FontAwesomeIcon icon={faArrowRight} className="pr-1" />
                Fast Scan
              </button>
              Search for new projects.
            </p>
            <p className="text-slate-700">
              <button
                type="button"
                className="cursor-pointer font-medium py-1 px-2 bg-red-100 rounded-full text-xs text-red-800 mr-2 focus:outline-none"
                onClick={handleFullScan}
              >
                <FontAwesomeIcon icon={faArrowRight} className="pr-1" />
                Full Scan
              </button>
              Performs a comprehensive scan of all projects. This may take
              longer than the Fast Scan, but it will be more thorough.
            </p>
          </div>
        </div>
        {/* footer */}
        <div className="flex items-center justify-end pt-4 pr-4 border-t border-solid border-blueGray-200 rounded-b">
          <button
            className="text-red-600 background-transparent font-semibold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default SettingsView;
